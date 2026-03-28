# Agent City

A turn-based educational city-builder that teaches how AI agents actually work. Place buildings, assign robot agents, configure their capabilities, and learn from every success and failure.

## Gameplay

Players manage an AI-powered city over 8 turns:

1. **Place** a building (Hospital, Library, Transit Hub, Security Tower)
2. **Assign** a robot agent (Axel, Rue, or Sentry)
3. **Configure** the agent's tools, memory, and autonomy level
4. **Learn** from the outcome — diagnose failures and discover what went wrong

Each agent has strengths, weaknesses, and personality. The right combination of agent, building, and configuration leads to success. Wrong choices trigger breakdowns with teaching moments about real AI concepts like tool use, memory, guardrails, and autonomy.

### Difficulty Modes

- **Normal** — Toggle tools and memory on/off. Great for learning the basics.
- **Hard** — Pick exactly 2 tools from a pool of 6 (Web Search, Calculator, Memory Bank, Planner, Code Executor, Alert System). Memory costs a tool slot. Agent affinity and tool compatibility matter.

### Agents

| Agent | Role | Strengths | Personality |
|-------|------|-----------|-------------|
| **Axel** | The Planner | Transit | Methodical, clipboard-obsessed |
| **Rue** | The Researcher | Library | Hyperactive, data-hungry |
| **Sentry** | The Guardian | Security | Anxious, safety-first |

## Tech Stack

- **React 18** + **TypeScript** for the UI overlay
- **Three.js** (r160) for isometric 3D city rendering
- **Zustand** for state management (game, agent, and event stores)
- **GSAP** for animations (building pop-in, success/failure effects)
- **Tailwind CSS 4** for styling
- **Vite 5** for dev/build tooling
- **Vitest** for testing

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
  types/          Type definitions (agents, buildings, configs, events)
  data/           JSON data (agents, buildings, tools, teaching cards)
  state/          Zustand stores (gameStore, agentStore, eventStore)
  game/           3D logic (scene, camera, buildings, characters, roads, evaluation)
  game/faces/     Animated robot face renderer (per-character idle animations, expressions)
  ui/             React components (StartScreen, ConfigPanel, ToolPicker, DiagnosisModal, etc.)
```
