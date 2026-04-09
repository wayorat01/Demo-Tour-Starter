'use client'

import React from 'react'
import { useForm, Button } from '@payloadcms/ui'

const standardCollections = [
  'pages',
  'posts',
  'media',
  'categories',
  'tourCategories',
  'programTours',
  'galleryAlbums',
  'tags',
  'testimonials',
  'bookings',
  'festivals',
  'airlines',
  'tourGroups',
  'customLandingPages',
]

const tourCollections = ['intertours', 'inboundTours']

export const SelectAllStandard: React.FC = () => {
  const { dispatchFields } = useForm()

  const handleSelectAllStandard = (value: boolean) => {
    standardCollections.forEach((slug) => {
      ['create', 'update', 'delete', 'manageSEO'].forEach((action) => {
        dispatchFields({
          type: 'UPDATE',
          path: `collectionAccess.${slug}.${action}`,
          value,
        })
      })
    })
  }

  const applyEditorPreset = () => {
    handleSelectAllStandard(false)
    dispatchFields({ type: 'UPDATE', path: 'collectionAccess.pages.update', value: true })

    const fullAccess = ['posts', 'media', 'galleryAlbums', 'testimonials']
    fullAccess.forEach((slug) => {
      dispatchFields({ type: 'UPDATE', path: `collectionAccess.${slug}.create`, value: true })
      dispatchFields({ type: 'UPDATE', path: `collectionAccess.${slug}.update`, value: true })
      dispatchFields({ type: 'UPDATE', path: `collectionAccess.${slug}.delete`, value: true })
      if (slug === 'posts') {
        dispatchFields({ type: 'UPDATE', path: `collectionAccess.${slug}.manageSEO`, value: true })
      }
    })

    dispatchFields({ type: 'UPDATE', path: 'collectionAccess.tourGroups.update', value: true })

    tourCollections.forEach((slug) => {
      ['create', 'updateAll', 'updateTourInfo', 'manageSEO', 'delete'].forEach((a) => {
        dispatchFields({ type: 'UPDATE', path: `tourAccess.${slug}.${a}`, value: false })
      })
      dispatchFields({ type: 'UPDATE', path: `tourAccess.${slug}.updateTourInfo`, value: true })
      dispatchFields({ type: 'UPDATE', path: `tourAccess.${slug}.manageSEO`, value: true })
    })
  }

  const applyAdminPreset = () => {
    handleSelectAllStandard(true)
    tourCollections.forEach((slug) => {
      ['create', 'updateAll', 'updateTourInfo', 'manageSEO', 'delete'].forEach((action) => {
        dispatchFields({ type: 'UPDATE', path: `tourAccess.${slug}.${action}`, value: true })
      })
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '12px 0',
      }}
    >
      <Button
        size="small"
        buttonStyle="secondary"
        onClick={(e) => {
          e.preventDefault()
          handleSelectAllStandard(true)
        }}
      >
        เลือกทั้งหมด
      </Button>
      <Button
        size="small"
        buttonStyle="secondary"
        onClick={(e) => {
          e.preventDefault()
          handleSelectAllStandard(false)
        }}
      >
        ยกเลิกทั้งหมด
      </Button>
      <span style={{ borderLeft: '1px solid var(--theme-elevation-250)', margin: '0 4px' }} />
      <Button
        size="small"
        buttonStyle="secondary"
        onClick={(e) => {
          e.preventDefault()
          applyEditorPreset()
        }}
      >
        Preset: Editor
      </Button>
      <Button
        size="small"
        buttonStyle="secondary"
        onClick={(e) => {
          e.preventDefault()
          applyAdminPreset()
        }}
      >
        Preset: Full Admin
      </Button>
    </div>
  )
}

export const SelectAllTours: React.FC = () => {
  const { dispatchFields } = useForm()

  const handleSelectAllTours = (value: boolean) => {
    tourCollections.forEach((slug) => {
      ['create', 'updateAll', 'updateTourInfo', 'manageSEO', 'delete'].forEach((action) => {
        dispatchFields({
          type: 'UPDATE',
          path: `tourAccess.${slug}.${action}`,
          value,
        })
      })
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '12px 0',
      }}
    >
      <Button
        size="small"
        buttonStyle="secondary"
        onClick={(e) => {
          e.preventDefault()
          handleSelectAllTours(true)
        }}
      >
        เลือกทั้งหมด
      </Button>
      <Button
        size="small"
        buttonStyle="secondary"
        onClick={(e) => {
          e.preventDefault()
          handleSelectAllTours(false)
        }}
      >
        ยกเลิกทั้งหมด
      </Button>
    </div>
  )
}
