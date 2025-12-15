import { usePrivy } from '@privy-io/react-auth';
import { ConnectWallet } from '@/components/ConnectWallet';
import { WalletBalance } from '@/components/WalletBalance';
import { DonateButton } from '@/components/DonateButton';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Heart, Globe, Users } from 'lucide-react';
import monadLogo from '@/assets/monad-logo.png';

const Index = () => {
  const { authenticated } = usePrivy();

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={monadLogo} alt="MONAD Logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-white">MONAD</span>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Make a <span className="text-primary">Difference</span> Today
          </h1>
        </div>

        {/* Donation Card */}
        <div className="max-w-md mx-auto space-y-6">
          {authenticated && <WalletBalance />}
          
          <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {authenticated ? 'Ready to Donate?' : 'Connect to Start'}
            </h2>
            <p className="text-white/80 text-center mb-6">
              {authenticated
                ? 'Click below to sign a message and begin your donation journey'
                : 'Connect your Monad wallet to view your balance and make a donation'}
            </p>
            {authenticated ? (
              <DonateButton />
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
          <p>© 2024 MONAD. Built on Monad.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
