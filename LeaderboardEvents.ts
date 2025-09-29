import * as hz from "horizon/core";

export enum LeaderboardNames {
  "Eliminations",
  "TimePlayed",
  "RoundsPlayed",
  "Gold",
}



export const LeaderboardEvents = {
  IncrementEliminations: new hz.LocalEvent<{ player: hz.Player }>("IncrementEliminations"),
  IncrementTimePlayed: new hz.LocalEvent<{ player: hz.Player; amount: number }>("IncrementTimePlayed"),
  IncrementMurdererEliminations: new hz.LocalEvent<{ player: hz.Player }>("IncrementMurdererEliminations"),
  IncrementRoundsWonAsMurderer: new hz.LocalEvent<{ player: hz.Player }>("IncrementRoundsWonRo"),
  IncrementRoundsWonAsInnocent: new hz.LocalEvent<{ player: hz.Player }>("IncrementRoundsWonAsInnocent"),
  IncrementRoundsPlayed: new hz.LocalEvent<{ player: hz.Player }>("IncrementRoundsPlayed"),
  SetGold: new hz.LocalEvent<{ player: hz.Player; amount: number }>("SetGold"),
};

export default LeaderboardEvents;
