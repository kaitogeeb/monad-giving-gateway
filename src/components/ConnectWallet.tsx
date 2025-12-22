import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { MobileWalletModal } from './MobileWalletModal';
import { isMobileBrowser, isInWalletBrowser } from '@/utils/mobileWallet';

export const ConnectWallet = () => {
  const { login, logout, authenticated, ready } = usePrivy();
  const [showMobileModal, setShowMobileModal] = useState(false);

  const handleConnect = () => {
    // If on mobile browser but NOT inside a wallet's dApp browser, show wallet selection
    if (isMobileBrowser() && !isInWalletBrowser()) {
      setShowMobileModal(true);
    } else {
      // Desktop or already in wallet browser - use normal Privy flow
      login();
    }
  };

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
    <>
      <Button
        onClick={handleConnect}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
      
      <MobileWalletModal 
        open={showMobileModal} 
        onOpenChange={setShowMobileModal} 
      />
    </>
  );
};
