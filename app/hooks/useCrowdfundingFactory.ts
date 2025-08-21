import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CROWDFUNDING_FACTORY_ABI } from '../contracts/abis';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { CreateCampaignParams } from '../types/campaign';

// Hook to read campaign data
export function useCampaign(campaignId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CROWDFUNDING_FACTORY as `0x${string}`,
    abi: CROWDFUNDING_FACTORY_ABI,
    functionName: 'getCampaign',
    args: campaignId !== undefined ? [campaignId] : undefined,
    query: {
      enabled: campaignId !== undefined,
    },
  });
}

// Hook to read campaign count
export function useCampaignCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CROWDFUNDING_FACTORY as `0x${string}`,
    abi: CROWDFUNDING_FACTORY_ABI,
    functionName: 'getCampaignCount',
  });
}

// Hook to read campaigns by creator
export function useCampaignsByCreator(creator: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.CROWDFUNDING_FACTORY as `0x${string}`,
    abi: CROWDFUNDING_FACTORY_ABI,
    functionName: 'getCampaignsByCreator',
    args: creator ? [creator] : undefined,
    query: {
      enabled: !!creator,
    },
  });
}

// Hook to create a campaign
export function useCreateCampaign() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const createCampaign = (params: CreateCampaignParams) => {
    writeContract({
      address: CONTRACT_ADDRESSES.CROWDFUNDING_FACTORY as `0x${string}`,
      abi: CROWDFUNDING_FACTORY_ABI,
      functionName: 'createCampaign',
      args: [
        params.name,
        params.metadataURI,
        params.fundingGoal,
        params.duration,
        params.creatorReservePercentage,
        params.liquidityPercentage,
        params.tokenName,
        params.tokenSymbol,
      ],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createCampaign,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}