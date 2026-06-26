import type { WireframeElement } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SlidersHorizontalIcon } from 'lucide-react'

interface ElementInspectorProps {
  element: WireframeElement | null
}

export function ElementInspector({ element }: ElementInspectorProps) {
  if (!element) {
    return (
      <div className="p-4 text-xs text-muted-foreground text-center">
        Click an element to inspect
      </div>
    )
  }

  const fields = [
    { label: 'Type', value: element.type },
    { label: 'X', value: `${element.x}px` },
    { label: 'Y', value: `${element.y}px` },
    { label: 'Width', value: `${element.width}px` },
    { label: 'Height', value: `${element.height}px` },
  ]

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontalIcon className="size-3.5 text-primary" />
        <span className="text-xs font-semibold">Inspector</span>
      </div>
      <Separator />
      <div>
        <p className="text-sm font-medium mb-1">{element.label}</p>
        <Badge variant="secondary" className="text-[10px]">{element.type}</Badge>
      </div>
      <Separator />
      <div className="space-y-2">
        {fields.slice(1).map((f) => (
          <div key={f.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{f.label}</span>
            <span className="text-xs font-mono">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
