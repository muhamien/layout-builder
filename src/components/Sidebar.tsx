import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  LayoutTemplateIcon,
  BookmarkIcon,
  PlusIcon,
} from 'lucide-react'
import { defaultTemplates } from '@/lib/templates'
import type { AppTemplate } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LibraryPanel } from '@/components/LibraryPanel'
import type { LibraryItem } from '@/hooks/useLibrary'

interface SidebarProps {
  onSelectTemplate: (template: AppTemplate) => void
  onNew: () => void
  selectedTemplateId: string | null
  // library
  libraryItems: LibraryItem[]
  onOpenLibraryItem: (item: LibraryItem) => void
  onRenameLibraryItem: (id: string, name: string) => void
  onRemoveLibraryItem: (id: string) => void
  onDuplicateLibraryItem: (id: string) => void
  activeFrameId?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  landing: 'Landing',
  saas: 'SaaS',
  mobile: 'Mobile',
  ecommerce: 'E-Commerce',
  blog: 'Blog',
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[name]
  if (!Icon) return <LucideIcons.SquareDashed className={className} />
  return <Icon className={className} />
}

type Tab = 'templates' | 'library'

export function Sidebar({
  onSelectTemplate,
  onNew,
  selectedTemplateId,
  libraryItems,
  onOpenLibraryItem,
  onRenameLibraryItem,
  onRemoveLibraryItem,
  onDuplicateLibraryItem,
  activeFrameId,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('templates')

  return (
    <aside className="w-56 border-r bg-card flex flex-col shrink-0">
      {/* Tab bar */}
      <div className="flex items-stretch border-b shrink-0">
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-medium transition-colors border-b-2',
            activeTab === 'templates'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <LayoutTemplateIcon className="size-3.5" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-medium transition-colors border-b-2',
            activeTab === 'library'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <BookmarkIcon className="size-3.5" />
          Library
          {libraryItems.length > 0 && (
            <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none font-semibold">
              {libraryItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Templates tab */}
      {activeTab === 'templates' && (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-9"
              onClick={onNew}
            >
              <PlusIcon className="size-4" />
              Blank Canvas
            </Button>

            <Separator className="my-2" />

            <p className="text-xs text-muted-foreground px-1 pb-1 font-medium">
              Default Templates
            </p>

            {defaultTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-2.5 transition-colors border',
                  'hover:bg-accent hover:text-accent-foreground',
                  selectedTemplateId === tpl.id
                    ? 'bg-accent border-primary/30 text-accent-foreground'
                    : 'bg-transparent border-transparent'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DynamicIcon
                    name={tpl.icon}
                    className={cn(
                      'size-4 shrink-0',
                      selectedTemplateId === tpl.id
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                  <span className="text-sm font-medium truncate">{tpl.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2 pl-6">
                  {tpl.description}
                </p>
                <div className="pl-6 mt-1.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {CATEGORY_LABELS[tpl.category]}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Library tab */}
      {activeTab === 'library' && (
        <LibraryPanel
          items={libraryItems}
          onOpen={onOpenLibraryItem}
          onRename={onRenameLibraryItem}
          onRemove={onRemoveLibraryItem}
          onDuplicate={onDuplicateLibraryItem}
          activeFrameId={activeFrameId}
        />
      )}
    </aside>
  )
}
