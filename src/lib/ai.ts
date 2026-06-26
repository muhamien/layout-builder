import type { AIConfig, WireframeFrame } from '@/types'

const PROVIDERS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    authHeader: (key: string) => ({ Authorization: `Bearer ${key}` }),
    buildBody: (messages: { role: string; content: string }[], model: string) => ({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
    extractText: (data: Record<string, unknown>) => {
      const choices = data.choices as { message: { content: string } }[]
      return choices[0]?.message?.content ?? ''
    },
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-6',
    models: ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    authHeader: (key: string) => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01' }),
    buildBody: (messages: { role: string; content: string }[], model: string) => ({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.filter((m) => m.role !== 'system'),
    }),
    extractText: (data: Record<string, unknown>) => {
      const content = data.content as { type: string; text: string }[]
      return content[0]?.text ?? ''
    },
  },
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    authHeader: (_key: string) => ({}),
    buildBody: (messages: { role: string; content: string }[], _model: string) => ({
      contents: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
    extractText: (data: Record<string, unknown>) => {
      const candidates = data.candidates as { content: { parts: { text: string }[] } }[]
      return candidates[0]?.content?.parts[0]?.text ?? ''
    },
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    authHeader: (key: string) => ({ Authorization: `Bearer ${key}` }),
    buildBody: (messages: { role: string; content: string }[], model: string) => ({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
    extractText: (data: Record<string, unknown>) => {
      const choices = data.choices as { message: { content: string } }[]
      return choices[0]?.message?.content ?? ''
    },
  },
}

const SYSTEM_PROMPT = `You are an expert UI/UX designer and wireframe architect. Your job is to help users design wireframe layouts for their applications.

When the user describes a UI layout or screen, respond with:
1. A brief description of the layout (1-2 sentences)
2. A JSON wireframe specification wrapped in a \`\`\`json code block

The JSON must follow this exact schema:
{
  "id": "unique-id",
  "name": "Screen Name",
  "width": 1280,
  "height": 800,
  "elements": [
    {
      "id": "unique-element-id",
      "type": "header|sidebar|main|footer|card|nav|hero|grid|form|table|modal|list|chart|button|input|image|text|divider",
      "label": "Human readable label",
      "x": 0,
      "y": 0,
      "width": 1280,
      "height": 64
    }
  ]
}

Rules:
- All coordinates are in pixels, starting from top-left (0,0)
- Elements should not overlap unless intentionally (e.g. modal over background)
- Use realistic proportions for a desktop app (1280x800 default) or mobile (390x844)
- Provide 4-15 elements per wireframe
- Element types: header (top bar), sidebar (left panel), nav (navigation), hero (big banner), main (content area), footer, card (content block), table, chart, form, list, modal, image, text, divider
- Keep x+width ≤ frame width and y+height ≤ frame height

Always respond conversationally first, then provide the JSON.`

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: PROVIDERS.openai.models,
  anthropic: PROVIDERS.anthropic.models,
  google: PROVIDERS.google.models,
  groq: PROVIDERS.groq.models,
}

export const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  openai: PROVIDERS.openai.defaultModel,
  anthropic: PROVIDERS.anthropic.defaultModel,
  google: PROVIDERS.google.defaultModel,
  groq: PROVIDERS.groq.defaultModel,
}

export async function sendMessage(
  config: AIConfig,
  messages: { role: string; content: string }[]
): Promise<{ text: string; wireframe?: WireframeFrame }> {
  const provider = PROVIDERS[config.provider]
  if (!provider) throw new Error('Unknown provider')

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ]

  let url = provider.url
  if (config.provider === 'google') {
    url = url.replace('{model}', config.model) + `?key=${config.apiKey}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...provider.authHeader(config.apiKey),
  }

  const body = provider.buildBody(fullMessages, config.model)

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${config.provider} API error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as Record<string, unknown>
  const text = provider.extractText(data)

  const wireframe = extractWireframe(text)

  return { text, wireframe: wireframe ?? undefined }
}

function extractWireframe(text: string): WireframeFrame | null {
  const match = text.match(/```json\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1]) as WireframeFrame
    if (parsed.elements && parsed.width && parsed.height) return parsed
    return null
  } catch {
    return null
  }
}
