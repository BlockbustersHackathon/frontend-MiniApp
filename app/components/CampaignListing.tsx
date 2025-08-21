'use client';

import React, { useState } from 'react';
import { useCampaignCount, useCampaign } from '../hooks/useCrowdfundingFactory';
import CampaignCard from './CampaignCard';
import { CampaignData, CampaignState } from '../types/campaign';

interface CampaignListingProps {
  onCampaignSelect?: (campaignId: bigint, campaign: CampaignData) => void;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  onAccountClick?: () => void;
}

export default function CampaignListing({ 
  onCampaignSelect, 
  showCreateButton = true,
  onCreateClick,
  onAccountClick 
}: CampaignListingProps) {
  const { data: campaignCount, isLoading: isLoadingCount } = useCampaignCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'succeeded' | 'failed'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'launchpad' | 'classic'>('all');

  // Generate array of campaign IDs to fetch
  const campaignIds = campaignCount ? Array.from({ length: Number(campaignCount) }, (_, i) => BigInt(i)) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
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

        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-2">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value as 'all' | 'active' | 'succeeded' | 'failed')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All States</option>
            <option value="active">Active</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as 'all' | 'launchpad' | 'classic')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Modes</option>
            <option value="launchpad">Launchpad</option>
            <option value="classic">Classic</option>
          </select>
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
            <FilteredCampaignItem
              key={campaignId.toString()}
              campaignId={campaignId}
              onSelect={onCampaignSelect}
              searchQuery={searchQuery}
              filterState={filterState}
              filterMode={filterMode}
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
          <button onClick={onAccountClick} className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-400">account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Filtered campaign item component
function FilteredCampaignItem({ 
  campaignId, 
  onSelect,
  searchQuery,
  filterState,
  filterMode
}: { 
  campaignId: bigint; 
  onSelect?: (campaignId: bigint, campaign: CampaignData) => void;
  searchQuery: string;
  filterState: string;
  filterMode: string;
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
    return null; // Hide errors when filtering
  }

  // Apply filters
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
        return metadata.description || '';
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }
    return '';
  };

  const projectMode = getProjectModeFromMetadata(campaign.metadataURI);
  const description = getDescriptionFromMetadata(campaign.metadataURI);

  // Filter by search query
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    if (!campaign.name.toLowerCase().includes(searchLower) && 
        !description.toLowerCase().includes(searchLower)) {
      return null;
    }
  }

  // Filter by state
  if (filterState !== 'all') {
    const stateMap = {
      'active': CampaignState.Active,
      'succeeded': CampaignState.Succeeded,
      'failed': CampaignState.Failed,
    };
    if (campaign.state !== stateMap[filterState as keyof typeof stateMap]) {
      return null;
    }
  }

  // Filter by mode
  if (filterMode !== 'all' && projectMode !== filterMode) {
    return null;
  }

  return (
    <CampaignCard
      campaign={campaign}
      campaignId={campaignId}
      onClick={() => onSelect?.(campaignId, campaign)}
    />
  );
}