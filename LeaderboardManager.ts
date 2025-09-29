import * as hz from 'horizon/core';
import { LeaderboardEvents } from 'LeaderboardEvents';

class LeaderboardManager extends hz.Component<typeof LeaderboardManager> {
  static propsDefinition = {};

  preStart() {
    // Initialize network event connnections
    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      LeaderboardEvents.IncrementEliminations,
      (data: { player: hz.Player }) => {
        this.incrementEliminations('Bystander');
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player; amount: number }>(
      LeaderboardEvents.IncrementTimePlayed,
      (data: { player: hz.Player; amount: number }) => {
        this.incrementTimePlayed(data.amount);
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      LeaderboardEvents.IncrementMurdererEliminations,
      (data: { player: hz.Player }) => {
        this.incrementEliminations('Murderer');
      }
    );

  }

  start() {
    // Grab players current leaderboard stats from a database or storage
    this.entity.owner.get();
  }


  incrementEliminations(role: 'Murderer' | 'Bystander') {
    // Increment the eliminations for the specified role
  }

  incrementTimePlayed(amount: number) {
    // Increment the total time played by the specified amount
  }

  incrementRoundsPlayed() {
    // Increment the total rounds played
  }

  setGold(amount: number) {
    // Set the player's gold/currency to the specified amount
  }

}
hz.Component.register(LeaderboardManager);