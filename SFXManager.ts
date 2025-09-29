import * as hz from "horizon/core";
import { SFXEvents } from "SFXEvents";

class SFXManager extends hz.Component<typeof SFXManager> {
  static propsDefinition = {
    playersSpawnedSFX: { type: hz.PropTypes.Entity },
    preRoundStartingSFX: { type: hz.PropTypes.Entity },
    roundStartSFX: { type: hz.PropTypes.Entity },
    murdererWinSFX: { type: hz.PropTypes.Entity },
    innocentWinSFX: { type: hz.PropTypes.Entity },
    crossbowSpawnSFX: { type: hz.PropTypes.Entity },
    partCollectSFX: { type: hz.PropTypes.Entity },
    partsSpawnedSFX: { type: hz.PropTypes.Entity },
  };

  preStart(): void {
    // 2D Global Game SFX

    this.connectLocalBroadcastEvent(SFXEvents.PreRoundStartSFX, () => {
      this.playPreRoundStartSFX();
    });

    this.connectLocalBroadcastEvent(SFXEvents.RoundStartSFX, () => {
      this.playRoundStartSFX();
    });

    this.connectLocalBroadcastEvent(SFXEvents.PlayersSpawnedSFX, () => {
      this.playerSpawnedSFX();
    });

    this.connectLocalBroadcastEvent(SFXEvents.MurdererWinSFX, () => {
      this.playMurdererWinSFX();
    });

    this.connectLocalBroadcastEvent(SFXEvents.InnocentWinSFX, () => {
      this.playInnocentWinSFX();
    });

    this.connectLocalBroadcastEvent(SFXEvents.PartsSpawnedSFX, () => {
      this.playPartsSpawnedSFX();
    });

    this.connectLocalBroadcastEvent(SFXEvents.CrossbowSpawnSFX, () => {
      this.playCrossbowSpawnSFX();
    });

    this.connectLocalBroadcastEvent(
      SFXEvents.PartCollectSFX,
      ({ player }: { player: hz.Player }) => {
        this.playPartCollectSFX(player);
      }
    );

    this;
  }

  start() {}

  playPreRoundStartSFX(): void {
    console.log("Playing Pre-Round Start SFX");
    const preRoundStartSFX = this.props.preRoundStartingSFX?.as(hz.AudioGizmo);
    preRoundStartSFX?.play();
  }

  playRoundStartSFX(): void {
    console.log("Playing Round Start SFX");
    const roundStartSFX = this.props.roundStartSFX?.as(hz.AudioGizmo);
    roundStartSFX?.play();
  }

  playerSpawnedSFX(): void {
    console.log("Playing Players Spawned SFX");
    const playersSpawnedSFX = this.props.playersSpawnedSFX?.as(hz.AudioGizmo);
    playersSpawnedSFX?.play();
  }

  playMurdererWinSFX(): void {
    console.log("Playing Murderer Win SFX");
    const murdererWinSFX = this.props.murdererWinSFX?.as(hz.AudioGizmo);
    murdererWinSFX?.play();
  }

  playInnocentWinSFX(): void {
    console.log("Playing Innocent Win SFX");
    const innocentWinSFX = this.props.innocentWinSFX?.as(hz.AudioGizmo);
    innocentWinSFX?.play();
  }

  playPartsSpawnedSFX(): void {
    console.log("Playing Parts Spawned SFX");
    const partsSpawnedSFX = this.props.partsSpawnedSFX?.as(hz.AudioGizmo);
    partsSpawnedSFX?.play();
  }

  playCrossbowSpawnSFX(): void {
    console.log("Playing Crossbow Spawn SFX");
    const crossbowSpawnSFX = this.props.crossbowSpawnSFX?.as(hz.AudioGizmo);
    crossbowSpawnSFX?.play();
  }

  playPartCollectSFX(player: hz.Player): void {
    console.log("Playing Part Collect SFX");
    const partCollectSFX = this.props.partCollectSFX?.as(hz.AudioGizmo);
    partCollectSFX?.play({ fade: 0, players: [player] });
  }
}

hz.Component.register(SFXManager);
