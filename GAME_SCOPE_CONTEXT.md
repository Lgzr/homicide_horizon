# Homicide Horizon - Game Scope & Context

## @Eugene This channel will provide you a comprehensive breakdown of our current game-scope.

**Homicide | Murder Mystery** is a web/mobile game developed on Meta Horizon, and is a submission for the most recent Creator Contest hosted by Meta.

**Theme & Inspiration:** This is a thrilling murder mystery experience focusing on themes of immersion, realism, horror and mystery. The original Homicide game was developed on a platform called Rec Room, so this is a Horizon adaptation.

**Setting:** The game takes place in a 'haunted' Victorian mansion during an intense storm. The game starts at midnight, and the players have 7 minutes (each minute represents ~8.5 real minutes of gameplay time) to determine and eliminate the murderer, or find a way to escape. A random murderer is selected at the beginning of the round, everyone else is assigned innocent. The murderer must eliminate all players before the round ends. Innocent players must stay alive and find 5 parts to a revolver, after collecting all 5 parts, the revolver will be 'crafted' and awarded to the last player who collected the part. Players can interact and find various items throughout the game, such as batteries and bandages, keys, gold, etc.

**Core Game Loop:**

- Minimum of 1-3 players required to play (configurable, currently set to 1 for testing)
- When entering the 'start trigger' pad and minimum players is reached, the game will start
- There is a brief 15 second warm-up to each round before roles are selected
- Once the round starts, a random player is selected as the murderer and can access a knife
- 30 seconds into the round, the revolver parts spawn
- Players have 7 minutes (420 seconds) before the round ends (If murderer kills all players, murderer wins. If innocents kill murderer or craft revolver, innocents win)

## Game Features

### 🎯 Combat System

- **Knife Mechanics**: Advanced throwing system with charge-up (15-50 force range), physics-based trajectories, and automatic camera switching between first-person and third-person modes
- **Holstering System**: Integrated with Horizon's built-in attachment system (Z-key to unholster)
- **Stabbing**: Close-range instant elimination with sound effects
- **Revolver Backup**: Craftable secondary weapon that spawns after collecting 5 parts (30 seconds into round)

### 👥 Role System

- **Murderer Role**: Single player with exclusive knife access, objective to eliminate all innocents
- **Innocent Role**: Majority players who must survive, collect revolver parts, and eliminate murderer
- **Spectator Mode**: Eliminated players become ghosts and can observe remaining gameplay

### 🌍 Environmental Interactions

- **Interactive Objects**: Doors, generators, telephones, flashlights, and various props
- **Generator System**: Power management - innocents can turn off lights for advantage, murderer can turn them back on
- **Telephone System**: Communication/interaction mechanics
- **Door System**: Lockable/unlockable doors with key mechanics
- **Flashlight System**: Battery-powered lighting with pickup/drop mechanics

### 🏪 Economy & Shop System

- **Currency System**: Gold collection and management
- **Weapon Skins**: Cosmetic customization for knives and revolvers
- **Shop Interface**: In-game purchasing system for skins and upgrades
- **Item Collection**: Various collectibles (batteries, bandages, keys, gold) scattered throughout mansion

### 🎮 Advanced Mechanics

- **Dynamic Lighting**: Time-of-day changes and generator-controlled lighting
- **Weather Effects**: Storm atmosphere with visual and audio effects
- **Sound Design**: Immersive audio feedback for all interactions and combat
- **Camera System**: Advanced camera controls with first/third-person switching
- **Leaderboard System**: Player statistics and ranking system
- **Quest System**: Achievement-based progression mechanics

### 🖥️ User Interface

- **Role-Specific UIs**: Different interfaces for murderer, innocent, and spectator modes
- **HUD Elements**: Game state information, player status, and real-time updates
- **Shop Interface**: Weapon skin selection and purchase UI
- **Spectator UI**: Post-elimination observation controls

### 🔧 Technical Features

- **Multiplayer Sync**: Robust network synchronization for fair gameplay
- **Device Support**: Cross-platform support (desktop, mobile, VR)
- **Input Adaptation**: Device-specific control schemes
- **State Management**: Comprehensive game state handling with proper cleanup
- **Event System**: Extensive event-driven architecture for modularity

## Development Status

Currently in active development with core combat, role assignment, environmental interactions, and shop systems implemented. Focus areas include polish, balancing, and additional content creation.

## Target Platform

Meta Horizon Worlds (web/mobile/VR)

## Team Size

Small development team with focus on quality implementation

## Unique Selling Points

- Authentic Rec Room adaptation with Horizon-native optimizations
- Sophisticated knife combat with physics-based throwing
- Integrated attachment system for realistic weapon handling
- Dynamic environmental storytelling through lighting and weather
- Cross-platform accessibility with device-adaptive controls

---

_This comprehensive overview provides clear context about our game's scope, mechanics, and current implementation status for better assistance in development channels._
