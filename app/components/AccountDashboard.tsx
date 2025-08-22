'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Address,
} from '@coinbase/onchainkit/identity';
import { useCampaignsByCreator, useCampaign } from '../hooks/useCrowdfundingFactory';
import { useUSDCBalance } from '../hooks/useUSDC';
import CampaignCard from './CampaignCard';
import { CampaignData } from '../types/campaign';

interface AccountDashboardProps {
  onBack?: () => void;
  onCampaignSelect?: (campaignId: bigint, campaign: CampaignData) => void;
}


export default function AccountDashboard({ onBack, onCampaignSelect }: AccountDashboardProps) {
  const { address, isConnected } = useAccount();

  // Get user's created campaigns
  const { data: createdCampaignIds } = useCampaignsByCreator(address);
  const { data: usdcBalance } = useUSDCBalance(address);


  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 text-sm mb-6">
            Connect your wallet to view your campaigns, contributions, and tokens.
          </p>
          <Wallet>
            <ConnectWallet className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium w-full">
              Connect Wallet
            </ConnectWallet>
          </Wallet>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button onClick={onBack} className="p-2 -ml-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">Account</h1>
          </div>
          <Wallet>
            <ConnectWallet className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
              <Avatar address={address} className="h-5 w-5" />
              <Name address={address} className="text-sm" />
            </ConnectWallet>
            <WalletDropdown>
              <div className="px-4 pt-3 pb-2">
                <Avatar address={address} className="h-8 w-8" />
                <Name address={address} className="font-semibold" />
                <Address address={address} className="text-sm text-gray-600" />
              </div>
              <WalletDropdownDisconnect className="hover:bg-gray-100" />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar address={address} className="h-16 w-16" />
            <div className="flex-1">
              <Name address={address} className="text-lg font-bold text-gray-900" />
              <Address address={address} className="text-sm text-gray-500" />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {createdCampaignIds?.length || 0}
              </div>
              <div className="text-xs text-gray-500">Created</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)).toLocaleString() : '0'}
              </div>
              <div className="text-xs text-gray-500">USDC Balance</div>
            </div>
          </div>
        </div>

        {/* My Campaigns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">My Campaigns</h2>
          </div>
          <div className="p-4">
            <CreatedCampaigns 
              campaignIds={createdCampaignIds} 
              onCampaignSelect={onCampaignSelect}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <button onClick={onBack} className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-400">home</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
            <span className="text-xs text-gray-600">account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for showing user's created campaigns
function CreatedCampaigns({ 
  campaignIds, 
  onCampaignSelect 
}: { 
  campaignIds?: readonly bigint[];
  onCampaignSelect?: (campaignId: bigint, campaign: CampaignData) => void;
}) {
  if (!campaignIds || campaignIds.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No campaigns created yet</p>
        <p className="text-gray-400 text-xs mt-1">Create your first campaign to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaignIds.map((campaignId) => (
        <CampaignItem
          key={campaignId.toString()}
          campaignId={campaignId}
          onSelect={onCampaignSelect}
        />
      ))}
    </div>
  );
}





// Reusable campaign item component
function CampaignItem({ 
  campaignId, 
  onSelect 
}: { 
  campaignId: bigint; 
  onSelect?: (campaignId: bigint, campaign: CampaignData) => void;
}) {
  const { data: campaign, isLoading, error } = useCampaign(campaignId);

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-4">
        <p className="text-red-500 text-sm">Error loading campaign #{campaignId.toString()}</p>
      </div>
    );
  }

  return (
    <CampaignCard
      campaign={campaign}
      campaignId={campaignId}
      onClick={() => onSelect?.(campaignId, campaign)}
    />
  );
}