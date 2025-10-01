import * as hz from "horizon/core";

export enum PlayerStats {
  Deaths = "Deaths",
  InnocentKills = "Innocent Kills",
  MurdererKills = "Murderer Kills",
  PartsCollected = "Parts Collected",
  RoundsPlayed = "Rounds Played",
  TimePlayed = "Time Played",
}

export enum Leaderboards {
  EliminationsAsMurderer = "EliminationsAsMurderer",
  EliminationsAsInnocent = "EliminationsAsInnocent",
  RoundsWonAsMurderer = "RoundsWonAsMurderer",
  RoundsWonAsInnocent = "RoundsWonAsInnocent",
  PartsCollected = "PartsCollected",
  TimePlayed = "TimePlayed",
  RoundsPlayed = "RoundsPlayed",
}

export const LeaderboardEvents = {
  IncrementEliminations: new hz.LocalEvent<{ player: hz.Player }>(
    "IncrementEliminations"
  ),
  IncrementTimePlayed: new hz.LocalEvent<{ player: hz.Player; amount: number }>(
    "IncrementTimePlayed"
  ),
  IncrementMurdererEliminations: new hz.LocalEvent<{ player: hz.Player }>(
    "IncrementMurdererEliminations"
  ),
  IncrementRoundsWonAsMurderer: new hz.LocalEvent<{ player: hz.Player }>(
    "IncrementRoundsWonRo"
  ),
  IncrementRoundsWonAsInnocent: new hz.LocalEvent<{ player: hz.Player }>(
    "IncrementRoundsWonAsInnocent"
  ),
  IncrementRoundsPlayed: new hz.LocalEvent<{ player: hz.Player }>(
    "IncrementRoundsPlayed"
  ),
  SetGold: new hz.LocalEvent<{ player: hz.Player; amount: number }>("SetGold"),
};

export default LeaderboardEvents;
