# Horizon Worlds Murder Mystery Game Scripts

## Project Overview

This is a multiplayer murder mystery game built for Horizon Worlds, featuring role-based gameplay where players are assigned as either Innocents or a Murderer. The game includes weapon systems, environmental interactions, and comprehensive UI systems.

## Script Categories

### 🎯 Murderer Scripts

Weapon controllers and murderer-specific mechanics

- **KnifeController.ts** - Primary knife weapon with throwing/charging system
- **KnifeController_refactor.ts** - Cleaned up knife controller implementation
- **KnifeTableController.ts** - Knife spawning management
- **Murderer.ts** - Murderer role component
- **MurdererUI.ts** - Murderer interface elements
- **RevolverController.ts** - Backup weapon system

### 🎮 Game Core Scripts

Fundamental game systems and state management

- **GameManager.ts** - Main game loop and state controller
- **GameUtil.ts** - Game constants, events, and utilities
- **RoleManager.ts** - Player role assignment system
- **PlayerManager.ts** - Player lifecycle and elimination tracking
- **Server.ts** - Server-side coordination and validation

### 🖥️ UI Scripts

User interface components for different roles and states

- **HUDLocalUI.ts** - Heads-up display for local player
- **InnocentUI.ts** - Innocent role interface
- **ShopUI.ts** - In-game shop interface
- **GhostUI.ts** - Spectator/eliminated player UI
- **MurdererUI.ts** - Murderer role interface

### ⚙️ Manager Scripts

Specialized system managers for game subsystems

- **LeaderboardManager.ts** - Scoring and rankings
- **LightManager.ts** - Dynamic lighting system
- **PartManager.ts** - Game component management
- **SFXManager.ts** - Sound effects coordination
- **WeatherManager.ts** - Weather effects system
- **ShopManager.ts** - Shop transaction backend
- **GhostManager.ts** - Spectator mode management

### 🎮 Controller Scripts

Interactive object and player control systems

- **FlashlightController.ts** - Flashlight functionality
- **GeneratorController.ts** - Power generation system
- **PartController.ts** - Individual part management
- **PlayerCameraManager.ts** - Camera control system
- **DoorController.ts** - Door interaction mechanics
- **PropController.ts** - Interactive prop behaviors
- **TelephoneController.ts** - Telephone communication system

### 📡 Event Scripts

Event definition and communication systems

- **Events.ts** - Core game event definitions
- **LeaderboardEvents.ts** - Scoring event system
- **SFXEvents.ts** - Audio event coordination

### 🛠️ Utility Scripts

Helper functions and specialized utilities

- **DebugScript.ts** - Development debugging tools
- **Player.ts** - Player entity utilities
- **ProjectileScript.ts** - Projectile physics system
- **ShopUtil.ts** - Shop helper functions
- **QuestManager.ts** - Quest progression system

## Key Game Mechanics

### 🎯 Combat System

- **Knife Throwing**: Charge-up system (15-50 force) with camera switching
- **Stabbing**: Close-range attack mechanics with sound effects
- **Holstering**: Attachment system integration with Z-key unholster
- **Backup Weapon**: Revolver system for additional combat options

### 👥 Role System

- **Murderer**: Single player with knife weapon, objective to eliminate all innocents
- **Innocents**: Majority players, must survive and identify/eliminate murderer
- **Spectator**: Eliminated players can observe the remaining gameplay

### ⏰ Game Flow

- **Waiting Phase**: Player joining and preparation
- **Pre-Round**: Role assignment and setup (15 seconds)
- **Main Round**: Active gameplay (7 minutes)
- **End Phase**: Win condition resolution (15 seconds)

### 🏪 Shop System

- **Weapon Skins**: Cosmetic customization for weapons
- **Currency System**: In-game economy for purchases
- **Item Management**: Purchase validation and inventory tracking

## Technical Architecture

### 🌐 Networking

- Network broadcast events for multiplayer synchronization
- Server-side validation and anti-cheat measures
- Local broadcast events for UI coordination

### 🎮 Input Systems

- Device-adaptive controls (desktop/mobile)
- Player input state management
- Camera mode switching (first/third person)

### 🔊 Audio System

- Spatial sound effects for weapons and interactions
- Event-driven audio playback
- Environmental audio management

### 🌤️ Environmental Systems

- Dynamic weather effects
- Lighting system with time-of-day changes
- Interactive world objects and props
