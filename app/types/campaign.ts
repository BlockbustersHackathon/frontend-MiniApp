// TypeScript types for campaign data

export enum CampaignState {
  Active = 0,
  Succeeded = 1,
  Failed = 2,
}

export interface CampaignData {
  creator: `0x${string}`;
  name: string;
  metadataURI: string;
  fundingGoal: bigint;
  deadline: bigint;
  totalRaised: bigint;
  creatorReservePercentage: bigint;
  liquidityPercentage: bigint;
  tokenAddress: `0x${string}`;
  state: CampaignState;
  createdAt: bigint;
}

export interface Contribution {
  contributor: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
  tokenAllocation: bigint;
  claimed: boolean;
}

export interface CampaignFormData {
  projectMode: 'launchpad' | 'classic';
  projectIcon: File | null;
  projectName: string;
  deadline: string;
  fundraisingGoal: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  keepToken: string;
  liquidityPoolPercentage: number;
  projectIntroduction: string;
}

export interface CreateCampaignParams {
  name: string;
  metadataURI: string;
  fundingGoal: bigint;
  duration: bigint;
  creatorReservePercentage: bigint;
  liquidityPercentage: bigint;
  tokenName: string;
  tokenSymbol: string;
}