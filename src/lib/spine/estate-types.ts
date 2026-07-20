export type MatrixCell = {
  personaId: string;
  personaName: string;
  serviceId: string;
  serviceName: string;
  episodeCount: number;
  hasActiveEpisode: boolean;
  hasStages: boolean;
  hasSop: boolean;
  status: "empty" | "partial" | "ready";
};

export type MatrixPayload = {
  services: { id: string; name: string; isGoldPath: boolean }[];
  personas: { id: string; name: string }[];
  cells: MatrixCell[];
};
