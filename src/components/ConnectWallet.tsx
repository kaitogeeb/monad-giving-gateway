import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export const ConnectWallet = () => {
  const { login, logout, authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <Button disabled variant="outline" className="border-primary/50">
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <Button
        onClick={logout}
        variant="outline"
        className="border-primary/50 hover:bg-primary/10"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      onClick={login}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
};
