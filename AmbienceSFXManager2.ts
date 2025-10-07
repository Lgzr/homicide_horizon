import Events, { GameState } from "GameUtil";
import * as hz from "horizon/core";

export const AmbienceEvents = {
  // Weather events (subset of ambience)
  stormStart: new hz.LocalEvent<{}>("stormStarted"),
  stormEnd: new hz.LocalEvent<{}>("stormEnded"),
  stormIncreaseIntensity: new hz.LocalEvent<{}>("stormIncreaseIntensity"),
  stormTriggerLightning: new hz.LocalEvent<{}>("stormTriggerLightning"),
  stormTriggerThunder: new hz.LocalEvent<{}>("stormTriggerThunder"),

  // General ambience events
  startAmbience: new hz.LocalEvent<{}>("startAmbience"),
  stopAmbience: new hz.LocalEvent<{}>("stopAmbience"),
  toggleLocalAmbience: new hz.LocalEvent<{ enabled: boolean }>(
    "toggleLocalAmbience"
  ),
};

class AmbienceSFXManager extends hz.Component<typeof AmbienceSFXManager> {
  static propsDefinition = {
    // General ambience audio
    // add props for volume control
    ambienceSFX1: { type: hz.PropTypes.Entity },
    ambienceSFX1Volume: { type: hz.PropTypes.Number },
    ambienceSFX2: { type: hz.PropTypes.Entity },
    ambienceSFX2Volume: { type: hz.PropTypes.Number },
    localAmbienceSFX1: { type: hz.PropTypes.Entity },
    localAmbienceSFX2: { type: hz.PropTypes.Entity },
    localAmbienceSFX3: { type: hz.PropTypes.Entity },
    shoreSFX: { type: hz.PropTypes.Entity },
    shoreSFXVolume: { type: hz.PropTypes.Number },

    // Weather-specific audio (legacy from WeatherManager)
    // add prop for toggle
    weatherEnabledOnStart: { type: hz.PropTypes.Boolean, default: false },
    rainSFX_1: { type: hz.PropTypes.Entity },
    rainSFX_2: { type: hz.PropTypes.Entity },
    windSFX_1: { type: hz.PropTypes.Entity },
    windSFX_2: { type: hz.PropTypes.Entity },
    thunderAmbienceSFX: { type: hz.PropTypes.Entity },
    thunderSFX_1: { type: hz.PropTypes.Entity },
    thunderSFX_2: { type: hz.PropTypes.Entity },
    thunderSFX_3: { type: hz.PropTypes.Entity },
    thunderSFX_4: { type: hz.PropTypes.Entity },
    lightningFlash: { type: hz.PropTypes.Entity },
  };

  // General ambience state
  private ambienceActive: boolean = false;
  private localAmbienceActive: boolean = false;

  // Weather-specific state
  private stormActive: boolean = false;
  private intensity: number = 1;
  private lightningProb: number = 0.1;
  private thunderProb: number = 0.1;
  private stormTimer: number | null = null;

  preStart(): void {
    this.setupAmbienceEvents();
    this.setupWeatherEvents();
  }

  start() {
    // Auto-start general ambience on load
    this.startGeneralAmbience();
  }

  // ========================================
  // AMBIENCE EVENT SETUP
  // ========================================

  private setupAmbienceEvents(): void {
    this.connectLocalBroadcastEvent(AmbienceEvents.startAmbience, () => {
      console.log("Starting general ambience");
      this.startGeneralAmbience();
    });

    this.connectLocalBroadcastEvent(AmbienceEvents.stopAmbience, () => {
      console.log("Stopping general ambience");
      this.stopGeneralAmbience();
    });

    this.connectLocalBroadcastEvent(
      AmbienceEvents.toggleLocalAmbience,
      (data: { enabled: boolean }) => {
        console.log("Toggle local ambience:", data.enabled);
        this.toggleLocalAmbience(data.enabled);
      }
    );
  }

  // ========================================
  // WEATHER EVENT SETUP (Legacy subset)
  // ========================================

  private setupWeatherEvents(): void {
    this.connectLocalBroadcastEvent(AmbienceEvents.stormStart, () => {
      console.log("Storm started");
      this.startStorm();
    });

    this.connectLocalBroadcastEvent(AmbienceEvents.stormEnd, () => {
      console.log("Storm ended");
      this.endStorm();
    });

    this.connectNetworkBroadcastEvent(
      AmbienceEvents.stormIncreaseIntensity,
      () => {
        console.log("Storm intensity increased");
        this.increaseStormIntensity();
      }
    );

    this.connectNetworkBroadcastEvent(
      AmbienceEvents.stormTriggerLightning,
      () => {
        console.log("Lightning triggered");
        this.triggerLightning();
      }
    );

    this.connectNetworkBroadcastEvent(
      AmbienceEvents.stormTriggerThunder,
      () => {
        console.log("Thunder triggered");
        this.triggerThunder();
      }
    );
  }

  // ========================================
  // GENERAL AMBIENCE METHODS
  // ========================================

  private startGeneralAmbience(): void {
    if (this.ambienceActive) return;

    this.ambienceActive = true;

    // Play general ambience sounds with fade-in
    if (this.props.ambienceSFX1) {
      this.props.ambienceSFX1.as(hz.AudioGizmo).volume.set(0.4);
      this.props.ambienceSFX1.as(hz.AudioGizmo).play({ fade: 30 });
    }

    if (this.props.ambienceSFX2) {
      this.props.ambienceSFX2.as(hz.AudioGizmo).volume.set(0.4);
      this.props.ambienceSFX2.as(hz.AudioGizmo).play({ fade: 30 });
    }

    // Play shore SFX if available
    if (this.props.shoreSFX) {
      this.props.shoreSFX.as(hz.AudioGizmo).volume.set(0.3);
      this.props.shoreSFX.as(hz.AudioGizmo).play({ fade: 30 });
    }

    // Auto-enable local ambience
    this.toggleLocalAmbience(true);
  }

  private stopGeneralAmbience(): void {
    if (!this.ambienceActive) return;

    this.ambienceActive = false;

    // Stop general ambience sounds with fade-out
    if (this.props.ambienceSFX1) {
      this.props.ambienceSFX1.as(hz.AudioGizmo).stop({ fade: 30 });
    }

    if (this.props.ambienceSFX2) {
      this.props.ambienceSFX2.as(hz.AudioGizmo).stop({ fade: 30 });
    }

    if (this.props.shoreSFX) {
      this.props.shoreSFX.as(hz.AudioGizmo).stop({ fade: 30 });
    }

    // Stop local ambience as well
    this.toggleLocalAmbience(false);
  }

  private toggleLocalAmbience(enabled: boolean): void {
    this.localAmbienceActive = enabled;

    const localAmbienceSounds = [
      this.props.localAmbienceSFX1,
      this.props.localAmbienceSFX2,
      this.props.localAmbienceSFX3,
    ];

    for (const sfx of localAmbienceSounds) {
      if (!sfx) continue;

      if (enabled) {
        sfx.as(hz.AudioGizmo).volume.set(0.3);
        sfx.as(hz.AudioGizmo).play({ fade: 20 });
      } else {
        sfx.as(hz.AudioGizmo).stop({ fade: 20 });
      }
    }
  }

  // ========================================
  // WEATHER METHODS (Legacy subset)
  // ========================================

  private startStorm(): void {
    if (this.stormActive) return;

    this.stormActive = true;

    // Set volumes at moderate levels initially
    if (this.props.rainSFX_1) {
      this.props.rainSFX_1.as(hz.AudioGizmo).volume.set(0.3);
      this.props.rainSFX_1.as(hz.AudioGizmo).play({ fade: 50 });
    }

    if (this.props.rainSFX_2) {
      this.props.rainSFX_2.as(hz.AudioGizmo).volume.set(0.3);
      this.props.rainSFX_2.as(hz.AudioGizmo).play({ fade: 50 });
    }

    if (this.props.windSFX_1) {
      this.props.windSFX_1.as(hz.AudioGizmo).volume.set(0.3);
      this.props.windSFX_1.as(hz.AudioGizmo).play({ fade: 50 });
    }

    if (this.props.thunderAmbienceSFX) {
      this.props.thunderAmbienceSFX.as(hz.AudioGizmo).volume.set(0.2);
      this.props.thunderAmbienceSFX.as(hz.AudioGizmo).play({ fade: 50 });
    }

    // Start probability timer for lightning and thunder
    this.stormTimer = this.async.setInterval(() => {
      if (Math.random() < this.lightningProb) {
        this.triggerLightning();
      }
      if (Math.random() < this.thunderProb) {
        this.triggerThunder();
      }
    }, 5000); // Check every 5 seconds
  }

  private endStorm(): void {
    if (!this.stormActive) return;

    this.stormActive = false;

    // Stop rain and wind SFX with fade-out
    if (this.props.rainSFX_1) {
      this.props.rainSFX_1.as(hz.AudioGizmo).stop({ fade: 50 });
    }

    if (this.props.rainSFX_2) {
      this.props.rainSFX_2.as(hz.AudioGizmo).stop({ fade: 50 });
    }

    if (this.props.windSFX_1) {
      this.props.windSFX_1.as(hz.AudioGizmo).stop({ fade: 50 });
    }

    if (this.props.windSFX_2) {
      this.props.windSFX_2.as(hz.AudioGizmo).stop({ fade: 50 });
    }

    if (this.props.thunderAmbienceSFX) {
      this.props.thunderAmbienceSFX.as(hz.AudioGizmo).stop({ fade: 50 });
    }

    // Clear timer
    if (this.stormTimer) {
      this.async.clearInterval(this.stormTimer);
      this.stormTimer = null;
    }

    // Reset intensity
    this.intensity = 1;
    this.lightningProb = 0.1;
    this.thunderProb = 0.1;
  }

  private increaseStormIntensity(): void {
    this.intensity += 1;
    this.lightningProb = Math.min(this.lightningProb + 0.1, 1); // Cap at 1
    this.thunderProb = Math.min(this.thunderProb + 0.1, 1);

    // Increase rain and wind SFX volume (assuming 0-1 scale)
    const volume = Math.min(this.intensity * 0.5, 1);

    if (this.props.rainSFX_1) {
      this.props.rainSFX_1.as(hz.AudioGizmo).volume.set(volume);
    }

    if (this.props.rainSFX_2) {
      this.props.rainSFX_2.as(hz.AudioGizmo).volume.set(volume);
    }

    if (this.props.windSFX_1) {
      this.props.windSFX_1.as(hz.AudioGizmo).volume.set(volume);
    }

    if (this.props.windSFX_2) {
      this.props.windSFX_2.as(hz.AudioGizmo).volume.set(volume);
    }
  }

  private triggerLightning(): void {
    // Manually trigger lightning flash (enable for brief flash)
    if (this.props.lightningFlash) {
      this.props.lightningFlash.as(hz.DynamicLightGizmo).enabled.set(true);
      this.async.setTimeout(() => {
        this.props.lightningFlash
          ?.as(hz.DynamicLightGizmo)
          .enabled.set(false);
      }, 200); // Flash duration: 200ms
    }
  }

  private triggerThunder(): void {
    // Manually trigger thunder SFX (random selection)
    const thunderSounds = [
      this.props.thunderSFX_1,
      this.props.thunderSFX_2,
      this.props.thunderSFX_3,
      this.props.thunderSFX_4,
    ].filter((sfx) => sfx !== undefined);

    if (thunderSounds.length === 0) return;

    const randomThunder =
      thunderSounds[Math.floor(Math.random() * thunderSounds.length)];
    randomThunder!.as(hz.AudioGizmo).play();
  }
}

hz.Component.register(AmbienceSFXManager);
