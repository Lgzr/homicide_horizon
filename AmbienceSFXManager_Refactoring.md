# AmbienceSFXManager Refactoring Summary

## Overview

Successfully refactored `WeatherManager.ts` to `AmbienceSFXManager.ts`, making weather events a subset of a more comprehensive ambience management system.

---

## Changes Made

### 1. New File Created

**`AmbienceSFXManager.ts`** - Comprehensive ambience and weather sound management

### 2. Files Updated

- ✅ `GameManager.ts` - Updated import from `WeatherEvents` to `AmbienceEvents`
- ✅ `DebugScript.ts` - Updated import from `WeatherEvents` to `AmbienceEvents`

### 3. Original File Status

**`WeatherManager.ts`** - Legacy file (can be deleted once all references are migrated)

---

## New Props Structure

### General Ambience Audio Gizmos

| Prop Name           | Type                | Description                        |
| ------------------- | ------------------- | ---------------------------------- |
| `ambienceSFX1`      | Entity (AudioGizmo) | Primary ambient background sound   |
| `ambienceSFX2`      | Entity (AudioGizmo) | Secondary ambient background sound |
| `localAmbienceSFX1` | Entity (AudioGizmo) | Local ambient sound layer 1        |
| `localAmbienceSFX2` | Entity (AudioGizmo) | Local ambient sound layer 2        |
| `localAmbienceSFX3` | Entity (AudioGizmo) | Local ambient sound layer 3        |
| `shoreSFX`          | Entity (AudioGizmo) | Shore/water ambient sounds         |

### Weather Audio Gizmos (Legacy)

| Prop Name            | Type                       | Description                |
| -------------------- | -------------------------- | -------------------------- |
| `rainSFX_1`          | Entity (AudioGizmo)        | Primary rain sound layer   |
| `rainSFX_2`          | Entity (AudioGizmo)        | Secondary rain sound layer |
| `windSFX_1`          | Entity (AudioGizmo)        | Primary wind sound         |
| `windSFX_2`          | Entity (AudioGizmo)        | Secondary wind sound       |
| `thunderAmbienceSFX` | Entity (AudioGizmo)        | Thunder ambient background |
| `thunderSFX_1`       | Entity (AudioGizmo)        | Thunder sound variation 1  |
| `thunderSFX_2`       | Entity (AudioGizmo)        | Thunder sound variation 2  |
| `thunderSFX_3`       | Entity (AudioGizmo)        | Thunder sound variation 3  |
| `thunderSFX_4`       | Entity (AudioGizmo)        | Thunder sound variation 4  |
| `lightningFlash`     | Entity (DynamicLightGizmo) | Lightning visual effect    |

---

## Event System

### New Event Namespace

**`AmbienceEvents`** replaces `WeatherEvents`

### General Ambience Events

```typescript
startAmbience: new hz.LocalEvent<{}>("startAmbience");
stopAmbience: new hz.LocalEvent<{}>("stopAmbience");
toggleLocalAmbience: new hz.LocalEvent<{ enabled: boolean }>(
  "toggleLocalAmbience"
);
```

### Weather Events (Subset)

```typescript
stormStart: new hz.LocalEvent<{}>("stormStarted");
stormEnd: new hz.LocalEvent<{}>("stormEnded");
stormIncreaseIntensity: new hz.LocalEvent<{}>("stormIncreaseIntensity");
stormTriggerLightning: new hz.LocalEvent<{}>("stormTriggerLightning");
stormTriggerThunder: new hz.LocalEvent<{}>("stormTriggerThunder");
```

---

## Architecture Improvements

### Separation of Concerns

The new architecture separates ambience into two main categories:

1. **General Ambience** (New)

   - Background environmental sounds
   - Local spatial audio layers
   - Shore/water effects
   - Always-on ambient soundscape

2. **Weather Effects** (Legacy/Subset)
   - Storm system (rain, wind, thunder)
   - Dynamic weather intensity
   - Lightning and thunder events
   - Triggered weather conditions

### Method Organization

#### Event Setup Methods

- `setupAmbienceEvents()` - General ambience event listeners
- `setupWeatherEvents()` - Weather-specific event listeners

#### General Ambience Methods

- `startGeneralAmbience()` - Start background ambience sounds
- `stopGeneralAmbience()` - Stop background ambience sounds
- `toggleLocalAmbience(enabled)` - Enable/disable local audio layers

#### Weather Methods (Legacy)

- `startStorm()` - Begin storm effects
- `endStorm()` - End storm effects
- `increaseStormIntensity()` - Escalate storm power
- `triggerLightning()` - Flash lightning effect
- `triggerThunder()` - Play random thunder sound

---

## Key Features

### 1. Auto-Start Ambience

```typescript
start() {
  this.startGeneralAmbience();
}
```

General ambience automatically starts when the component loads.

### 2. Layered Audio System

- **Global Ambience:** 2 layers (`ambienceSFX1`, `ambienceSFX2`)
- **Local Ambience:** 3 layers (`localAmbienceSFX1-3`)
- **Shore Effects:** 1 dedicated layer
- **Weather:** Dynamic storm system with intensity scaling

### 3. Fade Transitions

All audio transitions use fade-in/fade-out for smooth audio experience:

- General ambience: 30-frame fade
- Local ambience: 20-frame fade
- Weather effects: 50-frame fade

### 4. Volume Management

| Audio Type       | Default Volume                             |
| ---------------- | ------------------------------------------ |
| General Ambience | 0.4 (40%)                                  |
| Local Ambience   | 0.3 (30%)                                  |
| Shore SFX        | 0.3 (30%)                                  |
| Rain/Wind        | 0.3 (30%) initially, scales with intensity |
| Thunder Ambience | 0.2 (20%)                                  |

### 5. Smart Cleanup

- Null checks on all props before use
- Proper timer cleanup on storm end
- Filtered thunder sound selection (removes undefined)
- Reset intensity values when storm ends

---

## Usage Examples

### Start General Ambience

```typescript
this.sendLocalBroadcastEvent(AmbienceEvents.startAmbience, {});
```

### Stop General Ambience

```typescript
this.sendLocalBroadcastEvent(AmbienceEvents.stopAmbience, {});
```

### Toggle Local Ambience Only

```typescript
this.sendLocalBroadcastEvent(AmbienceEvents.toggleLocalAmbience, {
  enabled: true,
});
```

### Start Storm (Legacy)

```typescript
this.sendLocalBroadcastEvent(AmbienceEvents.stormStart, {});
```

### End Storm (Legacy)

```typescript
this.sendLocalBroadcastEvent(AmbienceEvents.stormEnd, {});
```

---

## Migration Checklist

### ✅ Completed

- [x] Create `AmbienceSFXManager.ts`
- [x] Add new ambience props (6 new AudioGizmo props)
- [x] Implement general ambience methods
- [x] Refactor weather methods as subset
- [x] Update `GameManager.ts` import
- [x] Update `DebugScript.ts` import
- [x] Verify all files compile without errors

### 🔄 Pending (Optional)

- [ ] Delete `WeatherManager.ts` (after confirming no other references)
- [ ] Update documentation files (README.md, code_summary/)
- [ ] Configure new audio gizmos in Horizon Worlds editor
- [ ] Test general ambience system in-game
- [ ] Test weather system still works as expected

---

## Configuration in Horizon Worlds

### Setup Steps

1. **Add Component to Scene**

   - Attach `AmbienceSFXManager` to a game manager entity

2. **Configure General Ambience**

   - Create/assign AudioGizmos for:
     - `ambienceSFX1` - Birds, nature sounds, etc.
     - `ambienceSFX2` - Wind, rustling, etc.
     - `shoreSFX` - Ocean waves, water sounds
   - Set audio files to loop
   - Configure spatial audio settings

3. **Configure Local Ambience**

   - Create/assign AudioGizmos for:
     - `localAmbienceSFX1-3` - Localized environmental sounds
   - Set smaller audio radius for spatial effect
   - Enable 3D audio positioning

4. **Configure Weather (Legacy)**
   - Maintain existing weather AudioGizmos
   - Verify lightning flash DynamicLightGizmo

---

## Benefits of Refactoring

### ✨ Improved Flexibility

- Separate control over ambient and weather sounds
- Easy to add more ambience layers without touching weather code
- Modular event system

### 🎵 Better Audio Management

- Layered approach allows richer soundscapes
- Local ambience for spatial audio immersion
- Volume control per layer

### 🔧 Maintainability

- Clear separation of concerns
- Organized method structure
- Easy to extend with new ambience types

### 🚀 Performance

- Smart null checks prevent errors
- Proper cleanup prevents memory leaks
- Efficient interval-based weather updates

---

## Technical Details

### State Management

```typescript
// General ambience state
private ambienceActive: boolean = false;
private localAmbienceActive: boolean = false;

// Weather-specific state (legacy)
private stormActive: boolean = false;
private intensity: number = 1;
private lightningProb: number = 0.1;
private thunderProb: number = 0.1;
private stormTimer: number | null = null;
```

### Weather Intensity Scaling

- Starts at intensity level 1
- Each increase adds 0.1 to lightning/thunder probability (capped at 1.0)
- Volume scales: `intensity * 0.5`, capped at 1.0
- Intensity resets when storm ends

### Lightning Flash Timing

- Flash duration: **200ms**
- Uses DynamicLightGizmo enable/disable

### Thunder Randomization

- Randomly selects from 4 thunder variations
- Filtered to exclude undefined props
- Instant playback (no fade)

---

## Backward Compatibility

### Full Legacy Support

All original `WeatherEvents` are preserved under `AmbienceEvents`:

- ✅ `stormStart`
- ✅ `stormEnd`
- ✅ `stormIncreaseIntensity`
- ✅ `stormTriggerLightning`
- ✅ `stormTriggerThunder`

### Import Changes Required

**Old:**

```typescript
import { WeatherEvents } from "WeatherManager";
```

**New:**

```typescript
import { AmbienceEvents } from "./AmbienceSFXManager";
```

### Event Usage Remains Identical

```typescript
// Still works the same way
this.sendLocalBroadcastEvent(AmbienceEvents.stormStart, {});
```

---

## Future Enhancement Ideas

- [ ] Add day/night ambient variations
- [ ] Implement weather transition system (clear → cloudy → storm)
- [ ] Add seasonal ambience variations
- [ ] Dynamic ambience based on player location
- [ ] Ambient music layer integration
- [ ] Crowd/NPC chatter ambience
- [ ] Interior vs exterior ambience switching
- [ ] Configurable volume controls via props

---

_Refactored: October 6, 2025_
_Original: WeatherManager.ts_
_New: AmbienceSFXManager.ts_
