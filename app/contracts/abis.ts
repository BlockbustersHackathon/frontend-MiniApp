// Contract ABIs for the crowdfunding platform

export const CROWDFUNDING_FACTORY_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {"name": "_tokenFactory", "type": "address"},
      {"name": "_pricingCurve", "type": "address"}, 
      {"name": "_dexIntegrator", "type": "address"},
      {"name": "_usdcToken", "type": "address"},
      {"name": "_owner", "type": "address"}
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      {"name": "name", "type": "string"},
      {"name": "metadataURI", "type": "string"},
      {"name": "fundingGoal", "type": "uint256"},
      {"name": "duration", "type": "uint256"},
      {"name": "creatorReservePercentage", "type": "uint256"},
      {"name": "liquidityPercentage", "type": "uint256"},
      {"name": "tokenName", "type": "string"},
      {"name": "tokenSymbol", "type": "string"}
    ],
    "outputs": [
      {"name": "campaignId", "type": "uint256"},
      {"name": "campaignAddress", "type": "address"}
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCampaign",
    "inputs": [{"name": "campaignId", "type": "uint256"}],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {"name": "creator", "type": "address"},
          {"name": "name", "type": "string"},
          {"name": "metadataURI", "type": "string"},
          {"name": "fundingGoal", "type": "uint256"},
          {"name": "deadline", "type": "uint256"},
          {"name": "totalRaised", "type": "uint256"},
          {"name": "creatorReservePercentage", "type": "uint256"},
          {"name": "liquidityPercentage", "type": "uint256"},
          {"name": "tokenAddress", "type": "address"},
          {"name": "state", "type": "uint8"},
          {"name": "createdAt", "type": "uint256"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCampaignsByCreator",
    "inputs": [{"name": "creator", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCampaignCount",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCampaignAddress",
    "inputs": [{"name": "campaignId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CampaignCreated",
    "inputs": [
      {"name": "campaignId", "type": "uint256", "indexed": true},
      {"name": "creator", "type": "address", "indexed": true},
      {"name": "tokenAddress", "type": "address", "indexed": true},
      {"name": "fundingGoal", "type": "uint256", "indexed": false},
      {"name": "deadline", "type": "uint256", "indexed": false}
    ]
  }
] as const;

export const CAMPAIGN_ABI = [
  {
    "type": "function",
    "name": "contribute",
    "inputs": [{"name": "amount", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCampaignDetails",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {"name": "creator", "type": "address"},
          {"name": "name", "type": "string"},
          {"name": "metadataURI", "type": "string"},
          {"name": "fundingGoal", "type": "uint256"},
          {"name": "deadline", "type": "uint256"},
          {"name": "totalRaised", "type": "uint256"},
          {"name": "creatorReservePercentage", "type": "uint256"},
          {"name": "liquidityPercentage", "type": "uint256"},
          {"name": "tokenAddress", "type": "address"},
          {"name": "state", "type": "uint8"},
          {"name": "createdAt", "type": "uint256"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getContribution",
    "inputs": [{"name": "contributor", "type": "address"}],
    "outputs": [
      {
        "name": "",
        "type": "tuple", 
        "components": [
          {"name": "contributor", "type": "address"},
          {"name": "amount", "type": "uint256"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "tokenAllocation", "type": "uint256"},
          {"name": "claimed", "type": "bool"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimTokens",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawFunds",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "refund",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;

export const MOCK_USDC_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "account", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view"
  }
] as const;