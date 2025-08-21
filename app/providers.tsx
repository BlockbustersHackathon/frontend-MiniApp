'use client';

import { base } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import type { ReactNode } from 'react';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{ 
            appearance: { 
              mode: 'auto',
            }
          }}
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

