import * as hz from "horizon/core";
import { Leaderboards, PlayerStats } from "LeaderboardEvents";
import { LeaderboardEvents } from "LeaderboardEvents";

class LeaderboardManager extends hz.Component<typeof LeaderboardManager> {
  static propsDefinition = {};

  preStart() {
    // Initialize network event connections for stat increments
    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      LeaderboardEvents.IncrementEliminations,
      (data: { player: hz.Player }) => {
        this.incrementEliminations(data.player, "Bystander");
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player; amount: number }>(
      LeaderboardEvents.IncrementTimePlayed,
      (data: { player: hz.Player; amount: number }) => {
        this.incrementTimePlayed(data.player, data.amount);
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      LeaderboardEvents.IncrementMurdererEliminations,
      (data: { player: hz.Player }) => {
        this.incrementEliminations(data.player, "Murderer");
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      LeaderboardEvents.IncrementRoundsWonAsMurderer,
      (data: { player: hz.Player }) => {
        this.incrementStat(
          data.player,
          PlayerStats.MurdererKills,
          1,
          Leaderboards.RoundsWonAsMurderer
        );
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      LeaderboardEvents.IncrementRoundsWonAsInnocent,
      (data: { player: hz.Player }) => {
        this.incrementStat(
          data.player,
          PlayerStats.InnocentKills,
          1,
          Leaderboards.RoundsWonAsInnocent
        );
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      LeaderboardEvents.IncrementRoundsPlayed,
      (data: { player: hz.Player }) => {
        this.incrementRoundsPlayed(data.player);
      }
    );
  }

  start() {}

  // Stat increment methods - Meta Horizon handles persistence automatically
  private incrementStat(
    player: hz.Player,
    stat: PlayerStats,
    amount: number = 1,
    leaderboard: Leaderboards
  ): void {
    // Meta Horizon automatically persists player variable changes
    const currentValue =
      this.world.persistentStorage.getPlayerVariable(
        player,
        `player_stats:${stat}`
      ) || 0;
    const newValue = currentValue + amount;
    this.world.persistentStorage.setPlayerVariable(
      player,
      `player_stats:${stat}`,
      newValue
    );
    console.log(
      `Incremented ${stat} for ${player.name.get()} by ${amount}. New value: ${newValue}`
    );
    this.world.leaderboards.setScoreForPlayer(
      leaderboard,
      player,
      newValue,
      true
    );
  }

  incrementEliminations(player: hz.Player, role: "Murderer" | "Bystander") {
    if (role === "Murderer") {
      this.incrementStat(
        player,
        PlayerStats.MurdererKills,
        1,
        Leaderboards.EliminationsAsMurderer
      );
    } else {
      this.incrementStat(
        player,
        PlayerStats.InnocentKills,
        1,
        Leaderboards.EliminationsAsInnocent
      );
    }
  }

  incrementTimePlayed(player: hz.Player, amount: number) {
    this.incrementStat(
      player,
      PlayerStats.TimePlayed,
      amount,
      Leaderboards.TimePlayed
    );
  }

  incrementRoundsPlayed(player: hz.Player) {
    this.incrementStat(
      player,
      PlayerStats.RoundsPlayed,
      1,
      Leaderboards.RoundsPlayed
    );
  }
}

hz.Component.register(LeaderboardManager);
