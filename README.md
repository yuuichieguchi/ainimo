# Ainimo - Virtual AI Pet

[日本語版 README はこちら](./README.ja.md)

A Tamagotchi-style virtual pet web app where you raise an AI that starts very dumb and gradually appears smarter over time.

## Features

### Core Features
- **No External AI APIs**: All "intelligence" is simulated using deterministic logic, rule-based behavior, and internal state changes
- **Progressive Learning**: Watch your AI pet grow from a baby to an adult through 4 intelligence tiers
- **Interactive Actions**: Talk, Study, Play, and Rest to raise your pet's stats
- **Rich Conversations**: 450+ response variations that expand as your pet grows smarter
- **Persistent State**: Your progress is automatically saved in the browser
- **Multilingual Support**: Switch between English and Japanese

### Achievement System
- **52 Achievements**: Unlock achievements across 8 categories (First Steps, Dedication, Chat Master, Well-Rested, Well-Played, Scholar, Social, Secret)
- **Title Rewards**: Some achievements unlock special titles for your Ainimo
- **Progress Tracking**: View your achievement progress and stats

### Personality System
- **5 Personality Types**: Your Ainimo develops one of 5 personalities based on your actions
  - Intellectual (study-focused)
  - Social (chat-focused)
  - Playful (play-focused)
  - Zen (rest-focused)
  - Balanced (mixed actions)
- **Dynamic Responses**: Responses change based on personality type
- **Personality Lock**: After 50 actions, personality becomes permanent

### Mini-Games
- **4 Game Types**: Memory, Rhythm, Puzzle, and Quiz games
- **Difficulty Scaling**: Games become harder as your Ainimo grows smarter
- **Energy Cost**: Games cost energy to play
- **Rewards**: Earn XP, coins, and item drops

### Item & Inventory System
- **18 Collectible Items**: Hats (6), Accessories (6), Backgrounds (6)
- **Rarity Tiers**: Common, Rare, Epic, Legendary
- **Equipment System**: Equip items to customize your Ainimo
- **Coin Economy**: Earn coins from mini-games

### Visual Effects
- **Dynamic Weather**: Sunny, cloudy, rainy, snowy weather effects
- **Seasonal Themes**: Spring, summer, autumn, winter decorations
- **Day/Night Cycle**: Visual changes based on time of day
- **Particle Effects**: Floating particles and animations
- **Eye Tracking**: Ainimo's eyes follow your cursor
- **Floating Stat Indicators**: Visual feedback for stat changes

### UI/UX
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Dark Mode**: System, light, and dark theme options
- **Mobile-First**: Works seamlessly on desktop, tablet, and mobile devices
- **Modal System**: Clean modal interfaces for achievements, inventory, mini-games, and settings

## Tech Stack

- **Next.js 16.0.7** (App Router)
- **React 19.0.0**
- **TypeScript 5**
- **Tailwind CSS 3.4**
- **localStorage/IndexedDB** for persistence
- **Jest** for testing (300+ tests)

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
- **Rest**: Restore energy (limited to 3 times per day)
  - +50 energy

### Intelligence Tiers

As your Ainimo's intelligence grows, it progresses through 4 tiers:

1. **Baby (0-24)**: Simple syllables and emoji ("Ba!", "...", "Goo...")
2. **Child (25-49)**: Basic words and phrases ("Me Ainimo!", "Want play!")
3. **Teen (50-74)**: Coherent sentences with keyword detection
4. **Adult (75-100)**: Complex, context-aware responses with memory

### Mini-Games

Access mini-games by clicking the Mini-Games button:
- **Memory**: Match pairs of cards before time runs out
- **Rhythm**: Tap notes in time with the beat
- **Puzzle**: Solve sliding tile puzzles
- **Quiz**: Answer questions (difficulty based on intelligence)

### Tips

- Keep energy above 20 to perform actions
- Balance all stats for the best experience
- Chat frequently to build memory and see context-aware responses
- Study regularly to unlock smarter responses
- Play mini-games to earn coins and items
- Check achievements for goals and title rewards

## Project Structure

```
ainimo/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page
│   └── globals.css             # Global styles
├── components/
│   ├── AinimoPet.tsx           # Pet avatar display
│   ├── StatusPanel.tsx         # Stats visualization
│   ├── ChatLog.tsx             # Message history
│   ├── ActionButtons.tsx       # Action controls
│   ├── GameContainer.tsx       # Main game container
│   ├── AchievementModal.tsx    # Achievement viewer
│   ├── PersonalityBadge.tsx    # Personality display
│   ├── SettingsModal.tsx       # Settings modal
│   ├── minigames/              # Mini-game components
│   │   ├── MiniGameModal.tsx
│   │   ├── MemoryGame.tsx
│   │   ├── RhythmGame.tsx
│   │   ├── PuzzleGame.tsx
│   │   └── QuizGame.tsx
│   ├── inventory/              # Inventory components
│   │   ├── InventoryModal.tsx
│   │   ├── EquipmentPanel.tsx
│   │   └── ItemCard.tsx
│   └── effects/                # Visual effect components
├── hooks/
│   ├── useGameState.ts         # Game state management
│   ├── usePersistence.ts       # Auto-save/load logic
│   ├── useAchievements.ts      # Achievement tracking
│   ├── useInventory.ts         # Inventory management
│   ├── useMiniGames.ts         # Mini-game state
│   └── effects/                # Visual effect hooks
├── lib/
│   ├── gameEngine.ts           # Core game logic
│   ├── responseEngine.ts       # Response generation
│   ├── achievementEngine.ts    # Achievement logic
│   ├── personalityEngine.ts    # Personality system
│   ├── miniGameEngine.ts       # Mini-game logic
│   ├── itemEngine.ts           # Item/inventory logic
│   ├── itemDefinitions.ts      # Item definitions
│   ├── miniGameDefinitions.ts  # Game configurations
│   └── i18n.ts                 # Internationalization
├── types/
│   ├── game.ts                 # Game type definitions
│   ├── achievement.ts          # Achievement types
│   ├── personality.ts          # Personality types
│   ├── miniGame.ts             # Mini-game types
│   └── item.ts                 # Item types
└── __tests__/                  # Test files
```

## Architecture

### Pure Functions
All game logic is implemented as pure functions, making it:
- Fully testable (300+ tests)
- Deterministic
- Easy to understand and modify

### Simulated Intelligence
The "AI" is simulated through:
- **Keyword Detection**: Recognizes words like "hello", "play", "study"
- **Response Templates**: Pre-written responses for each intelligence tier
- **Mood Modifiers**: Responses change based on current mood
- **Context Memory**: References recent messages at higher intelligence levels
- **Personality Influence**: Responses vary based on developed personality

### State Management
- **useGameState**: Manages core game state and actions
- **useAchievements**: Tracks achievement progress
- **useInventory**: Manages items and equipment
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

Click the Settings button (⚙️) and then "Reset Ainimo" to clear all progress and start over.

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
