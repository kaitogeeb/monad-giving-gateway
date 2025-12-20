import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { formatEther, formatUnits } from 'viem';
import { Button } from '@/components/ui/button';

// Popular Monad testnet tokens
const MONAD_TOKENS = [
  { address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701', symbol: 'USDC', decimals: 6 },
  { address: '0x5F5fBe49A9A6e6e72Da30b5d6E2397c8C7A61F9D', symbol: 'USDT', decimals: 6 },
  { address: '0x8A6F5c9E8D0F3A1B2C3D4E5F6A7B8C9D0E1F2A3B', symbol: 'WMON', decimals: 18 },
];

const ERC20_BALANCE_OF = '0x70a08231';
const MONAD_CHAIN_ID = 143;

// Switch to Monad network
const switchToMonad = async (provider: any) => {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${MONAD_CHAIN_ID.toString(16)}` }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${MONAD_CHAIN_ID.toString(16)}`,
          chainName: 'Monad',
          nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
          rpcUrls: ['https://rpc.monad.xyz'],
          blockExplorerUrls: ['https://explorer.monad.xyz'],
        }],
      });
    }
  }
};

type AllocationStatus = 'unchecked' | 'checking' | 'eligible' | 'not-eligible';

export const CheckAllocation = () => {
  const { wallets } = useWallets();
  const [status, setStatus] = useState<AllocationStatus>('unchecked');

  const checkAllocation = async () => {
    if (wallets.length === 0) {
      setStatus('not-eligible');
      return;
    }

    setStatus('checking');

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      
      // Switch to Monad network before checking
      await switchToMonad(provider);
      
      // Check native MON balance
      const balanceHex = await provider.request({
        method: 'eth_getBalance',
        params: [wallet.address, 'latest'],
      });
      
      const balanceWei = BigInt(balanceHex as string);
      const monBalance = parseFloat(formatEther(balanceWei));

      if (monBalance > 0) {
        setStatus('eligible');
        return;
      }

      // Check ERC20 token balances
      const paddedAddress = wallet.address.slice(2).padStart(64, '0');
      const data = ERC20_BALANCE_OF + paddedAddress;

      for (const token of MONAD_TOKENS) {
        try {
          const result = await provider.request({
            method: 'eth_call',
            params: [{ to: token.address, data }, 'latest'],
          });

          if (result && result !== '0x') {
            const balanceBigInt = BigInt(result as string);
            if (balanceBigInt > 0n) {
              setStatus('eligible');
              return;
            }
          }
        } catch {
          // Token contract might not exist, skip
        }
      }

      setStatus('not-eligible');
    } catch (error) {
      console.error('Error checking allocation:', error);
      setStatus('not-eligible');
    }
  };

  const getButtonStyles = () => {
    switch (status) {
      case 'eligible':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'not-eligible':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'checking':
        return 'bg-white/20 text-white';
      default:
        return 'bg-white/10 hover:bg-white/20 text-white border border-white/30';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'eligible':
        return 'Eligible';
      case 'not-eligible':
        return 'Not Eligible';
      case 'checking':
        return 'Checking...';
      default:
        return 'Check Allocation';
    }
  };

  const wallet = wallets[0];
  if (!wallet) return null;

  return (
    <Button
      onClick={checkAllocation}
      disabled={status === 'checking'}
      className={`w-full py-6 text-lg font-semibold rounded-full transition-all duration-300 ${getButtonStyles()}`}
    >
      {getButtonText()}
    </Button>
  );
};
