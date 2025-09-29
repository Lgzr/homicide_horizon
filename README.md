# 🔪 Homicide Horizon

_A multiplayer murder mystery game for Horizon Worlds_

[![TypeScript](https://img.shields.io/badge/TypeScript-4.7.4-blue.svg)](https://www.typescriptlang.org/)
[![Horizon Worlds](https://img.shields.io/badge/Platform-Horizon%20Worlds-orange.svg)](https://www.oculus.com/horizon-worlds/)

## 📖 Overview

Homicide Horizon is an immersive multiplayer murder mystery game built for Meta's Horizon Worlds platform. Players are thrust into a tense social deduction experience where one player becomes the **Murderer** while the rest play as **Innocents**. The game features sophisticated weapon mechanics, dynamic environments, and strategic gameplay that tests players' ability to deceive, detect, and survive.

## 🎮 Key Features

### 🎯 Advanced Combat System

- **Knife Mechanics**: Charge-up throwing system with physics-based trajectories
- **Holstering System**: Integrated with Horizon's attachment system (Z-key to unholster)
- **Camera Dynamics**: Automatic switching between first-person and third-person views
- **Sound Design**: Immersive audio feedback for all weapon interactions

### 👥 Role-Based Gameplay

- **Murderer Role**: Stealth elimination with specialized knife weapon
- **Innocent Role**: Survival and detection mechanics
- **Spectator Mode**: Observe remaining gameplay after elimination

### 🌍 Dynamic Environments

- **Weather System**: Atmospheric effects that impact gameplay
- **Lighting Management**: Dynamic time-of-day lighting
- **Interactive Props**: Doors, generators, telephones, and environmental objects

### 🏪 Economy & Customization

- **In-Game Shop**: Purchase weapon skins and cosmetic upgrades
- **Currency System**: Earn rewards through gameplay
- **Customization**: Personalize weapons and appearance

### 📊 Advanced Systems

- **Leaderboard**: Track player statistics and rankings
- **Quest System**: Achievement-based progression
- **Multiplayer Sync**: Robust network synchronization for fair play

## 🎲 Game Mechanics

### Game Flow

1. **Lobby Phase**: Players join and wait for minimum player count
2. **Role Assignment**: One player becomes Murderer, others become Innocents
3. **Pre-Round**: 15-second preparation phase
4. **Main Round**: 7-minute survival phase
5. **Resolution**: Win condition check and celebration

### Win Conditions

- **Innocents Win**: Eliminate the Murderer before time runs out
- **Murderer Wins**: Eliminate all Innocents before being caught
- **Draw**: Time expires with Murderer still alive

### Combat Mechanics

- **Knife Throwing**: Hold to charge (15-50 force), release to throw
- **Stabbing**: Close-range instant elimination
- **Holstering**: Press holster button or use attachment system
- **Backup Weapon**: Revolver for additional combat options

## 🛠️ Technical Architecture

### Tech Stack

- **Language**: TypeScript 4.7.4
- **Platform**: Horizon Worlds (Meta)
- **Framework**: Horizon Core APIs
- **Build System**: TypeScript Compiler
- **Module System**: CommonJS

### Project Structure

```
📁 scripts/
├── 📁 code_summary/          # Documentation and summaries
├── 📁 types/                # Horizon Worlds type definitions
├── 📁 .vscode/              # VS Code configuration
├── 📄 *.ts                  # Game scripts (organized by category)
├── 📄 package.json          # Dependencies
├── 📄 tsconfig.json         # TypeScript configuration
└── 📄 .gitignore           # Git ignore rules
```

### Script Categories

#### 🎯 Murderer Scripts

- `KnifeController.ts` - Primary weapon mechanics
- `KnifeController_refactor.ts` - Optimized knife controller
- `Murderer.ts` - Murderer role logic
- `MurdererUI.ts` - Murderer interface

#### 🎮 Core Systems

- `GameManager.ts` - Main game loop
- `GameUtil.ts` - Constants and events
- `PlayerManager.ts` - Player lifecycle
- `RoleManager.ts` - Role assignment

#### 🖥️ User Interface

- `HUDLocalUI.ts` - Heads-up display
- `InnocentUI.ts` - Innocent interface
- `ShopUI.ts` - Shop interface
- `GhostUI.ts` - Spectator interface

#### ⚙️ Managers

- `LightManager.ts` - Lighting system
- `WeatherManager.ts` - Weather effects
- `SFXManager.ts` - Audio management
- `ShopManager.ts` - Shop backend

#### 🎮 Controllers

- `FlashlightController.ts` - Flashlight mechanics
- `DoorController.ts` - Door interactions
- `GeneratorController.ts` - Power systems
- `PlayerCameraManager.ts` - Camera controls

## 🚀 Installation & Setup

### Prerequisites

- **Horizon Worlds**: Access to Meta Horizon Worlds platform
- **Node.js**: For package management (optional)
- **TypeScript**: 4.7.4 (handled by package.json)

### Development Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Lgzr/homicide_horizon.git
   cd homicide_horizon
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Type checking**:
   ```bash
   npx tsc --noEmit
   ```

### Horizon Worlds Deployment

1. **Import scripts** into your Horizon Worlds project
2. **Configure world objects** to match script references
3. **Set up event connections** in the Horizon editor
4. **Test in-world** before publishing

## 📋 Configuration

### Game Settings (GameManager.ts)

```typescript
const ROUND_DURATION = 420; // 7 minutes in seconds
const PRE_ROUND_DURATION = 15; // 15 seconds
const MIN_PLAYERS = 1; // Minimum players to start
```

### Combat Balance (KnifeController.ts)

```typescript
const THROW_FORCE_MIN = 15; // Minimum throw force
const THROW_FORCE_MAX = 50; // Maximum throw force
const THROW_CHARGE_READY = 25; // Force threshold for ready indicator
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **Documentation**: Comprehensive code comments
- **Organization**: Scripts categorized by functionality
- **Testing**: Manual testing in Horizon Worlds environment

### File Naming

- **Controllers**: `FeatureController.ts`
- **Managers**: `FeatureManager.ts`
- **UI Components**: `FeatureUI.ts`
- **Utilities**: `FeatureUtil.ts`

## 📚 Documentation

Detailed script documentation is available in the `code_summary/` folder:

- `murderer_scripts.txt` - Weapon and murderer mechanics
- `game_core_scripts.txt` - Core game systems
- `ui_scripts.txt` - User interface components
- `manager_scripts.txt` - System managers
- `controller_scripts.txt` - Interactive controllers
- `event_scripts.txt` - Event systems
- `utility_scripts.txt` - Helper utilities

## 🔧 Troubleshooting

### Common Issues

**TypeScript Compilation Errors**

```bash
# Check for type errors
npx tsc --noEmit

# View detailed error output
npx tsc --noEmit --pretty
```

**Horizon Worlds Sync Issues**

- Verify network event connections
- Check player permissions
- Ensure server-side validation

**Performance Issues**

- Monitor script execution in Horizon debugger
- Optimize event listeners
- Reduce unnecessary network broadcasts

## 📄 License

This project is developed for Horizon Worlds. Please refer to Meta's terms of service for usage guidelines.

## 🙏 Acknowledgments

- **Meta Horizon Worlds** team for the platform
- **Horizon Developer Community** for support and resources
- **Game development community** for inspiration and best practices

## 📞 Support

For issues, questions, or contributions:

- **GitHub Issues**: Report bugs and request features
- **Pull Requests**: Submit improvements and fixes
- **Horizon Worlds Forums**: Community discussions

---

_Built with ❤️ for the Horizon Worlds community_</content>
<parameter name="filePath">c:\Users\Logan\AppData\LocalLow\Meta\Horizon Worlds\2595186470866628\scripts\README.md
