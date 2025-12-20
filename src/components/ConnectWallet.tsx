import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export const ConnectWallet = () => {
  const { login, logout, authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <Button 
        disabled 
        className="glass border border-primary/30 text-foreground"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <Button
        onClick={logout}
        variant="outline"
        className="glass border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      onClick={login}
      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold btn-glow transition-all duration-300"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
};