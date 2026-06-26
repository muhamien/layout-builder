export type AIProvider = 'openai' | 'anthropic' | 'google' | 'groq'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model: string
}

export interface WireframeElement {
  id: string
  type: 'header' | 'sidebar' | 'main' | 'footer' | 'card' | 'nav' | 'hero' | 'grid' | 'form' | 'table' | 'modal' | 'list' | 'chart' | 'button' | 'input' | 'image' | 'text' | 'divider'
  label: string
  x: number
  y: number
  width: number
  height: number
  children?: WireframeElement[]
  props?: Record<string, string>
}

export interface WireframeFrame {
  id: string
  name: string
  width: number
  height: number
  elements: WireframeElement[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  wireframe?: WireframeFrame
}

export interface AppTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'dashboard' | 'landing' | 'mobile' | 'saas' | 'ecommerce' | 'blog'
  wireframe: WireframeFrame
}
