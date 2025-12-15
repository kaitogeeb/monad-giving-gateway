import { usePrivy } from '@privy-io/react-auth';
import { ConnectWallet } from '@/components/ConnectWallet';
import { WalletBalance } from '@/components/WalletBalance';
import { DonateButton } from '@/components/DonateButton';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Heart, Globe, Users } from 'lucide-react';

const Index = () => {
  const { authenticated } = usePrivy();

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">CharityDonate</span>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Make a <span className="text-primary">Difference</span> Today
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community of donors using Monad blockchain to grow and contribute 
            to meaningful causes. Every donation counts.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center">
            <Users className="h-10 w-10 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground">1,234</div>
            <div className="text-muted-foreground">Active Donors</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center">
            <Heart className="h-10 w-10 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground">50,000</div>
            <div className="text-muted-foreground">MON Donated</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center">
            <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground">25</div>
            <div className="text-muted-foreground">Projects Funded</div>
          </div>
        </div>

        {/* Donation Card */}
        <div className="max-w-md mx-auto space-y-6">
          {authenticated && <WalletBalance />}
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              {authenticated ? 'Ready to Donate?' : 'Connect to Start'}
            </h2>
            <p className="text-muted-foreground text-center mb-6">
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
      <footer className="border-t border-border/50 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 CharityDonate. Built on Monad.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
