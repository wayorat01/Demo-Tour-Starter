'use client'
import * as React from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import { useState, useEffect, useCallback } from 'react'
import './index.css'

type AlbumOption = {
  id: string
  title: string
}

type GalleryAlbumSelectorClientProps = {
  path: string
}

const GalleryAlbumSelectorClient: React.FC<GalleryAlbumSelectorClientProps> = ({ path }) => {
  // albums field stores the relationship array
  const { value: albumIds, setValue: setAlbumIds } = useField<(string | { id: string })[]>({
    path,
  })

  // hiddenAlbumIds stores which albums are hidden (JSON array of IDs)
  const hiddenPath = path.replace(/albums$/, 'hiddenAlbumIds')
  const { value: hiddenIdsRaw, setValue: setHiddenIds } = useField<string>({
    path: hiddenPath,
  })

  const [albumOptions, setAlbumOptions] = useState<AlbumOption[]>([])
  const [allAlbums, setAllAlbums] = useState<AlbumOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Parse hidden IDs from JSON string
  const hiddenIds: string[] = React.useMemo(() => {
    if (!hiddenIdsRaw) return []
    if (typeof hiddenIdsRaw === 'string') {
      try {
        return JSON.parse(hiddenIdsRaw)
      } catch {
        return []
      }
    }
    if (Array.isArray(hiddenIdsRaw)) return hiddenIdsRaw as string[]
    return []
  }, [hiddenIdsRaw])

  // Get the IDs of currently selected albums
  const selectedIds = React.useMemo(() => {
    if (!albumIds || !Array.isArray(albumIds)) return []
    return albumIds.map((a) => (typeof a === 'string' ? a : a?.id)).filter(Boolean) as string[]
  }, [albumIds])

  // Fetch all gallery albums for the picker
  useEffect(() => {
    fetch('/api/gallery-albums?limit=100&depth=0&select[title]=true')
      .then((res) => res.json())
      .then((data) => {
        const albums = (data.docs || []).map((doc: any) => ({
          id: doc.id,
          title: doc.title || doc.id,
        }))
        setAllAlbums(albums)
      })
      .catch(console.error)
  }, [])

  // Resolve album titles for selected albums
  useEffect(() => {
    if (selectedIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAlbumOptions([])
      return
    }
    // Find from allAlbums
    if (allAlbums.length > 0) {
      const resolved = selectedIds
        .map((id) => allAlbums.find((a) => a.id === id))
        .filter(Boolean) as AlbumOption[]
      setAlbumOptions(resolved)
    }
  }, [selectedIds, allAlbums])

  const toggleHidden = useCallback(
    (albumId: string) => {
      const newHidden = hiddenIds.includes(albumId)
        ? hiddenIds.filter((id) => id !== albumId)
        : [...hiddenIds, albumId]
      setHiddenIds(JSON.stringify(newHidden))
    },
    [hiddenIds, setHiddenIds],
  )

  const removeAlbum = useCallback(
    (albumId: string) => {
      const newIds = selectedIds.filter((id) => id !== albumId)
      setAlbumIds(newIds)
      // Also remove from hidden if present
      if (hiddenIds.includes(albumId)) {
        const newHidden = hiddenIds.filter((id) => id !== albumId)
        setHiddenIds(JSON.stringify(newHidden))
      }
    },
    [selectedIds, setAlbumIds, hiddenIds, setHiddenIds],
  )

  const addAlbum = useCallback(
    (albumId: string) => {
      if (!selectedIds.includes(albumId)) {
        setAlbumIds([...selectedIds, albumId])
      }
      setShowDropdown(false)
      setSearchTerm('')
    },
    [selectedIds, setAlbumIds],
  )

  const availableAlbums = allAlbums.filter(
    (a) => !selectedIds.includes(a.id) && a.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="field-type gallery-album-selector">
      <div className="field-label-wrapper">
        <label className="field-label">Gallery Albums</label>
      </div>
      <p className="gallery-album-selector__desc">
        เลือก Gallery Albums ที่ต้องการแสดง — คลิก 👁️ เพื่อซ่อน/แสดงอัลบั้ม
      </p>

      <div className="gallery-album-selector__pills">
        {albumOptions.map((album) => {
          const isHidden = hiddenIds.includes(album.id)
          return (
            <div
              key={album.id}
              className={`gallery-album-selector__pill ${isHidden ? 'gallery-album-selector__pill--hidden' : ''}`}
            >
              <span className="gallery-album-selector__pill-name">{album.title}</span>

              {/* Eye toggle */}
              <button
                type="button"
                className="gallery-album-selector__eye-btn"
                onClick={() => toggleHidden(album.id)}
                title={isHidden ? 'แสดงอัลบั้มนี้' : 'ซ่อนอัลบั้มนี้'}
              >
                {isHidden ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>

              {/* Edit link */}
              <a
                href={`/admin/collections/gallery-albums/${album.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gallery-album-selector__edit-btn"
                title="แก้ไขอัลบั้ม"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </a>

              {/* Remove button */}
              <button
                type="button"
                className="gallery-album-selector__remove-btn"
                onClick={() => removeAlbum(album.id)}
                title="ลบอัลบั้มออก"
              >
                ×
              </button>
            </div>
          )
        })}

        {/* Add button */}
        <div className="gallery-album-selector__add-wrapper">
          <button
            type="button"
            className="gallery-album-selector__add-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            +
          </button>

          {showDropdown && (
            <div className="gallery-album-selector__dropdown">
              <input
                type="text"
                className="gallery-album-selector__search"
                placeholder="ค้นหาอัลบั้ม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="gallery-album-selector__dropdown-list">
                {availableAlbums.length > 0 ? (
                  availableAlbums.map((album) => (
                    <button
                      key={album.id}
                      type="button"
                      className="gallery-album-selector__dropdown-item"
                      onClick={() => addAlbum(album.id)}
                    >
                      {album.title}
                    </button>
                  ))
                ) : (
                  <div className="gallery-album-selector__dropdown-empty">ไม่พบอัลบั้ม</div>
                )}
                <a
                  href="/admin/collections/gallery-albums/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gallery-album-selector__create-btn"
                >
                  + สร้างอัลบั้มใหม่
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GalleryAlbumSelectorClient
