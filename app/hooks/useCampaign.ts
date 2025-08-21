import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CAMPAIGN_ABI } from '../contracts/abis';

// Hook to contribute to a campaign
export function useCampaignContribute(campaignAddress: `0x${string}` | undefined) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const contribute = (amount: bigint) => {
    if (!campaignAddress) return;
    
    writeContract({
      address: campaignAddress,
      abi: CAMPAIGN_ABI,
      functionName: 'contribute',
      args: [amount],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    contribute,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Hook to get campaign details directly from campaign contract
export function useCampaignDetails(campaignAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_ABI,
    functionName: 'getCampaignDetails',
    query: {
      enabled: !!campaignAddress,
      refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    },
  });
}

// Hook to get user's contribution to a specific campaign
export function useUserContribution(
  campaignAddress: `0x${string}` | undefined,
  userAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_ABI,
    functionName: 'getContribution',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!(campaignAddress && userAddress),
      refetchInterval: 10000,
    },
  });
}

// Hook to claim tokens
export function useClaimTokens(campaignAddress: `0x${string}` | undefined) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const claimTokens = () => {
    if (!campaignAddress) return;
    
    writeContract({
      address: campaignAddress,
      abi: CAMPAIGN_ABI,
      functionName: 'claimTokens',
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claimTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Hook to withdraw funds (for campaign creators)
export function useWithdrawFunds(campaignAddress: `0x${string}` | undefined) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const withdrawFunds = () => {
    if (!campaignAddress) return;
    
    writeContract({
      address: campaignAddress,
      abi: CAMPAIGN_ABI,
      functionName: 'withdrawFunds',
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    withdrawFunds,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Hook to refund (for failed campaigns)
export function useRefund(campaignAddress: `0x${string}` | undefined) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const refund = () => {
    if (!campaignAddress) return;
    
    writeContract({
      address: campaignAddress,
      abi: CAMPAIGN_ABI,
      functionName: 'refund',
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    refund,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Hook to create liquidity pool (for successful launchpad campaigns)
export function useCreateLiquidityPool(campaignAddress: `0x${string}` | undefined) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const createLiquidityPool = () => {
    if (!campaignAddress) return;
    
    writeContract({
      address: campaignAddress,
      abi: CAMPAIGN_ABI,
      functionName: 'createLiquidityPool',
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createLiquidityPool,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}