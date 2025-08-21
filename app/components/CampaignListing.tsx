'use client';

import { useState, useEffect } from 'react';
import { useCampaignCount, useCampaign } from '../hooks/useCrowdfundingFactory';
import CampaignCard from './CampaignCard';
import { CampaignData } from '../types/campaign';

interface CampaignListingProps {
  onCampaignSelect?: (campaignId: bigint, campaign: CampaignData) => void;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export default function CampaignListing({ 
  onCampaignSelect, 
  showCreateButton = true,
  onCreateClick 
}: CampaignListingProps) {
  const { data: campaignCount, isLoading: isLoadingCount } = useCampaignCount();
  const [campaigns, setCampaigns] = useState<Array<{ id: bigint; data: CampaignData }>>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Generate array of campaign IDs to fetch
  const campaignIds = campaignCount ? Array.from({ length: Number(campaignCount) }, (_, i) => BigInt(i)) : [];

  useEffect(() => {
    if (campaignCount && Number(campaignCount) > 0) {
      setLoadingCampaigns(true);
      // Note: In a production app, you'd want to implement pagination
      // For now, we'll load all campaigns (limited by the number)
    }
  }, [campaignCount]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">DAPP</h1>
          {showCreateButton && (
            <button
              onClick={onCreateClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      </div>

      {/* Campaign Brief Section */}
      <div className="bg-white mx-4 mt-4 rounded-xl p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Project</h2>
        <p className="text-sm text-gray-600 mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
        </p>
        {showCreateButton && (
          <button
            onClick={onCreateClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Create Project
          </button>
        )}
      </div>

      {/* Projects Info Section */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Projects Info</h3>
          <button className="p-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {isLoadingCount && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading campaigns...</p>
          </div>
        )}

        {/* No Campaigns State */}
        {!isLoadingCount && campaignCount === BigInt(0) && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4l-2-4M5 7l2-4" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No campaigns available yet</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to create a campaign!</p>
          </div>
        )}

        {/* Campaign List */}
        <div className="space-y-4 pb-20">
          {campaignIds.map((campaignId) => (
            <CampaignItem
              key={campaignId.toString()}
              campaignId={campaignId}
              onSelect={onCampaignSelect}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center space-y-1">
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

// Individual campaign item component
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
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