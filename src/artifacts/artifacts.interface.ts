export interface StatusRO {
  status: 'disabled' | 'enabled' | 'over_limit' | 'paused';
}

export interface PutArtifactRO {
  urls: string[];
}
