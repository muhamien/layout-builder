# Contributing to Layout Builder

Thank you for your interest in contributing! This document explains how to get involved.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Adding a New AI Provider](#adding-a-new-ai-provider)
- [Adding a New Template](#adding-a-new-template)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Style Guide](#style-guide)

---

## Code of Conduct

Be kind, constructive, and respectful. Harassment of any kind will not be tolerated.

---

## Ways to Contribute

| Type | Examples |
|------|---------|
| Bug fix | Canvas rendering glitch, broken API call, wrong element coordinates |
| New feature | New element types, canvas drag-to-move, multi-frame support |
| New template | Any common app pattern not yet covered |
| New AI provider | Any OpenAI-compatible or REST-based LLM |
| Design | Improving the wireframe visual language, dark mode polish |
| Docs | Clearer setup steps, provider guides, video walkthrough |

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/layout-builder.git
cd layout-builder

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:5173
```

You will need a valid API key from one of the supported providers to test AI features. See the README for links.

### Useful commands

```bash
npm run dev      # start dev server with HMR
npm run build    # production build
npm run preview  # preview the production build
```

---

## Project Architecture

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives — do not edit directly
│   ├── WireframeCanvas  # SVG/DOM canvas + zoom/pan logic
│   ├── TemplatePanel    # left sidebar
│   ├── ChatPanel        # AI chat UI + streaming state
│   ├── ProviderConfig   # provider/model/key dialog
│   └── ElementInspector # read-only element info panel
├── lib/
│   ├── ai.ts            # provider adapters + system prompt
│   ├── templates.ts     # default template definitions
│   └── utils.ts         # cn() Tailwind helper
└── types/index.ts       # WireframeFrame, WireframeElement, AIConfig, …
```

### Key invariants

- **No backend.** All network requests go directly from the browser to the AI provider.
- **No persistence.** Nothing is written to localStorage or cookies — this is intentional. The API key lives only in React state.
- **Tokens are law.** Colors, fonts, radius, and spacing must come from the Grid Design System CSS variables. Never hardcode a hex color.

---

## Adding a New AI Provider

1. Open `src/lib/ai.ts`
2. Add an entry to the `PROVIDERS` object following the existing pattern:

```ts
myProvider: {
  url: 'https://api.myprovider.com/v1/chat/completions',
  defaultModel: 'my-model-v1',
  models: ['my-model-v1', 'my-model-mini'],
  authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
  buildBody: (messages, model) => ({ model, messages }),
  extractText: (data) => data.choices[0].message.content,
},
```

3. Add `'myProvider'` to the `AIProvider` union type in `src/types/index.ts`
4. Add the provider card to `PROVIDERS` in `src/components/ProviderConfig.tsx` with label, hint, docsUrl, and description
5. Test with a real key before opening a PR

---

## Adding a New Template

1. Open `src/lib/templates.ts`
2. Add an entry to `defaultTemplates`:

```ts
{
  id: 'my-template',
  name: 'My Template',
  description: 'Short description shown in the panel',
  icon: 'LucideIconName',     // any icon from lucide-react
  category: 'dashboard',      // dashboard | landing | saas | mobile | ecommerce | blog
  wireframe: {
    id: 'my-template-frame',
    name: 'My Template',
    width: 1280,
    height: 800,
    elements: [
      // x, y, width, height are all in pixels from top-left
      { id: 'header', type: 'header', label: 'Top Bar', x: 0, y: 0, width: 1280, height: 64 },
      // …
    ],
  },
},
```

3. Make sure no two elements have the same `id`
4. Ensure all elements stay within the frame bounds (`x + width ≤ frame.width`, etc.)

---

## Submitting a Pull Request

1. **Branch** off `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes. Keep commits focused — one logical change per commit.
3. **Test** the change manually in both light and dark mode.
4. Open a PR against `main` with:
   - A clear title (e.g. `feat: add Mistral provider`)
   - A short description of what changed and why
   - A screenshot or recording for UI changes
5. A maintainer will review within a few days.

### Commit message format

```
type: short description

type = feat | fix | refactor | docs | chore | style
```

Examples:
- `feat: add Mistral AI provider`
- `fix: canvas pan breaks on Firefox`
- `docs: add provider setup guide`

---

## Style Guide

- **TypeScript** — strict mode, no `any` unless unavoidable
- **Tailwind** — use design token utilities (`bg-primary`, `text-muted-foreground`); never hardcode colors
- **Components** — use shadcn/ui primitives from `src/components/ui/`; do not re-size them
- **Icons** — lucide-react only; no emoji in UI
- **Comments** — only when the *why* is non-obvious; skip obvious ones
- **No console.log** in committed code

---

Questions? Open an [issue](https://github.com/muhamien/layout-builder/issues) or start a [discussion](https://github.com/muhamien/layout-builder/discussions).
