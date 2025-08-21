'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CampaignData, CampaignState } from '../types/campaign';
import { useCampaignContribute, useUserContribution, useWithdrawFunds, useClaimTokens, useRefund } from '../hooks/useCampaign';
import { useUSDCApprove, useUSDCAllowance } from '../hooks/useUSDC';
import { useReadContract } from 'wagmi';
import { CROWDFUNDING_FACTORY_ABI } from '../contracts/abis';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
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

interface CampaignDetailsProps {
  campaignId: bigint;
  campaign: CampaignData;
  onBack?: () => void;
}

export default function CampaignDetails({ campaignId, campaign, onBack }: CampaignDetailsProps) {
  const { address, isConnected } = useAccount();
  const [contributionAmount, setContributionAmount] = useState('');

  // Get campaign address from factory
  const { data: campaignAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.CROWDFUNDING_FACTORY as `0x${string}`,
    abi: CROWDFUNDING_FACTORY_ABI,
    functionName: 'getCampaignAddress',
    args: [campaignId],
  });

  // Contract hooks
  const { contribute, isPending: isContributing, isConfirming, isConfirmed, error: contributeError, hash } = useCampaignContribute(campaignAddress);
  const { data: userContribution } = useUserContribution(campaignAddress, address);
  const { data: allowance } = useUSDCAllowance(address, campaignAddress);
  const { approve, isPending: isApproving, isConfirmed: isApproved } = useUSDCApprove();
  const { withdrawFunds, isPending: isWithdrawing, isConfirmed: isWithdrawn, error: withdrawError, hash: withdrawHash } = useWithdrawFunds(campaignAddress);
  const { claimTokens, isPending: isClaiming, isConfirmed: isClaimed, error: claimError, hash: claimHash } = useClaimTokens(campaignAddress);
  const { refund, isPending: isRefunding, isConfirmed: isRefunded, error: refundError, hash: refundHash } = useRefund(campaignAddress);
  
  const [needsApproval, setNeedsApproval] = useState(false);

  const fundingGoalFormatted = parseFloat(formatUnits(campaign.fundingGoal, 6));
  const totalRaisedFormatted = parseFloat(formatUnits(campaign.totalRaised, 6));
  const progressPercentage = Math.min((totalRaisedFormatted / fundingGoalFormatted) * 100, 100);
  
  const deadline = new Date(Number(campaign.deadline) * 1000);
  const now = new Date();
  const isExpired = deadline <= now;
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const getProjectModeFromMetadata = (metadataURI: string): 'launchpad' | 'classic' => {
    try {
      if (metadataURI.startsWith('data:application/json,')) {
        const jsonString = decodeURIComponent(metadataURI.substring(22));
        const metadata = JSON.parse(jsonString);
        return metadata.projectMode || 'classic';
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }
    return 'classic';
  };

  const getDescriptionFromMetadata = (metadataURI: string): string => {
    try {
      if (metadataURI.startsWith('data:application/json,')) {
        const jsonString = decodeURIComponent(metadataURI.substring(22));
        const metadata = JSON.parse(jsonString);
        return metadata.description || 'No description available';
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }
    return 'Description not available';
  };

  const projectMode = getProjectModeFromMetadata(campaign.metadataURI);
  const description = getDescriptionFromMetadata(campaign.metadataURI);

  const handleContribute = async () => {
    if (!isConnected || !contributionAmount || !campaignAddress) return;
    
    const contributionAmountWei = parseUnits(contributionAmount, 6); // USDC has 6 decimals
    
    // Check if we need approval first
    if (!allowance || allowance < contributionAmountWei) {
      // Need to approve first
      await approve(campaignAddress, contributionAmountWei);
      setNeedsApproval(true);
    } else {
      // Can contribute directly
      contribute(contributionAmountWei);
    }
  };

  // Auto-contribute after approval
  useEffect(() => {
    if (isApproved && needsApproval && contributionAmount && campaignAddress) {
      const contributionAmountWei = parseUnits(contributionAmount, 6);
      contribute(contributionAmountWei);
      setNeedsApproval(false);
    }
  }, [isApproved, needsApproval, contributionAmount, campaignAddress, contribute]);

  const isCreator = isConnected && address === campaign.creator;
  const canContribute = isConnected && 
                       campaign.state === CampaignState.Active && 
                       !isExpired && 
                       !isCreator;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 -ml-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Project</h1>
          </div>
          <div className="flex items-center space-x-2">
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
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Campaign Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Project Icon and Title */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4l-2-4M5 7l2-4" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{campaign.name}</h2>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-3 py-1 rounded-full ${
                  projectMode === 'launchpad' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {projectMode === 'launchpad' ? 'Launchpad' : 'Classic'}
                </span>
                <span className="text-gray-500">
                  owned by owner
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                created {new Date(Number(campaign.createdAt) * 1000).toLocaleDateString()} • 
                deadline {deadline.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {daysLeft > 0 ? `${daysLeft} days left` : isExpired ? 'Expired' : 'Less than a day left'}
              </span>
              <span className="font-medium text-purple-600">{progressPercentage.toFixed(1)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  campaign.state === CampaignState.Succeeded ? 'bg-green-500' :
                  campaign.state === CampaignState.Failed ? 'bg-red-500' :
                  'bg-purple-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Funding Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-sm text-gray-500">Payments</div>
                <div className="text-lg font-bold text-gray-900">
                  {totalRaisedFormatted.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Goal / Now</div>
                <div className="text-lg font-bold text-gray-900">
                  {fundingGoalFormatted.toLocaleString()} / {totalRaisedFormatted.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Section */}
        {canContribute && (
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Contribute to this project</h3>
            
            {/* Transaction Status */}
            {(isApproving || isContributing || isConfirming || isConfirmed || contributeError) && (
              <div className={`mb-4 p-4 rounded-lg ${
                isConfirmed ? 'bg-green-50 border border-green-200' : 
                contributeError ? 'bg-red-50 border border-red-200' : 
                'bg-blue-50 border border-blue-200'
              }`}>
                {isApproving && <p className="text-blue-800 text-sm">Approving USDC spending...</p>}
                {isContributing && <p className="text-blue-800 text-sm">Confirm contribution in wallet...</p>}
                {isConfirming && <p className="text-blue-800 text-sm">Contribution pending...</p>}
                {isConfirmed && (
                  <div className="text-green-800 text-sm">
                    <p>✅ Contribution successful!</p>
                    {hash && (
                      <p className="mt-1">
                        <a 
                          href={`https://basescan.org/tx/${hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          View on BaseScan
                        </a>
                      </p>
                    )}
                  </div>
                )}
                {contributeError && (
                  <p className="text-red-800 text-sm">
                    ❌ {contributeError.message || 'Contribution failed'}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Amount (USDC)
                </label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  step="0.01"
                />
              </div>
              
              {projectMode === 'launchpad' && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">You will receive:</span>
                    <span className="font-medium text-purple-600">≈ 100 tokens</span>
                  </div>
                </div>
              )}

              {/* Show user's previous contribution if any */}
              {userContribution && userContribution.amount > BigInt(0) && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <p className="text-blue-800">
                    You&apos;ve already contributed {formatUnits(userContribution.amount, 6)} USDC to this campaign.
                  </p>
                </div>
              )}

              <button
                onClick={handleContribute}
                disabled={!contributionAmount || isApproving || isContributing || isConfirming}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-full font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isApproving ? 'Approving...' :
                 isContributing ? 'Confirm in Wallet...' :
                 isConfirming ? 'Contributing...' :
                 isConfirmed ? 'Contributed!' :
                 'Confirm'}
              </button>
            </div>
          </div>
        )}

        {/* Creator Actions */}
        {isCreator && campaign.state === CampaignState.Succeeded && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-6">
            <h3 className="font-semibold text-green-800 mb-3">Campaign Succeeded! 🎉</h3>
            <p className="text-green-700 text-sm mb-4">
              Congratulations! Your campaign has reached its funding goal. You can now withdraw the funds.
            </p>
            
            {/* Withdraw Transaction Status */}
            {(isWithdrawing || isWithdrawn || withdrawError) && (
              <div className={`mb-4 p-4 rounded-lg ${
                isWithdrawn ? 'bg-green-100 border border-green-300' : 
                withdrawError ? 'bg-red-100 border border-red-300' : 
                'bg-blue-100 border border-blue-300'
              }`}>
                {isWithdrawing && <p className="text-blue-800 text-sm">Withdrawing funds...</p>}
                {isWithdrawn && (
                  <div className="text-green-800 text-sm">
                    <p>✅ Funds withdrawn successfully!</p>
                    {withdrawHash && (
                      <p className="mt-1">
                        <a 
                          href={`https://basescan.org/tx/${withdrawHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          View on BaseScan
                        </a>
                      </p>
                    )}
                  </div>
                )}
                {withdrawError && (
                  <p className="text-red-800 text-sm">
                    ❌ {withdrawError.message || 'Withdraw failed'}
                  </p>
                )}
              </div>
            )}

            <button 
              onClick={() => withdrawFunds()}
              disabled={isWithdrawing || isWithdrawn}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isWithdrawing ? 'Withdrawing...' : isWithdrawn ? 'Funds Withdrawn' : 'Withdraw Funds'}
            </button>
          </div>
        )}

        {/* Token Claiming Section for Contributors */}
        {!isCreator && userContribution && userContribution.amount > BigInt(0) && 
         campaign.state === CampaignState.Succeeded && 
         projectMode === 'launchpad' && !userContribution.claimed && (
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-6 mb-6">
            <h3 className="font-semibold text-purple-800 mb-3">Claim Your Tokens! 🎯</h3>
            <p className="text-purple-700 text-sm mb-4">
              The campaign succeeded! You can now claim your tokens for your contribution of {formatUnits(userContribution.amount, 6)} USDC.
            </p>
            
            {/* Claim Transaction Status */}
            {(isClaiming || isClaimed || claimError) && (
              <div className={`mb-4 p-4 rounded-lg ${
                isClaimed ? 'bg-green-100 border border-green-300' : 
                claimError ? 'bg-red-100 border border-red-300' : 
                'bg-blue-100 border border-blue-300'
              }`}>
                {isClaiming && <p className="text-blue-800 text-sm">Claiming tokens...</p>}
                {isClaimed && (
                  <div className="text-green-800 text-sm">
                    <p>✅ Tokens claimed successfully!</p>
                    {claimHash && (
                      <p className="mt-1">
                        <a 
                          href={`https://basescan.org/tx/${claimHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          View on BaseScan
                        </a>
                      </p>
                    )}
                  </div>
                )}
                {claimError && (
                  <p className="text-red-800 text-sm">
                    ❌ {claimError.message || 'Claim failed'}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">You will receive:</span>
                <span className="font-medium text-purple-600">
                  ≈ {formatUnits(userContribution.tokenAllocation, 18)} tokens
                </span>
              </div>
            </div>

            <button 
              onClick={() => claimTokens()}
              disabled={isClaiming || isClaimed}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-full font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isClaiming ? 'Claiming...' : isClaimed ? 'Tokens Claimed' : 'Claim Tokens'}
            </button>
          </div>
        )}

        {/* Refund Section for Failed Campaigns */}
        {!isCreator && userContribution && userContribution.amount > BigInt(0) && 
         campaign.state === CampaignState.Failed && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 mb-6">
            <h3 className="font-semibold text-red-800 mb-3">Campaign Failed - Get Refund</h3>
            <p className="text-red-700 text-sm mb-4">
              Unfortunately, this campaign didn&apos;t reach its funding goal. You can get a refund of your {formatUnits(userContribution.amount, 6)} USDC contribution.
            </p>
            
            {/* Refund Transaction Status */}
            {(isRefunding || isRefunded || refundError) && (
              <div className={`mb-4 p-4 rounded-lg ${
                isRefunded ? 'bg-green-100 border border-green-300' : 
                refundError ? 'bg-red-100 border border-red-300' : 
                'bg-blue-100 border border-blue-300'
              }`}>
                {isRefunding && <p className="text-blue-800 text-sm">Processing refund...</p>}
                {isRefunded && (
                  <div className="text-green-800 text-sm">
                    <p>✅ Refund processed successfully!</p>
                    {refundHash && (
                      <p className="mt-1">
                        <a 
                          href={`https://basescan.org/tx/${refundHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          View on BaseScan
                        </a>
                      </p>
                    )}
                  </div>
                )}
                {refundError && (
                  <p className="text-red-800 text-sm">
                    ❌ {refundError.message || 'Refund failed'}
                  </p>
                )}
              </div>
            )}

            <button 
              onClick={() => refund()}
              disabled={isRefunding || isRefunded}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-full font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRefunding ? 'Processing Refund...' : isRefunded ? 'Refund Processed' : 'Get Refund'}
            </button>
          </div>
        )}

        {/* Connection Prompt */}
        {!isConnected && (
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 text-center">
            <p className="text-yellow-800 text-sm mb-3">
              Connect your wallet to contribute to this campaign
            </p>
            <Wallet>
              <ConnectWallet className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium">
                Connect Wallet
              </ConnectWallet>
            </Wallet>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <button onClick={onBack} className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
            <span className="text-xs text-gray-600">home</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-400">account</span>
          </button>
        </div>
      </div>
    </div>
  );
}