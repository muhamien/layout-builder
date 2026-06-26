import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  ShieldCheckIcon,
  MonitorIcon,
  WifiOffIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from 'lucide-react'
import type { AIConfig, AIProvider } from '@/types'
import { PROVIDER_MODELS, PROVIDER_DEFAULT_MODELS } from '@/lib/ai'

interface ProviderConfigProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: AIConfig | null
  onSave: (config: AIConfig) => void
}

const PROVIDERS: {
  value: AIProvider
  label: string
  hint: string
  docsUrl: string
  description: string
}[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    hint: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    description: 'GPT-4o and GPT-4o mini',
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    hint: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Claude Opus, Sonnet, Haiku',
  },
  {
    value: 'google',
    label: 'Google Gemini',
    hint: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Gemini 1.5 Flash and Pro',
  },
  {
    value: 'groq',
    label: 'Groq',
    hint: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    description: 'Llama 3.3 and Mixtral (fast)',
  },
]

export function ProviderConfig({ open, onOpenChange, initial, onSave }: ProviderConfigProps) {
  const [provider, setProvider] = useState<AIProvider>(initial?.provider ?? 'openai')
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? '')
  const [model, setModel] = useState(initial?.model ?? PROVIDER_DEFAULT_MODELS['openai'])
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (open) {
      setProvider(initial?.provider ?? 'openai')
      setApiKey(initial?.apiKey ?? '')
      setModel(initial?.model ?? PROVIDER_DEFAULT_MODELS[initial?.provider ?? 'openai'])
      setShowKey(false)
    }
  }, [initial, open])

  const handleProviderChange = (v: AIProvider) => {
    setProvider(v)
    setModel(PROVIDER_DEFAULT_MODELS[v])
  }

  const handleSave = () => {
    if (!apiKey.trim()) return
    onSave({ provider, apiKey: apiKey.trim(), model })
    onOpenChange(false)
  }

  const models = PROVIDER_MODELS[provider] ?? []
  const providerInfo = PROVIDERS.find((p) => p.value === provider)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-lg bg-accent flex items-center justify-center">
              <KeyIcon className="size-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">AI Provider Configuration</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Connect your own AI provider to generate wireframes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Disclaimer banner */}
        <div className="bg-accent/60 border-b px-6 py-3">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-accent-foreground">Privacy & Security</p>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { icon: WifiOffIcon, text: 'API key is never sent to our servers — requests go directly from your browser to the AI provider.' },
                  { icon: MonitorIcon, text: 'Everything runs entirely client-side. No backend, no database, no tracking.' },
                  { icon: ShieldCheckIcon, text: 'Key is stored only in memory for this session and cleared when you close the tab.' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2">
                    <Icon className="size-3 text-primary shrink-0 mt-0.5 opacity-70" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Provider selector as cards */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleProviderChange(p.value)}
                  className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                    provider === p.value
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-input bg-background hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium">{p.label}</span>
                    {provider === p.value && (
                      <CheckCircleIcon className="size-3.5 text-primary" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apikey">API Key</Label>
              {providerInfo && (
                <a
                  href={providerInfo.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  Get API key
                  <ExternalLinkIcon className="size-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <Input
                id="apikey"
                type={showKey ? 'text' : 'password'}
                placeholder={providerInfo?.hint ?? 'Your API key'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-9 font-mono text-xs"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
          </div>

          {/* Status indicator */}
          {initial?.apiKey && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-accent px-3 py-2">
              <span className="size-2 rounded-full bg-primary shrink-0" />
              <span className="text-xs text-accent-foreground">
                Currently connected: <span className="font-medium">{initial.provider}</span> · <span className="font-mono">{initial.model}</span>
              </span>
              <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="px-6 py-4 bg-muted/30">
          <p className="text-[10px] text-muted-foreground mr-auto leading-relaxed max-w-52">
            By connecting, you agree to your provider's terms. Usage is billed directly to your account.
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!apiKey.trim()} className="gap-2">
            <KeyIcon className="size-3.5" />
            Save & Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
