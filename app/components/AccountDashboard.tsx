'use client';

import { useState, useEffect } from 'react';
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
import { getUserData, getContributedCampaignIds, UserToken } from '../utils/localStorage';

interface AccountDashboardProps {
  onBack?: () => void;
  onCampaignSelect?: (campaignId: bigint, campaign: CampaignData) => void;
}

type TabType = 'created' | 'contributed' | 'tokens';

export default function AccountDashboard({ onBack, onCampaignSelect }: AccountDashboardProps) {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('created');
  const [userData, setUserData] = useState<{ contributedCampaignIds: string[]; tokens: UserToken[] }>({
    contributedCampaignIds: [],
    tokens: []
  });

  // Get user's created campaigns
  const { data: createdCampaignIds } = useCampaignsByCreator(address);
  const { data: usdcBalance } = useUSDCBalance(address);

  // Load user data from localStorage
  useEffect(() => {
    if (address) {
      const contributedCampaignIds = getContributedCampaignIds(address);
      const userDataFromStorage = getUserData(address);
      setUserData({
        contributedCampaignIds,
        tokens: userDataFromStorage.tokens
      });
    }
  }, [address]);

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
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
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
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{userData.tokens.length}</div>
              <div className="text-xs text-gray-500">Tokens</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'created'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Campaigns
            </button>
            <button
              onClick={() => setActiveTab('contributed')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'contributed'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Contributed
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'tokens'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Tokens
            </button>
          </div>

          <div className="p-4">
            {/* Created Campaigns Tab */}
            {activeTab === 'created' && (
              <CreatedCampaigns 
                campaignIds={createdCampaignIds} 
                onCampaignSelect={onCampaignSelect}
              />
            )}

            {/* Contributed Campaigns Tab */}
            {activeTab === 'contributed' && (
              <ContributedCampaigns 
                campaignIds={userData.contributedCampaignIds}
                onCampaignSelect={onCampaignSelect}
              />
            )}

            {/* User Tokens Tab */}
            {activeTab === 'tokens' && (
              <UserTokens tokens={userData.tokens} />
            )}
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

// Component for showing campaigns user contributed to
function ContributedCampaigns({ 
  campaignIds, 
  onCampaignSelect 
}: { 
  campaignIds: string[];
  onCampaignSelect?: (campaignId: bigint, campaign: CampaignData) => void;
}) {
  if (!campaignIds || campaignIds.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No contributions yet</p>
        <p className="text-gray-400 text-xs mt-1">Support projects you believe in!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaignIds.map((campaignId) => (
        <ContributedCampaignItem
          key={campaignId}
          campaignId={BigInt(campaignId)}
          onSelect={onCampaignSelect}
        />
      ))}
    </div>
  );
}

// Component for showing user's tokens
function UserTokens({ tokens }: { tokens: UserToken[] }) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No tokens yet</p>
        <p className="text-gray-400 text-xs mt-1">Contribute to Launchpad campaigns to earn tokens!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tokens.map((token, index) => (
        <TokenItem key={`${token.campaignId}-${index}`} token={token} />
      ))}
    </div>
  );
}

// Component for contributed campaign item (similar to CampaignItem but with contribution info)
function ContributedCampaignItem({ 
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

// Component for displaying user token information
function TokenItem({ token }: { token: UserToken }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{token.campaignName}</h3>
          <p className="text-sm text-gray-500 mb-2">
            From {parseFloat(token.contributionAmount).toLocaleString()} USDC contribution
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-purple-600">
                {parseFloat(token.tokenAmount).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 ml-1">tokens</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              token.claimed 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {token.claimed ? 'Claimed' : 'Claimable'}
            </div>
          </div>
          {token.claimed && token.claimTxHash && (
            <div className="mt-2">
              <a 
                href={`https://basescan.org/tx/${token.claimTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View claim transaction
              </a>
            </div>
          )}
        </div>
      </div>
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