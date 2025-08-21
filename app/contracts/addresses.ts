// Contract addresses on Base mainnet

export const CONTRACT_ADDRESSES = {
  CROWDFUNDING_FACTORY: process.env.NEXT_PUBLIC_CROWDFUNDING_FACTORY_ADDRESS || '0x0bD88C32D195DE9De26127704FCeB7458E0094f9',
  MOCK_USDC: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '0x6B38Bc61C90F80F77F3A65B0EA470259e682951B',
} as const;

// Network configuration
export const BASE_CHAIN_ID = 8453; // Base mainnet
export const BASE_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/8LK7JlayOjp7ZbezGHQ0o';

// Campaign creation constants
export const CAMPAIGN_CONSTANTS = {
  MIN_FUNDING_GOAL: 100_000_000, // 100 USDC (6 decimals)
  MAX_FUNDING_GOAL: 10_000_000_000_000, // 10M USDC (6 decimals)
  MIN_DURATION: 0, // 0 days
  MAX_DURATION: 180 * 24 * 60 * 60, // 180 days in seconds
  CREATOR_RESERVE_PERCENTAGE: 25, // Fixed 25%
} as const;