import Events, { GameState } from "GameUtil";
import * as hz from "horizon/core";

export const WeatherEvents = {
  stormStart: new hz.LocalEvent<{}>("stormStarted"),
  stormEnd: new hz.LocalEvent<{}>("stormEnded"),
  stormIncreaseIntensity: new hz.LocalEvent<{}>("stormIncreaseIntensity"),
  stormTriggerLightning: new hz.LocalEvent<{}>("stormTriggerLightning"),
  stormTriggerThunder: new hz.LocalEvent<{}>("stormTriggerThunder"),
};

class WeatherManager extends hz.Component<typeof WeatherManager> {
  static propsDefinition = {
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

  private stormActive: boolean = false;
  private intensity: number = 1;
  private lightningProb: number = 0.1;
  private thunderProb: number = 0.1;
  private stormTimer: number | null = null;

  preStart(): void {
    this.connectLocalBroadcastEvent(WeatherEvents.stormStart, () => {
      console.log("Storm started");
      this.startStorm();
    });

    this.connectLocalBroadcastEvent(WeatherEvents.stormEnd, () => {
      console.log("Storm ended");
      this.endStorm();
    });

    this.connectNetworkBroadcastEvent(
      WeatherEvents.stormIncreaseIntensity,
      () => {
        console.log("Storm intensity increased");
        this.increaseStormIntensity();
      }
    );

    this.connectNetworkBroadcastEvent(
      WeatherEvents.stormTriggerLightning,
      () => {
        console.log("Lightning triggered");
        this.triggerLightning();
      }
    );

    this.connectNetworkBroadcastEvent(WeatherEvents.stormTriggerThunder, () => {
      console.log("Thunder triggered");
      this.triggerThunder();
    });
  }

  start() {}

  startStorm() {
    this.stormActive = true;
    // Play rain and wind SFX

    // set volumes at half initially
    this.props.rainSFX_1!.as(hz.AudioGizmo).volume.set(0.3);
    this.props.rainSFX_2!.as(hz.AudioGizmo).volume.set(0.3);
    this.props.windSFX_1!.as(hz.AudioGizmo).volume.set(0.3);
    //this.props.windSFX_2?.as(hz.AudioGizmo).volume.set(0.5);
    this.props.thunderAmbienceSFX!.as(hz.AudioGizmo).volume.set(0.2);

    this.props.rainSFX_1!.as(hz.AudioGizmo).play({ fade: 50 });
    this.props.rainSFX_2!.as(hz.AudioGizmo).play({ fade: 50 });
    this.props.windSFX_1!.as(hz.AudioGizmo).play({ fade: 50 });
    // this.props.windSFX_2!.as(hz.AudioGizmo).play();
    this.props.thunderAmbienceSFX!.as(hz.AudioGizmo).play({ fade: 50 });

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

  endStorm() {
    if (this.stormActive) {
      this.stormActive = false;
      // Stop rain and wind SFX
      this.props.rainSFX_1!.as(hz.AudioGizmo).stop({ fade: 50 });
      this.props.rainSFX_2!.as(hz.AudioGizmo).stop({ fade: 50 });
      this.props.windSFX_1!.as(hz.AudioGizmo).stop({ fade: 50 });
      this.props.windSFX_2!.as(hz.AudioGizmo).stop({ fade: 50 });
      this.props.thunderAmbienceSFX!.as(hz.AudioGizmo).stop({ fade: 50 });
      // Clear timer
      if (this.stormTimer) {
        this.async.clearInterval(this.stormTimer);
        this.stormTimer = null;
      }
    }
  }

  increaseStormIntensity() {
    this.intensity += 1;
    this.lightningProb = Math.min(this.lightningProb + 0.1, 1); // Cap at 1
    this.thunderProb = Math.min(this.thunderProb + 0.1, 1);
    // Increase rain and wind SFX volume (assuming 0-1 scale)
    const volume = Math.min(this.intensity * 0.5, 1);
    this.props.rainSFX_1!.as(hz.AudioGizmo).volume.set(volume);
    this.props.rainSFX_2!.as(hz.AudioGizmo).volume.set(volume);
    this.props.windSFX_1!.as(hz.AudioGizmo).volume.set(volume);
    this.props.windSFX_2!.as(hz.AudioGizmo).volume.set(volume);
  }

  triggerLightning() {
    // Manually trigger lightning flash SFX (enable for brief flash)
    this.props.lightningFlash?.as(hz.DynamicLightGizmo).enabled.set(true);
    this.async.setTimeout(() => {
      this.props.lightningFlash?.as(hz.DynamicLightGizmo).enabled.set(false);
    }, 200); // Flash duration
  }

  triggerThunder() {
    // Manually trigger thunder SFX (random selection)
    const thunders = [
      this.props.thunderSFX_1,
      this.props.thunderSFX_2,
      this.props.thunderSFX_3,
    ];
    const randomThunder = thunders[Math.floor(Math.random() * thunders.length)];
    randomThunder!.as(hz.AudioGizmo).play();
  }
}
hz.Component.register(WeatherManager);
