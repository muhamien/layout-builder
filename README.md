# Layout Builder

**AI-powered wireframe generator** — describe your UI in plain language and get an interactive wireframe instantly. No login, no backend, no data collection.

![Layout Builder Screenshot](https://placehold.co/1200x630/2e6b48/fbfdfb?text=Layout+Builder)

## Features

- **6 default templates** — Admin Dashboard, Landing Page, SaaS App, Mobile App, E-Commerce, Blog/CMS
- **AI-powered generation** — chat with an AI to generate wireframes from a description
- **Interactive canvas** — zoom, pan, click elements to inspect coordinates and dimensions
- **Bring your own key** — connect OpenAI, Anthropic, Google Gemini, or Groq with your own API key
- **Export to JSON** — download the wireframe spec for use in other tools
- **Light & dark mode** — full theme support
- **100% client-side** — no backend, no database, your API key never leaves your browser

## Privacy

Your API key is stored **only in memory** for the duration of your browser session. It is sent directly to the AI provider's API — never proxied through any server. When you close the tab, the key is gone.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Run locally

```bash
git clone https://github.com/muhamien/layout-builder.git
cd layout-builder
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Connect an AI provider

1. Click **Connect AI** in the top-right corner
2. Choose a provider (OpenAI, Anthropic, Google Gemini, or Groq)
3. Select a model
4. Paste your API key — [get an OpenAI key](https://platform.openai.com/api-keys) · [get an Anthropic key](https://console.anthropic.com/settings/keys) · [get a Gemini key](https://aistudio.google.com/app/apikey) · [get a Groq key](https://console.groq.com/keys)
5. Click **Save & Connect**

### Generate a wireframe

1. Pick a template from the left panel, or click **Blank Canvas**
2. Type a description in the AI Chat panel, e.g. *"Design a SaaS dashboard with a sidebar, stat cards, and a data table"*
3. Press **Enter** — the wireframe appears on the canvas
4. Click any element to inspect its position and size
5. Optionally export the spec as JSON

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (new-york style) |
| Icons | lucide-react |
| Toasts | sonner |
| Animations | tw-animate-css |
| AI | OpenAI / Anthropic / Google Gemini / Groq |

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── WireframeCanvas  # interactive canvas renderer
│   ├── TemplatePanel    # left sidebar with default templates
│   ├── ChatPanel        # AI chat + wireframe generation
│   ├── ProviderConfig   # AI provider & API key dialog
│   └── ElementInspector # element property inspector
├── lib/
│   ├── ai.ts            # provider adapters (OpenAI, Anthropic, Gemini, Groq)
│   ├── templates.ts     # default wireframe templates
│   └── utils.ts         # cn() helper
└── types/
    └── index.ts         # shared TypeScript types
```

## Design System

Built with the **Grid Design System** — Forest accent, Stone base palette, Sora typeface, 4px radius. Fully themeable via CSS variables.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
