import { useState, useEffect, useCallback } from 'react'
import type { WireframeFrame } from '@/types'

export interface LibraryItem {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  source: 'blank' | 'template' | 'ai'
  templateId?: string
  frame: WireframeFrame
}

const STORAGE_KEY = 'layout-builder-library'

function load(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LibraryItem[]) : []
  } catch {
    return []
  }
}

function persist(items: LibraryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useLibrary() {
  const [items, setItems] = useState<LibraryItem[]>(load)

  useEffect(() => {
    persist(items)
  }, [items])

  const save = useCallback(
    (frame: WireframeFrame, source: LibraryItem['source'], templateId?: string): LibraryItem => {
      const now = new Date().toISOString()
      const existing = items.find((i) => i.frame.id === frame.id)

      if (existing) {
        const updated: LibraryItem = { ...existing, frame, updatedAt: now }
        setItems((prev) => prev.map((i) => (i.id === existing.id ? updated : i)))
        return updated
      }

      const item: LibraryItem = {
        id: crypto.randomUUID(),
        name: frame.name,
        createdAt: now,
        updatedAt: now,
        source,
        templateId,
        frame,
      }
      setItems((prev) => [item, ...prev])
      return item
    },
    [items]
  )

  const rename = useCallback((id: string, name: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, name, frame: { ...i.frame, name }, updatedAt: new Date().toISOString() } : i
      )
    )
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const duplicate = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const now = new Date().toISOString()
      const copy: LibraryItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} (copy)`,
        createdAt: now,
        updatedAt: now,
        frame: {
          ...item.frame,
          id: crypto.randomUUID(),
          name: `${item.name} (copy)`,
        },
      }
      setItems((prev) => [copy, ...prev])
      return copy
    },
    [items]
  )

  return { items, save, rename, remove, duplicate }
}
