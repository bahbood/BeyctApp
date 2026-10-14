// app/(newsPaper)/(AgenciesManagement)/lib/newsObjectStorage.ts
// Minimal S3 Signature Version 4 client for Neon Object Storage.
// Neon Object Storage uses path-style addressing: <endpoint>/<bucket>/<key>.

import 'server-only'
import { createHash, createHmac } from 'crypto'

const sha256 = (value: string | Uint8Array) =>
  createHash('sha256').update(value).digest('hex')

const hmac = (key: string | Buffer, value: string) =>
  createHmac('sha256', key).update(value).digest()

function awsEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

type StorageConfig = {
  endpoint: URL
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucket: string
}

function getStorageConfig(): StorageConfig {
  const endpointValue = process.env.AWS_ENDPOINT_URL_S3
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION
  const bucket = process.env.AWS_S3_BUCKET

  if (!endpointValue || !accessKeyId || !secretAccessKey || !region || !bucket) {
    throw new Error('Neon Object Storage environment variables are not fully configured')
  }

  const endpoint = new URL(endpointValue)
  if (endpoint.protocol !== 'https:') {
    throw new Error('Neon Object Storage endpoint must use HTTPS')
  }
  if (endpoint.search || endpoint.hash || endpoint.username || endpoint.password) {
    throw new Error('Neon Object Storage endpoint URL is invalid')
  }

  return { endpoint, accessKeyId, secretAccessKey, region, bucket }
}

export function isNewsObjectStorageConfigured(): boolean {
  return Boolean(
    process.env.AWS_ENDPOINT_URL_S3 &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET,
  )
}

function objectUrl(config: StorageConfig, key: string): URL {
  const url = new URL(config.endpoint.toString())
  const basePath = url.pathname.replace(/\\/+$/, '')
  const encodedKey = key.split('/').map(awsEncode).join('/')
  url.pathname = `${basePath}/${awsEncode(config.bucket)}/${encodedKey}`
  url.search = ''
  url.hash = ''
  return url
}

async function signedRequest(
  method: 'GET' | 'PUT' | 'DELETE',
  key: string,
  body?: Uint8Array,
  contentType?: string,
): Promise<Response> {
  const config = getStorageConfig()
  const url = objectUrl(config, key)
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\\.\\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = sha256(body ?? new Uint8Array())
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  const canonicalHeaders =
    `host:${url.host.toLowerCase()}\\n` +
    `x-amz-content-sha256:${payloadHash}\\n` +
    `x-amz-date:${amzDate}`
  const canonicalRequest = [
    method,
    url.pathname,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\\n')
  const scope = `${dateStamp}/${config.region}/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join('\\n')

  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp)
  const regionKey = hmac(dateKey, config.region)
  const serviceKey = hmac(regionKey, 's3')
  const signingKey = hmac(serviceKey, 'aws4_request')
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const headers: Record<string, string> = {
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    Authorization: authorization,
  }
  if (contentType) headers['content-type'] = contentType

  return fetch(url, {
    method,
    headers,
    body: method === 'PUT' && body ? Uint8Array.from(body).buffer : undefined,
    cache: 'no-store',
  })
}

export async function putNewsObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  const response = await signedRequest('PUT', key, body, contentType)
  if (!response.ok) {
    // The provider's XML/JSON error body identifies the cause (for example,
    // SignatureDoesNotMatch or AccessDenied). Do not log request headers/secrets.
    const details = (await response.text()).slice(0, 2000)
    console.error('Neon Object Storage upload failed:', response.status, details)
    throw new Error(`Neon Object Storage upload failed with status ${response.status}`)
  }
}

export async function deleteNewsObject(key: string): Promise<void> {
  const response = await signedRequest('DELETE', key)
  if (!response.ok && response.status !== 404) {
    const details = (await response.text()).slice(0, 2000)
    console.error('Neon Object Storage delete failed:', response.status, details)
    throw new Error(`Neon Object Storage delete failed with status ${response.status}`)
  }
}

export async function getNewsObject(key: string): Promise<Response | null> {
  const response = await signedRequest('GET', key)
  if (response.status === 404) return null
  if (!response.ok) {
    const details = (await response.text()).slice(0, 2000)
    console.error('Neon Object Storage read failed:', response.status, details)
    throw new Error(`Neon Object Storage read failed with status ${response.status}`)
  }
  return response
}
