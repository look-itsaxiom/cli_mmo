// Unhoused Types
export type UnitType = 'warrior' | 'scout' | 'mage';

// Map
export type TerritoryId = string;

export type BiomeType = 'forest' | 'plains' | 'hills' | 'mountains' | 'desert' | 'wetland' | 'wildlands';

export type NPCId = 'soverignity' | 'bandit';

export type BuildingCapacity = number;

export type NaturalResourceType = 'wood' | 'stone' | 'iron' | 'food' | 'etherium' | 'mythril';

export type RefinedResourceType = 'plank' | 'brick' | 'ingot' | 'meal' | 'crystal' | 'alloy';

export type TradeResourceType = 'cp' | 'sp' | 'gp' | NaturalResourceType | RefinedResourceType;

export type Resource = NaturalResourceType | RefinedResourceType | TradeResourceType;

export type THexCoordinates = {
  q: number;
  r: number;
  toString: () => string;
  toCubic: () => { x: number; y: number; z: number };
};

export type TerritoryResourceRates = {
  [key in NaturalResourceType]?: number;
};

export enum TerritoryClaimStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  WITHDRAWN = 'withdrawn',
}

export interface TerritoryBiome {
  type: BiomeType;
  resources: TerritoryResourceRates;
}

export interface IBiomeTemplate {
  type: BiomeType;
  resourceRanges: {
    [K in NaturalResourceType]: [number, number];
  };
  bpRange: [number, number];
  npcOwnershipRate: number;
}

export interface TerritoryClaim {
  id: string;
  territoryId: TerritoryId;
  claimantId: UserId;
  claimantNationId: NationId;
  createdAt: Date;
  status: TerritoryClaimStatus;
  isOpen: boolean;
  expiresAt?: Date;
  isContested: boolean;
  updatedAt: Date;
}

export interface ITerritory {
  id: string;
  biome: TerritoryBiome;
  location: THexCoordinates;
  claimed: boolean;
  claimedBy: NationId | NPCId | null;
  claims: TerritoryClaim[];
  claimHistory: Record<string, TerritoryClaim[]>; // Date, Claims at time of date
  maxBC: BuildingCapacity;
  currentBC: BuildingCapacity;
}

// User
export type UserId = string;

export type NationId = string;

export interface UserData {
  id?: UserId;
  email: string;
  name?: string;
  userName: string;
  nationId?: NationId;
}

export type NationResourceInventory = {
  [K in Resource]?: {
    type: K;
    amount: number;
    resourceId: string;
  };
};

export interface INation {
  id?: NationId;
  name: string;
  code: string;
  leader: UserId;
  territories: ITerritory[];
  ownedResources: NationResourceInventory;
}

// Service
export type Tick = number;
export type RuntimeId = string;
export type JobRequestId = string;
export type TickRecordStatus = 'pending' | 'completed' | 'failed';

export enum ActionTier {
  INFO = 'info',
  ORDER = 'order',
  DISTANCE = 'distance',
  TIMER = 'timer',
}

export interface TickRecord {
  tick: Tick;
  id: string; // Unique identifier for the tick record Date + Tick + RuntimeId
  timestamp: Date;
  status: TickRecordStatus;
  jobRequestsCompleted: JobRequestId[];
}

export interface JobRequest {
  id: JobRequestId;
  actionType: ActionTier;
}
