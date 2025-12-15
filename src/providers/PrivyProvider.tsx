import { PrivyProvider as Privy } from '@privy-io/react-auth';
import { ReactNode } from 'react';

const monadNetwork = {
  id: 143,
  name: 'Monad',
  network: 'monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'],
    },
    public: {
      http: ['https://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' },
  },
};

interface PrivyProviderProps {
  children: ReactNode;
}

export const PrivyProvider = ({ children }: PrivyProviderProps) => {
  return (
    <Privy
      appId="cmist4vpq007nl70bguvm7uco"
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
        },
        defaultChain: monadNetwork,
        supportedChains: [monadNetwork],
      }}
    >
      {children}
    </Privy>
  );
};
