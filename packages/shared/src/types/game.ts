export interface HexCoordinates {
  q: number;
  r: number;
}

export type ResourceType = 'wood' | 'stone' | 'iron' | 'food' | 'gp' | 'etherium' | 'mythril';

export type UnitType = 'warrior' | 'scout' | 'mage';

export type BiomeType = 'forest' | 'plains' | 'hills' | 'mountains' | 'desert' | 'wetland' | 'wildlands';

export enum ActionTier {
  INFO = 'info',
  ORDER = 'order',
  DISTANCE = 'distance',
  TIMER = 'timer',
}

export interface JobRequest {
  id: string;
  actionType: ActionTier;
}
