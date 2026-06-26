import { useRef, useState, useCallback, useEffect } from 'react'
import {
  ZoomInIcon, ZoomOutIcon, Maximize2Icon, GridIcon,
  PanelTopIcon, PanelLeftIcon, LayoutIcon, RectangleHorizontalIcon,
  CreditCardIcon, BarChart2Icon, TableIcon, FormInputIcon,
  ListIcon, LayersIcon, ImageIcon, TypeIcon, MinusIcon,
  NavigationIcon, MonitorIcon, SquareIcon, SquareMousePointerIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { WireframeFrame, WireframeElement } from '@/types'
import { cn } from '@/lib/utils'

const ELEMENT_COLORS: Record<WireframeElement['type'], { bg: string; border: string; text: string }> = {
  header:  { bg: '#e9f0ea', border: '#2e6b48', text: '#234e36' },
  nav:     { bg: '#e9f0ea', border: '#2e6b48', text: '#234e36' },
  sidebar: { bg: '#f0f3f7', border: '#3a6ea5', text: '#253d5c' },
  main:    { bg: '#f9f9f8', border: '#d0d0c8', text: '#6b6b64' },
  hero:    { bg: '#f2f2ef', border: '#b0b0a8', text: '#4a4a44' },
  footer:  { bg: '#f0f0ec', border: '#b0b0a8', text: '#6b6b64' },
  card:    { bg: '#ffffff', border: '#c8c8c0', text: '#1a1a17' },
  chart:   { bg: '#eef7f1', border: '#6a994e', text: '#2e5a1e' },
  table:   { bg: '#fafaf8', border: '#c8c8c0', text: '#1a1a17' },
  form:    { bg: '#fafaf8', border: '#3a6ea5', text: '#253d5c' },
  list:    { bg: '#fafaf8', border: '#c8c8c0', text: '#1a1a17' },
  modal:   { bg: '#ffffff', border: '#2e6b48', text: '#1a1a17' },
  grid:    { bg: '#f9f9f8', border: '#d0d0c8', text: '#6b6b64' },
  button:  { bg: '#2e6b48', border: '#2e6b48', text: '#fbfdfb' },
  input:   { bg: '#ffffff', border: '#b0b0a8', text: '#6b6b64' },
  image:   { bg: '#f2f2ef', border: '#b0b0a8', text: '#6b6b64' },
  text:    { bg: 'transparent', border: '#d0d0c8', text: '#1a1a17' },
  divider: { bg: '#e5e5e0', border: '#e5e5e0', text: '#6b6b64' },
}

const ELEMENT_ICONS: Partial<Record<WireframeElement['type'], LucideIcon>> = {
  header:  PanelTopIcon,
  nav:     NavigationIcon,
  sidebar: PanelLeftIcon,
  main:    LayoutIcon,
  hero:    MonitorIcon,
  footer:  RectangleHorizontalIcon,
  card:    CreditCardIcon,
  chart:   BarChart2Icon,
  table:   TableIcon,
  form:    FormInputIcon,
  list:    ListIcon,
  modal:   LayersIcon,
  grid:    SquareIcon,
  image:   ImageIcon,
  text:    TypeIcon,
  divider: MinusIcon,
  button:  SquareMousePointerIcon,
  input:   FormInputIcon,
}

interface WireframeCanvasProps {
  frame: WireframeFrame | null
  onSelectElement?: (el: WireframeElement | null) => void
}

export function WireframeCanvas({ frame, onSelectElement }: WireframeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)

  const fitToScreen = useCallback(() => {
    if (!frame || !containerRef.current) return
    const container = containerRef.current
    const pw = container.clientWidth - 80
    const ph = container.clientHeight - 80
    const scaleX = pw / frame.width
    const scaleY = ph / frame.height
    const newScale = Math.min(scaleX, scaleY, 1)
    setScale(newScale)
    setPan({
      x: (container.clientWidth - frame.width * newScale) / 2,
      y: (container.clientHeight - frame.height * newScale) / 2,
    })
  }, [frame])

  useEffect(() => {
    fitToScreen()
  }, [fitToScreen])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((s) => Math.min(Math.max(s * delta, 0.1), 3))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  const selectElement = (el: WireframeElement, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedId(el.id)
    onSelectElement?.(el)
  }

  const deselect = () => {
    setSelectedId(null)
    onSelectElement?.(null)
  }

  if (!frame) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-3">
          <div className="flex justify-center opacity-20">
            <SquareIcon width={48} height={48} strokeWidth={1} />
          </div>
          <p className="text-muted-foreground text-sm">
            Select a template or describe your layout in the chat
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30 relative">
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-card border rounded-lg p-1 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setScale((s) => Math.min(s * 1.2, 3))}>
              <ZoomInIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setScale((s) => Math.max(s * 0.8, 0.1))}>
              <ZoomOutIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={fitToScreen}>
              <Maximize2Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to screen</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showGrid ? 'secondary' : 'ghost'}
              size="icon"
              className="size-7"
              onClick={() => setShowGrid((g) => !g)}
            >
              <GridIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle grid</TooltipContent>
        </Tooltip>
        <span className="text-xs text-muted-foreground px-2 font-mono">{Math.round(scale * 100)}%</span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn('flex-1 overflow-hidden', isPanning ? 'cursor-grabbing' : 'cursor-default')}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={deselect}
        style={{
          backgroundImage: showGrid
            ? 'radial-gradient(circle, var(--border) 1px, transparent 1px)'
            : undefined,
          backgroundSize: showGrid ? '24px 24px' : undefined,
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            position: 'absolute',
          }}
        >
          {/* Frame */}
          <div
            style={{
              width: frame.width,
              height: frame.height,
              position: 'relative',
              background: '#ffffff',
              boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* Elements */}
            {frame.elements.map((el) => {
              const colors = ELEMENT_COLORS[el.type] ?? ELEMENT_COLORS.main
              const isSelected = selectedId === el.id
              return (
                <div
                  key={el.id}
                  onClick={(e) => selectElement(el, e)}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    background: colors.bg,
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 4,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px var(--ring)' : undefined,
                    transition: 'box-shadow 0.1s',
                    userSelect: 'none',
                  }}
                >
                  {el.height > 40 && (() => {
                    const Icon = ELEMENT_ICONS[el.type] ?? SquareIcon
                    return (
                      <Icon
                        style={{ color: colors.text, opacity: 0.4 }}
                        width={Math.min(14, el.height * 0.18)}
                        height={Math.min(14, el.height * 0.18)}
                        strokeWidth={1.5}
                      />
                    )
                  })()}
                  <span
                    style={{
                      fontSize: Math.min(12, el.height * 0.2),
                      color: colors.text,
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      textAlign: 'center',
                      padding: '0 8px',
                      lineHeight: 1.2,
                    }}
                  >
                    {el.label}
                  </span>
                  {el.height > 60 && (
                    <span
                      style={{
                        fontSize: 9,
                        color: colors.text,
                        opacity: 0.4,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {el.width} × {el.height}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Frame info */}
      <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-card border rounded px-2 py-1 font-mono">
        {frame.name} · {frame.width}×{frame.height}px · {frame.elements.length} elements
      </div>
    </div>
  )
}
