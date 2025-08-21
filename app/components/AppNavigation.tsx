'use client';

import { useState } from 'react';
import { CampaignData, CampaignFormData } from '../types/campaign';
import CampaignListing from './CampaignListing';
import CreateCampaign from './CreateCampaign';
import CampaignDetails from './CampaignDetails';

type ViewType = 'home' | 'create' | 'details';

interface AppNavigationState {
  view: ViewType;
  selectedCampaign?: {
    id: bigint;
    data: CampaignData;
  };
}

export default function AppNavigation() {
  const [navigationState, setNavigationState] = useState<AppNavigationState>({
    view: 'home',
  });

  const handleCreateClick = () => {
    setNavigationState({ view: 'create' });
  };

  const handleCampaignSelect = (campaignId: bigint, campaign: CampaignData) => {
    setNavigationState({
      view: 'details',
      selectedCampaign: { id: campaignId, data: campaign },
    });
  };

  const handleBackToHome = () => {
    setNavigationState({ view: 'home' });
  };

  const handleCampaignCreated = (campaignData: CampaignFormData) => {
    // After successful campaign creation, go back to home
    console.log('Campaign created successfully:', campaignData);
    // Could show a success message here
    setTimeout(() => {
      setNavigationState({ view: 'home' });
    }, 2000); // Wait 2 seconds to show success message
  };

  // Render the appropriate view based on navigation state
  switch (navigationState.view) {
    case 'create':
      return <CreateCampaign onSubmit={handleCampaignCreated} />;
    
    case 'details':
      return (
        <CampaignDetails
          campaignId={navigationState.selectedCampaign!.id}
          campaign={navigationState.selectedCampaign!.data}
          onBack={handleBackToHome}
        />
      );
    
    case 'home':
    default:
      return (
        <CampaignListing
          onCampaignSelect={handleCampaignSelect}
          onCreateClick={handleCreateClick}
        />
      );
  }
}