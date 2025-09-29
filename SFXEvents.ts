import * as hz from "horizon/core";

export const SFXEvents = {
  PlayersSpawnedSFX: new hz.LocalEvent<{}>("PlayersSpawnedSFX"),
  PreRoundStartSFX: new hz.LocalEvent<{}>("PreRoundStartSFX"),
  RoundStartSFX: new hz.LocalEvent<{}>("RoundStartSFX"),
  MurdererWinSFX: new hz.LocalEvent<{}>("MurdererWinSFX"),
  InnocentWinSFX: new hz.LocalEvent<{}>("InnocentWinSFX"),
  CrossbowSpawnSFX: new hz.LocalEvent<{}>("CrossbowSpawnSFX"),
  PartsSpawnedSFX: new hz.LocalEvent<{}>("PartsSpawnedSFX"),
  PartCollectSFX: new hz.LocalEvent<{}>("PartCollectSFX"),
};
