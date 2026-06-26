import { useRef, useState, useEffect } from 'react'
import { SendIcon, BotIcon, UserIcon, AlertCircleIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage, AIConfig, WireframeFrame } from '@/types'
import { sendMessage } from '@/lib/ai'
import { cn } from '@/lib/utils'

interface ChatPanelProps {
  config: AIConfig | null
  onWireframeGenerated: (frame: WireframeFrame) => void
}

const SUGGESTIONS = [
  'Design a SaaS dashboard with sidebar nav and analytics',
  'Create a mobile app login screen',
  'Build an e-commerce product detail page',
  'Design a blog homepage with featured articles',
  'Create a settings page with profile and preferences sections',
]

export function ChatPanel({ config, onWireframeGenerated }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    if (!config?.apiKey) {
      setError('Please configure your AI provider and API key first.')
      return
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))
      const result = await sendMessage(config, history)

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
        wireframe: result.wireframe,
      }
      setMessages((prev) => [...prev, assistantMsg])

      if (result.wireframe) {
        onWireframeGenerated(result.wireframe)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const useSuggestion = (text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  const stripJson = (content: string) =>
    content.replace(/```json[\s\S]*?```/g, '').trim()

  return (
    <div className="w-80 border-l bg-card flex flex-col shrink-0">
      <div className="flex items-center gap-2 px-4 h-12 border-b">
        <SparklesIcon className="size-4 text-primary" />
        <span className="text-sm font-semibold">AI Chat</span>
        {config && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {config.provider}
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1" ref={scrollRef as React.Ref<HTMLDivElement>}>
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Describe the layout you want and I'll generate a wireframe. Try one of these:
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => useSuggestion(s)}
                  className="w-full text-left text-xs bg-muted hover:bg-accent hover:text-accent-foreground rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-primary/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div
                className={cn(
                  'size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {msg.role === 'user' ? <UserIcon className="size-3.5" /> : <BotIcon className="size-3.5 text-primary" />}
              </div>
              <div className={cn('flex flex-col gap-1 max-w-[85%]', msg.role === 'user' && 'items-end')}>
                <div
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  )}
                >
                  <p className="whitespace-pre-wrap">{stripJson(msg.content)}</p>
                </div>
                {msg.wireframe && (
                  <Badge variant="outline" className="self-start text-[10px] text-primary border-primary/30 bg-accent">
                    ✓ Wireframe generated
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground font-mono px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <BotIcon className="size-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-2 items-start bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertCircleIcon className="size-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-2">
        <Textarea
          ref={textareaRef}
          placeholder={config ? 'Describe your layout…' : 'Configure AI provider first →'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || !config?.apiKey}
          className="min-h-[72px] max-h-36 text-sm resize-none"
          rows={3}
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim() || !config?.apiKey}
          className="w-full gap-2"
          size="sm"
        >
          <SendIcon className="size-3.5" />
          {loading ? 'Generating…' : 'Generate Wireframe'}
        </Button>
      </div>
    </div>
  )
}
