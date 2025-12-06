# Ainimo - Virtual AI Pet

[日本語版 README はこちら](./README.ja.md)

A Tamagotchi-style virtual pet web app where you raise an AI that starts very dumb and gradually appears smarter over time.

## Features

- **No External AI APIs**: All "intelligence" is simulated using deterministic logic, rule-based behavior, and internal state changes
- **Progressive Learning**: Watch your AI pet grow from a baby to an adult through 4 intelligence tiers
- **Interactive Actions**: Talk, Study, Play, and Rest to raise your pet's stats
- **Rich Conversations**: 450+ response variations that expand as your pet grows smarter
- **Visual Effects**: Dynamic weather, particle effects, eye tracking, floating stat indicators, and smooth animations
- **Persistent State**: Your progress is automatically saved in the browser
- **Beautiful UI**: Modern, responsive design with Tailwind CSS and dark mode support
- **Mobile-First**: Works seamlessly on desktop, tablet, and mobile devices
- **Multilingual Support**: Switch between English and Japanese with automatic language detection

## Tech Stack

- **Next.js 16.0.7** (App Router)
- **React 19.0.0**
- **TypeScript 5**
- **Tailwind CSS 3.4**
- **localStorage/IndexedDB** for persistence

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone or navigate to the project directory:
```bash
cd ainimo
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

### Core Parameters

Your Ainimo has the following stats:
- **Level**: Increases as you gain XP
- **XP**: Experience points (0-100 per level)
- **Intelligence**: Affects response quality (0-100)
- **Memory**: Influences conversation context (0-100)
- **Friendliness**: Affects mood and responses (0-100)
- **Energy**: Required to perform actions (0-100)

### Actions

- **Talk**: Chat with Ainimo to build friendliness and gain XP
  - +5 XP, +2 friendliness, +3 memory, -10 energy
- **Study**: Train Ainimo to increase intelligence
  - +10 XP, +5 intelligence, +1 memory, -15 energy
- **Play**: Have fun to boost friendliness and mood
  - +3 XP, +8 friendliness, -20 energy
- **Rest**: Restore energy
  - +50 energy

### Intelligence Tiers

As your Ainimo's intelligence grows, it progresses through 4 tiers:

1. **Baby (0-24)**: Simple syllables and emoji ("Ba!", "...", "Goo...")
2. **Child (25-49)**: Basic words and phrases ("Me Ainimo!", "Want play!")
3. **Teen (50-74)**: Coherent sentences with keyword detection
4. **Adult (75-100)**: Complex, context-aware responses with memory

### Tips

- Keep energy above 20 to perform actions
- Balance all stats for the best experience
- Chat frequently to build memory and see context-aware responses
- Study regularly to unlock smarter responses
- Use Rest when energy is low

## Project Structure

```
ainimo/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── AinimoPet.tsx       # Pet avatar display
│   ├── StatusPanel.tsx     # Stats visualization
│   ├── ChatLog.tsx         # Message history
│   ├── ActionButtons.tsx   # Action controls
│   └── GameContainer.tsx   # Main game container
├── hooks/
│   ├── useGameState.ts     # Game state management
│   ├── usePersistence.ts   # Auto-save/load logic
│   ├── useDarkMode.ts      # Dark mode management
│   ├── useLanguage.ts      # Language management
│   └── effects/
│       ├── useParticles.ts     # Particle system
│       ├── useWeather.ts       # Weather effects
│       ├── useEyeTracking.ts   # Eye tracking animation
│       └── useFloatingValues.ts # Floating stat indicators
├── lib/
│   ├── gameEngine.ts       # Core game logic (pure functions)
│   ├── responseEngine.ts   # Response generation
│   ├── responseTemplates.ts # Response templates (EN/JA)
│   ├── storage.ts          # Storage abstraction
│   ├── constants.ts        # Game constants
│   └── i18n.ts             # Internationalization
├── types/
│   ├── game.ts             # Game type definitions
│   ├── responses.ts        # Response type definitions
│   └── effects.ts          # Visual effects type definitions
└── package.json
```

## Architecture

### Pure Functions
All game logic is implemented as pure functions in `lib/gameEngine.ts`, making it:
- Fully testable
- Deterministic
- Easy to understand and modify

### Simulated Intelligence
The "AI" is simulated through:
- **Keyword Detection**: Recognizes words like "hello", "play", "study"
- **Response Templates**: Pre-written responses for each intelligence tier
- **Mood Modifiers**: Responses change based on current mood
- **Context Memory**: References recent messages at higher intelligence levels

### State Management
- **useGameState**: Manages game state and actions
- **usePersistence**: Auto-saves to localStorage (with IndexedDB fallback)
- All state updates are immutable

## Building for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm test`: Run tests

## Reset Progress

Click the "Reset Ainimo" button in the Settings panel to clear all progress and start over.

## Browser Compatibility

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

Requires localStorage or IndexedDB support.

## License

ISC

## Credits

Made with ❤️ using Next.js, TypeScript, and Tailwind CSS.
No external AI APIs used - all intelligence is simulated!
