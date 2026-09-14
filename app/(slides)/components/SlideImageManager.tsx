'use client'

import { useActionState, useState, useRef } from 'react'
import Image from 'next/image'
import type { SlideImageInfo } from '../lib/slideImagesDb'
import {
  uploadSlideImage,
  deleteSlideImageAction,
  renameSlideImageAction,
  type SlideImageActionState,
} from '../actions/slideImagesActions'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ImageCard({ image, onDeleted }: { image: SlideImageInfo; onDeleted: () => void }) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(image.name)
  const [deleteTarget, setDeleteTarget] = useState<{
    name: string
    refs: { id: number; name: string }[]
  } | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  const [renameState, renameAction, renamePending] = useActionState(
    async (prev: SlideImageActionState, formData: FormData) => {
      const result = await renameSlideImageAction(prev, formData)
      if (result?.success) setRenaming(false)
      return result
    },
    null,
  )

  const handleStartRename = () => {
    setRenaming(true)
    setNewName(image.name)
    setTimeout(() => renameRef.current?.select(), 0)
  }

  const handleCancelRename = () => {
    setRenaming(false)
    setNewName(image.name)
  }

  const handleDeleteClick = async () => {
    const formData = new FormData()
    formData.set('filename', image.name)
    formData.set('confirmed', 'false')
    const result = await deleteSlideImageAction(null, formData)
    if (result?.referencedBy) {
      setDeleteTarget({ name: image.name, refs: result.referencedBy })
    } else {
      setDeleteTarget({ name: image.name, refs: [] })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeletePending(true)
    const formData = new FormData()
    formData.set('filename', deleteTarget.name)
    formData.set('confirmed', 'true')
    const result = await deleteSlideImageAction(null, formData)
    setDeletePending(false)
    if (result?.success) {
      setDeleteTarget(null)
      onDeleted()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        <Image
          src={`/slideImages/${encodeURIComponent(image.name)}`}
          alt={image.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      <div className="p-3 flex flex-col gap-2 text-sm flex-1">
        {renaming ? (
          <form action={renameAction} className="flex flex-col gap-2">
            <input type="hidden" name="oldName" value={image.name} />
            <input
              ref={renameRef}
              name="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="block w-full rounded border px-2 py-1 text-sm outline-1 outline-gray-300"
            />
            {renameState?.message && (
              <p className="text-red-600 text-xs">{renameState.message}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={renamePending || !newName.trim()}
                className="bg-sky-600 text-white rounded px-2 py-1 text-xs disabled:opacity-50 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelRename}
                className="bg-gray-200 rounded px-2 py-1 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="font-medium text-gray-800 truncate" title={image.name}>
              {image.name}
            </p>
            <p className="text-gray-500 text-xs">{formatSize(image.size)}</p>
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={handleStartRename}
                className="text-sky-600 hover:text-sky-400 text-xs cursor-pointer"
              >
                Rename
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-400 text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Delete {deleteTarget.name}?
              </h3>

              {deleteTarget.refs.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-yellow-800">
                  <p className="font-medium mb-1">Warning: This image is used by these slides:</p>
                  <ul className="list-disc list-inside">
                    {deleteTarget.refs.map((s) => (
                      <li key={s.id}>{s.name}</li>
                    ))}
                  </ul>
                  <p className="mt-1">Deleting it may break the slides.</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletePending}
                  className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 cursor-pointer"
                >
                  {deletePending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SlideImageManager({ images }: { images: SlideImageInfo[] }) {
  const [uploadState, uploadAction, uploadPending] = useActionState<SlideImageActionState, FormData>(
    uploadSlideImage,
    null,
  )
  const [refreshKey, setRefreshKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDeleted = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div key={refreshKey}>
      <form action={uploadAction} className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Upload New Image</h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              required
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP — max 5MB</p>
          </div>
          <button
            type="submit"
            disabled={uploadPending}
            className="bg-sky-600 text-white rounded-md px-4 py-2 text-sm disabled:opacity-50 hover:bg-sky-500 cursor-pointer whitespace-nowrap"
          >
            {uploadPending ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {uploadState?.message && (
          <p
            className={`mt-2 text-sm ${uploadState.success ? 'text-green-600' : 'text-red-600'}`}
          >
            {uploadState.message}
          </p>
        )}
      </form>

      {images.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No images found in slideImages directory.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <ImageCard key={image.name} image={image} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}
