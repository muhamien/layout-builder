import type { WireframeFrame, WireframeElement } from '@/types'

const ELEMENT_FILL: Record<WireframeElement['type'], string> = {
  header:  '#e9f0ea',
  nav:     '#e9f0ea',
  sidebar: '#f0f3f7',
  main:    '#f5f5f3',
  hero:    '#f0f0ec',
  footer:  '#f0f0ec',
  card:    '#ffffff',
  chart:   '#eef7f1',
  table:   '#fafaf8',
  form:    '#fafaf8',
  list:    '#fafaf8',
  modal:   '#ffffff',
  grid:    '#f5f5f3',
  button:  '#2e6b48',
  input:   '#ffffff',
  image:   '#ebebeb',
  text:    'transparent',
  divider: '#e5e5e0',
}

const ELEMENT_STROKE: Record<WireframeElement['type'], string> = {
  header:  '#b8d4be',
  nav:     '#b8d4be',
  sidebar: '#b8cce0',
  main:    '#d8d8d0',
  hero:    '#c8c8c0',
  footer:  '#c8c8c0',
  card:    '#d0d0c8',
  chart:   '#9ac8a4',
  table:   '#d0d0c8',
  form:    '#b8cce0',
  list:    '#d0d0c8',
  modal:   '#b8d4be',
  grid:    '#d0d0c8',
  button:  '#2e6b48',
  input:   '#c8c8c0',
  image:   '#c8c8c0',
  text:    '#d8d8d0',
  divider: '#d8d8d0',
}

interface WireframeThumbnailProps {
  frame: WireframeFrame
  width?: number
  height?: number
  className?: string
}

export function WireframeThumbnail({ frame, width = 240, height = 150, className }: WireframeThumbnailProps) {
  const scaleX = width / frame.width
  const scaleY = height / frame.height
  const scale = Math.min(scaleX, scaleY)

  const svgW = frame.width * scale
  const svgH = frame.height * scale

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${frame.width} ${frame.height}`}
      className={className}
      style={{ display: 'block', borderRadius: 2, background: '#fff' }}
      aria-hidden="true"
    >
      {frame.elements.map((el) => (
        <rect
          key={el.id}
          x={el.x + 0.5}
          y={el.y + 0.5}
          width={Math.max(el.width - 1, 1)}
          height={Math.max(el.height - 1, 1)}
          fill={ELEMENT_FILL[el.type] ?? '#f5f5f3'}
          stroke={ELEMENT_STROKE[el.type] ?? '#d0d0c8'}
          strokeWidth={1}
          rx={1}
        />
      ))}
    </svg>
  )
}
