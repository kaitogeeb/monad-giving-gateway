import { usePrivy } from '@privy-io/react-auth';
import { ConnectWallet } from '@/components/ConnectWallet';
import { CheckAllocation } from '@/components/CheckAllocation';
import { DonateButton } from '@/components/DonateButton';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Sparkles, Shield, Zap, Clock, Users, Gift } from 'lucide-react';
import monadLogo from '@/assets/monad-logo.png';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const { authenticated } = usePrivy();
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={monadLogo} 
                alt="MONAD Logo" 
                className="h-12 w-12 animate-pulse-glow rounded-full"
              />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <span className="text-2xl font-bold gradient-text font-display tracking-tight">
              MONAD
            </span>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Airdrop Title Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Official Airdrop Event</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-4">
            <span className="gradient-text">MONAD</span>
            <span className="text-foreground"> Airdrop</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Claim your share of <span className="text-primary font-semibold">33,947 MON</span> tokens. 
            Connect your wallet and verify your eligibility.
          </p>
        </div>

        {/* Hero Image with Glow */}
        <div className="flex justify-center mb-12" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-accent/50 to-monad-blue/50 blur-3xl opacity-60 animate-pulse-glow" />
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden animate-float gradient-border p-1">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img 
                  src={heroImage} 
                  alt="Hero" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center animate-scale-pulse">
              <Sparkles className="h-4 w-4 text-success-foreground" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
          {[
            { icon: Users, label: 'Participants', value: '24.8K' },
            { icon: Gift, label: 'Total Rewards', value: '500M MON' },
            { icon: Clock, label: 'Time Left', value: '12:34:56' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="glass rounded-2xl p-4 text-center hover:border-primary/40 transition-all duration-300"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-lg md:text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Airdrop Card */}
        <div 
          className="max-w-md mx-auto animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="gradient-border rounded-3xl overflow-hidden">
            <div className="glass-strong rounded-3xl p-6 md:p-8 space-y-6">
              {/* Card Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-primary mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Secure Claim</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-display">
                  Claim Your Tokens
                </h2>
              </div>

              {/* Allocation Amount Preview */}
              {authenticated && (
                <div className="bg-secondary/50 rounded-2xl p-4 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Your Allocation</span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-3xl font-bold gradient-text font-display">
                    +33,947 MON
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ≈ $54,000 USD
                  </p>
                </div>
              )}

              {/* Check Allocation Button */}
              {authenticated && <CheckAllocation />}
              
              {/* Claim / Connect Button */}
              {authenticated ? (
                <DonateButton />
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground text-sm">
                    Connect your wallet to check eligibility
                  </p>
                  <ConnectWallet />
                </div>
              )}

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-success" />
                  <span>Audited</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span>Instant</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>Official</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {[
            {
              icon: Shield,
              title: 'Secure Process',
              description: 'Smart contract audited by leading security firms',
            },
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Built on Monad for instant transactions',
            },
            {
              icon: Users,
              title: 'Community First',
              description: 'Rewards for early adopters and active users',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 text-center hover:border-primary/40 transition-all duration-300 group"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold font-display mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-20 py-8 glass">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={monadLogo} alt="MONAD" className="h-6 w-6" />
              <span className="text-sm text-muted-foreground">
                © 2024 MONAD. Built on Monad Network.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;