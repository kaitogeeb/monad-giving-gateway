import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ConnectWallet } from '@/components/ConnectWallet';
import { CheckAllocation } from '@/components/CheckAllocation';
import { DonateButton } from '@/components/DonateButton';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import monadLogo from '@/assets/monad-logo.png';
import heroImage from '@/assets/hero-image.jpg';

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

const Index = () => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [hasMon, setHasMon] = useState(false);

  // Check MON balance when wallet connects
  useEffect(() => {
    const checkMonBalance = async () => {
      if (wallets.length === 0) {
        setHasMon(false);
        return;
      }

      try {
        const wallet = wallets[0];
        const provider = await wallet.getEthereumProvider();
        
        // Switch to Monad network
        await switchToMonad(provider);

        // Check native MON balance
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [wallet.address, 'latest'],
        });

        const balance = BigInt(balanceHex as string);
        setHasMon(balance > 0n);
      } catch (error) {
        console.error('Error checking MON balance:', error);
        setHasMon(false);
      }
    };

    checkMonBalance();
  }, [wallets]);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={monadLogo} alt="MONAD Logo" className="h-14 w-14" />
            <span className="text-xl font-bold text-white">MONAD</span>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="w-40 h-40 md:w-52 md:h-52 mx-auto rounded-full overflow-hidden border-4 border-primary shadow-lg shadow-primary/30">
            <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Donation Card */}
        <div className="max-w-md mx-auto space-y-6">
          {authenticated && <CheckAllocation />}
          
          <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-xl p-6">
            {authenticated ? (
              hasMon ? <DonateButton /> : null
            ) : (
              <div className="text-center">
                <ConnectWallet />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 bg-transparent">
        <div className="container mx-auto px-4 text-center text-white/70">
          <p>
            <a 
              href="https://www.dexlabs.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Built by Dex Labs
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;