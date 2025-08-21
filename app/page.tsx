'use client';

import CreateCampaign from './components/CreateCampaign';

export default function App() {
  const handleCampaignSubmit = (campaignData: any) => {
    console.log('Campaign data received:', campaignData);
  };

  return <CreateCampaign onSubmit={handleCampaignSubmit} />;
}
