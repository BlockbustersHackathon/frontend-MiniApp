// Local storage utilities for frontend-only DApp data persistence

export interface UserContribution {
  campaignId: string;
  amount: string;
  timestamp: number;
  txHash?: string;
}

export interface UserToken {
  campaignId: string;
  campaignName: string;
  tokenAddress: string;
  tokenAmount: string;
  claimed: boolean;
  contributionAmount: string;
  claimTxHash?: string;
}

export interface UserData {
  address: string;
  contributions: UserContribution[];
  tokens: UserToken[];
}

const STORAGE_KEY = 'crowdfunding_user_data';

// Get user data from localStorage
export function getUserData(address: string): UserData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { address, contributions: [], tokens: [] };
    
    const allData = JSON.parse(data);
    return allData[address.toLowerCase()] || { address, contributions: [], tokens: [] };
  } catch (error) {
    console.error('Error reading user data:', error);
    return { address, contributions: [], tokens: [] };
  }
}

// Save user data to localStorage
export function saveUserData(userData: UserData): void {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const allData = data ? JSON.parse(data) : {};
    
    allData[userData.address.toLowerCase()] = userData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Add a contribution record
export function addUserContribution(
  address: string, 
  campaignId: string, 
  amount: string, 
  txHash?: string
): void {
  const userData = getUserData(address);
  const contribution: UserContribution = {
    campaignId,
    amount,
    timestamp: Date.now(),
    txHash,
  };
  
  // Check if contribution already exists (prevent duplicates)
  const existingIndex = userData.contributions.findIndex(
    c => c.campaignId === campaignId && c.txHash === txHash
  );
  
  if (existingIndex >= 0) {
    // Update existing contribution
    userData.contributions[existingIndex] = contribution;
  } else {
    userData.contributions.push(contribution);
  }
  
  saveUserData(userData);
}

// Add a token record (when user contributes to launchpad)
export function addUserToken(
  address: string,
  campaignId: string,
  campaignName: string,
  tokenAddress: string,
  tokenAmount: string,
  contributionAmount: string
): void {
  const userData = getUserData(address);
  const token: UserToken = {
    campaignId,
    campaignName,
    tokenAddress,
    tokenAmount,
    claimed: false,
    contributionAmount,
  };
  
  // Check if token already exists
  const existingIndex = userData.tokens.findIndex(t => t.campaignId === campaignId);
  
  if (existingIndex >= 0) {
    // Update existing token (accumulate amounts if multiple contributions)
    const existing = userData.tokens[existingIndex];
    userData.tokens[existingIndex] = {
      ...existing,
      tokenAmount: (parseFloat(existing.tokenAmount) + parseFloat(tokenAmount)).toString(),
      contributionAmount: (parseFloat(existing.contributionAmount) + parseFloat(contributionAmount)).toString(),
    };
  } else {
    userData.tokens.push(token);
  }
  
  saveUserData(userData);
}

// Mark token as claimed
export function markTokenClaimed(
  address: string,
  campaignId: string,
  claimTxHash?: string
): void {
  const userData = getUserData(address);
  const tokenIndex = userData.tokens.findIndex(t => t.campaignId === campaignId);
  
  if (tokenIndex >= 0) {
    userData.tokens[tokenIndex].claimed = true;
    if (claimTxHash) {
      userData.tokens[tokenIndex].claimTxHash = claimTxHash;
    }
    saveUserData(userData);
  }
}

// Get unique contributed campaign IDs
export function getContributedCampaignIds(address: string): string[] {
  const userData = getUserData(address);
  return [...new Set(userData.contributions.map(c => c.campaignId))];
}

// Get total contribution for a campaign
export function getTotalContributionForCampaign(address: string, campaignId: string): string {
  const userData = getUserData(address);
  const campaignContributions = userData.contributions.filter(c => c.campaignId === campaignId);
  const total = campaignContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
  return total.toString();
}