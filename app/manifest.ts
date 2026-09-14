// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ManaMode online Shop',
    short_name: 'M',
    description: 'مانامد فروشگاه آنلاین',
    start_url: '/',
    display: 'standalone', // مانند یک اپ مستقل به نظر می‌رسد
    background_color: '#ffffff',
    theme_color: '#006aaa',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-1024x1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  }
}