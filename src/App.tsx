import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { KeyIcon, MoonIcon, SunIcon, DownloadIcon, SquareDashedIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { TemplatePanel } from '@/components/TemplatePanel'
import { WireframeCanvas } from '@/components/WireframeCanvas'
import { ChatPanel } from '@/components/ChatPanel'
import { ProviderConfig } from '@/components/ProviderConfig'
import { ElementInspector } from '@/components/ElementInspector'
import type { AppTemplate, AIConfig, WireframeFrame, WireframeElement } from '@/types'
import { emptyFrame } from '@/lib/templates'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null)
  const [currentFrame, setCurrentFrame] = useState<WireframeFrame | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedElement, setSelectedElement] = useState<WireframeElement | null>(null)

  const handleToggleDark = () => {
    setDarkMode((d) => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  const handleSelectTemplate = (tpl: AppTemplate) => {
    setCurrentFrame(tpl.wireframe)
    setSelectedTemplateId(tpl.id)
    setSelectedElement(null)
    toast.success(`Loaded "${tpl.name}"`)
  }

  const handleNewCanvas = () => {
    setCurrentFrame(emptyFrame())
    setSelectedTemplateId(null)
    setSelectedElement(null)
    toast('Blank canvas created')
  }

  const handleWireframeGenerated = (frame: WireframeFrame) => {
    setCurrentFrame(frame)
    setSelectedTemplateId(null)
    setSelectedElement(null)
    toast.success('Wireframe generated!', {
      description: `${frame.elements.length} elements · ${frame.width}×${frame.height}px`,
    })
  }

  const handleSaveConfig = (config: AIConfig) => {
    setAiConfig(config)
    toast.success('AI provider connected', {
      description: `${config.provider} · ${config.model}`,
    })
  }

  const handleExport = () => {
    if (!currentFrame) return
    const json = JSON.stringify(currentFrame, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentFrame.name.toLowerCase().replace(/\s+/g, '-')}.wireframe.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Wireframe exported')
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        {/* Header */}
        <header className="h-12 border-b bg-card flex items-center gap-3 px-4 shrink-0">
          <div className="flex items-center gap-2">
            <SquareDashedIcon className="size-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Layout Builder</span>
            <Badge variant="secondary" className="text-[10px]">Beta</Badge>
          </div>

          <Separator orientation="vertical" className="h-4 mx-1" />

          {currentFrame && (
            <span className="text-sm text-muted-foreground truncate max-w-48">
              {currentFrame.name}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            {currentFrame && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" onClick={handleExport}>
                    <DownloadIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export JSON</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" onClick={handleToggleDark}>
                  {darkMode ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{darkMode ? 'Light mode' : 'Dark mode'}</TooltipContent>
            </Tooltip>

            <Button
              variant={aiConfig ? 'secondary' : 'default'}
              size="sm"
              className="gap-2 h-8"
              onClick={() => setConfigOpen(true)}
            >
              <KeyIcon className="size-3.5" />
              {aiConfig ? `${aiConfig.provider} · ${aiConfig.model}` : 'Connect AI'}
            </Button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <TemplatePanel
            onSelect={handleSelectTemplate}
            onNew={handleNewCanvas}
            selectedId={selectedTemplateId}
          />

          <main className="flex flex-1 overflow-hidden">
            <WireframeCanvas
              frame={currentFrame}
              onSelectElement={setSelectedElement}
            />

            {/* Right panel: inspector + chat stacked */}
            <div className="w-80 flex flex-col border-l shrink-0 overflow-hidden">
              {/* Inspector */}
              <div className="border-b shrink-0">
                <ElementInspector element={selectedElement} />
              </div>

              {/* Chat fills remaining space */}
              <ChatPanel
                config={aiConfig}
                onWireframeGenerated={handleWireframeGenerated}
              />
            </div>
          </main>
        </div>

        <ProviderConfig
          open={configOpen}
          onOpenChange={setConfigOpen}
          initial={aiConfig}
          onSave={handleSaveConfig}
        />

        <Toaster position="bottom-right" />
      </div>
    </TooltipProvider>
  )
}
