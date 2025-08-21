'use client';

import { CampaignData, CampaignState } from '../types/campaign';
import { formatUnits } from 'viem';

interface CampaignCardProps {
  campaign: CampaignData;
  campaignId: bigint;
  onClick?: () => void;
}

export default function CampaignCard({ campaign, campaignId, onClick }: CampaignCardProps) {
  const fundingGoalFormatted = parseFloat(formatUnits(campaign.fundingGoal, 6));
  const totalRaisedFormatted = parseFloat(formatUnits(campaign.totalRaised, 6));
  const progressPercentage = Math.min((totalRaisedFormatted / fundingGoalFormatted) * 100, 100);
  
  const deadline = new Date(Number(campaign.deadline) * 1000);
  const now = new Date();
  const isExpired = deadline <= now;
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const getStateColor = (state: CampaignState) => {
    switch (state) {
      case CampaignState.Active:
        return isExpired ? 'text-red-600' : 'text-blue-600';
      case CampaignState.Succeeded:
        return 'text-green-600';
      case CampaignState.Failed:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getStateLabel = (state: CampaignState) => {
    switch (state) {
      case CampaignState.Active:
        return isExpired ? 'Expired' : 'Active';
      case CampaignState.Succeeded:
        return 'Succeeded';
      case CampaignState.Failed:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

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

  const projectMode = getProjectModeFromMetadata(campaign.metadataURI);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Campaign Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Project Icon Placeholder */}
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4l-2-4M5 7l2-4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-32">{campaign.name}</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${
                projectMode === 'launchpad' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {projectMode === 'launchpad' ? 'Launchpad' : 'Classic'}
              </span>
              <span className={`font-medium ${getStateColor(campaign.state)}`}>
                {getStateLabel(campaign.state)}
              </span>
            </div>
          </div>
        </div>
        <button className="p-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Campaign Description */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {(() => {
            try {
              if (campaign.metadataURI.startsWith('data:application/json,')) {
                const jsonString = decodeURIComponent(campaign.metadataURI.substring(22));
                const metadata = JSON.parse(jsonString);
                return metadata.description || 'No description available';
              }
            } catch (error) {
              console.error('Error parsing metadata:', error);
            }
            return 'Description not available';
          })()}
        </p>
        <div className="text-xs text-gray-400 mt-1">
          owned by owner • created {new Date(Number(campaign.createdAt) * 1000).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-400">
          deadline {deadline.toLocaleDateString()}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{daysLeft} days{daysLeft !== 1 ? '' : ''}{daysLeft === 0 ? 'hours' : ''}left</span>
          <span>{progressPercentage.toFixed(0)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              campaign.state === CampaignState.Succeeded ? 'bg-green-500' :
              campaign.state === CampaignState.Failed ? 'bg-red-500' :
              'bg-purple-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Funding Info */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold text-gray-900">
              {totalRaisedFormatted.toLocaleString()} USDC
            </span>
            <span className="text-gray-500"> / {fundingGoalFormatted.toLocaleString()} USDC</span>
          </div>
          <span className="text-purple-600 font-medium">{progressPercentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}