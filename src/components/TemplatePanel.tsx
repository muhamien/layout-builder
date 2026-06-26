import * as LucideIcons from 'lucide-react'
import { defaultTemplates } from '@/lib/templates'
import type { AppTemplate } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { LayoutTemplateIcon, PlusIcon } from 'lucide-react'

interface TemplatePanelProps {
  onSelect: (template: AppTemplate) => void
  onNew: () => void
  selectedId: string | null
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

export function TemplatePanel({ onSelect, onNew, selectedId }: TemplatePanelProps) {
  return (
    <aside className="w-56 border-r bg-card flex flex-col shrink-0">
      <div className="flex items-center gap-2 px-4 h-12 border-b">
        <LayoutTemplateIcon className="size-4 text-primary" />
        <span className="text-sm font-semibold">Templates</span>
      </div>

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

          <p className="text-xs text-muted-foreground px-1 pb-1 font-medium">Default Templates</p>

          {defaultTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              className={cn(
                'w-full text-left rounded-lg px-3 py-2.5 transition-colors border',
                'hover:bg-accent hover:text-accent-foreground',
                selectedId === tpl.id
                  ? 'bg-accent border-primary/30 text-accent-foreground'
                  : 'bg-transparent border-transparent'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <DynamicIcon
                  name={tpl.icon}
                  className={cn(
                    'size-4 shrink-0',
                    selectedId === tpl.id ? 'text-primary' : 'text-muted-foreground'
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
    </aside>
  )
}
