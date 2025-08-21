'use client';

import { useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract, useWriteContract } from 'wagmi';
import { CAMPAIGN_ABI } from '../contracts/abis';

interface CampaignStateUpdaterProps {
  campaignAddress: `0x${string}`;
}

export default function CampaignStateUpdater({ campaignAddress }: CampaignStateUpdaterProps) {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // Get campaign details to check state
  const { refetch } = useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_ABI,
    functionName: 'getCampaignDetails',
    query: {
      refetchInterval: 30000, // Check every 30 seconds
    },
  });

  const updateCampaignState = useCallback(() => {
    if (!isConnected || !campaignAddress) return;
    
    writeContract({
      address: campaignAddress,
      abi: CAMPAIGN_ABI,
      functionName: 'updateCampaignState',
    });
  }, [isConnected, campaignAddress, writeContract]);

  // Auto-update campaign state when component mounts or state changes
  useEffect(() => {
    if (campaignAddress && isConnected) {
      // Update state on mount
      updateCampaignState();
      
      // Set up interval to periodically update state
      const interval = setInterval(() => {
        updateCampaignState();
        refetch();
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [campaignAddress, isConnected, updateCampaignState, refetch]);

  // This component doesn't render anything visible
  return null;
}