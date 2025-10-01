import Events, { GameState } from "GameUtil";
import * as hz from "horizon/core";

class LocalUI extends hz.Component<typeof LocalUI> {
  static propsDefinition = {};

  preStart() {
    // SPLASHES
    /*
    - Round Starting (Round starting 3.. 2. 1)
    - Round Started
    - Role Splash (YOU are INNOCENT | YOU are MURDERER)
    - Parts Spawned (Parts have been spawned)
    - Game Over (Murderer Wins | Innocent Wins)
    */

    this.connectNetworkBroadcastEvent(Events.gameStateChanged, 
      // event passes toState and fromState
      ({ fromState, toState }: { fromState: GameState; toState: GameState }) => {
        // Handle state changes
        this.handleGameStateChange(fromState, toState);
      }
    )

    
  }

  start() {}

  handleGameStateChange(fromState: GameState, toState: GameState) {
    // Handle the transition between game states
    switch (toState) {
      case GameState.RoundEnding:
        this.showRoundOverSplash();
        break;
      case GameState.RoundInProgress:
        this.showRoundStartSplash();
        break;

      // Handle other game states as needed
    }
  }

  showRoundOverSplash() {
    // Show the round over splash screen
  }

  showRoundStartSplash() {
    // Show the round start splash screen

  }

  showRoleSplash(role: string) {
    // Show the role splash screen
  }

  showPartsSpawnedSplash() {
    // Show the parts spawned splash screen
  }

  showPartsCollected(parts: number) {
    // Show the parts collected splash screen
  }

  showRevolverCraftedSplash() {
    // Show the revolver crafted splash screen
  }

}



hz.Component.register(LocalUI);
