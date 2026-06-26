import { useState, useRef } from 'react'
import {
  BookmarkIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  CopyIcon,
  PencilIcon,
  ClockIcon,
  BotIcon,
  LayoutTemplateIcon,
  SquareDashedIcon,
  SearchIcon,
  PackageOpenIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { WireframeThumbnail } from '@/components/WireframeThumbnail'
import type { LibraryItem } from '@/hooks/useLibrary'
import { cn } from '@/lib/utils'

interface LibraryPanelProps {
  items: LibraryItem[]
  onOpen: (item: LibraryItem) => void
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  activeFrameId?: string
}

const SOURCE_ICON = {
  blank: SquareDashedIcon,
  template: LayoutTemplateIcon,
  ai: BotIcon,
}

const SOURCE_LABEL = {
  blank: 'Blank',
  template: 'Template',
  ai: 'AI',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface ItemMenuProps {
  onRename: () => void
  onDuplicate: () => void
  onRemove: () => void
}

function ItemMenu({ onRename, onDuplicate, onRemove }: ItemMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="More options"
        aria-expanded={open}
      >
        <MoreHorizontalIcon className="size-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-40 bg-popover border rounded-md shadow-md p-1 text-sm">
            <button
              onClick={() => { onRename(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent text-left"
            >
              <PencilIcon className="size-3.5 text-muted-foreground" />
              Rename
            </button>
            <button
              onClick={() => { onDuplicate(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent text-left"
            >
              <CopyIcon className="size-3.5 text-muted-foreground" />
              Duplicate
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => { onRemove(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-destructive/10 text-destructive text-left"
            >
              <Trash2Icon className="size-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function LibraryPanel({
  items,
  onOpen,
  onRename,
  onRemove,
  onDuplicate,
  activeFrameId,
}: LibraryPanelProps) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const startRename = (item: LibraryItem) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const commitRename = (id: string) => {
    if (editingName.trim()) onRename(id, editingName.trim())
    setEditingId(null)
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center gap-3">
        <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
          <PackageOpenIcon className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Library is empty</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Save a wireframe from the canvas to build your library
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
          <BookmarkIcon className="size-3.5 text-primary" />
          Use <span className="font-medium text-foreground">Save to Library</span> in the header
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-2 pb-1">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No results for "{search}"</p>
          )}

          {filtered.map((item) => {
            const SourceIcon = SOURCE_ICON[item.source]
            const isActive = activeFrameId === item.frame.id
            return (
              <div
                key={item.id}
                onClick={() => onOpen(item)}
                className={cn(
                  'group rounded-lg border overflow-hidden cursor-pointer transition-colors',
                  isActive
                    ? 'border-primary/40 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/20 hover:bg-accent/30'
                )}
              >
                {/* Thumbnail */}
                <div className="bg-muted/40 flex items-center justify-center py-3 border-b relative overflow-hidden">
                  <WireframeThumbnail
                    frame={item.frame}
                    width={200}
                    height={110}
                  />
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Badge className="text-[9px] px-1.5 py-0 h-4">Active</Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-2.5 py-2">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    {editingId === item.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => commitRename(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(item.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium flex-1 bg-background border border-primary/40 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                      />
                    ) : (
                      <span className="text-xs font-medium truncate flex-1">{item.name}</span>
                    )}
                    <ItemMenu
                      onRename={() => startRename(item)}
                      onDuplicate={() => onDuplicate(item.id)}
                      onRemove={() => onRemove(item.id)}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <SourceIcon className="size-2.5" />
                      {SOURCE_LABEL[item.source]}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-2.5" />
                      {formatDate(item.updatedAt)}
                    </span>
                    <span>·</span>
                    <span>{item.frame.elements.length} el</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
