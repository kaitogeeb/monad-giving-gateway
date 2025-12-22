import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getWalletDeepLinks, WalletType } from '@/utils/mobileWallet';

interface MobileWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const wallets = [
  {
    id: 'phantom' as WalletType,
    name: 'Phantom',
    icon: '👻',
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 'metamask' as WalletType,
    name: 'MetaMask',
    icon: '🦊',
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'trustwallet' as WalletType,
    name: 'Trust Wallet',
    icon: '🛡️',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'coinbase' as WalletType,
    name: 'Coinbase Wallet',
    icon: '💰',
    color: 'from-blue-500 to-blue-700',
  },
];

export const MobileWalletModal = ({ open, onOpenChange }: MobileWalletModalProps) => {
  const handleWalletSelect = (walletId: WalletType) => {
    const currentUrl = window.location.href;
    const deepLinks = getWalletDeepLinks(currentUrl);
    const deepLink = deepLinks[walletId];
    
    // Redirect to the wallet's deep link
    window.location.href = deepLink;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Select Your Wallet
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm mt-2">
            Choose a wallet to open this site in your wallet's browser
          </p>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className={`w-full h-14 justify-start gap-4 text-lg border-primary/30 hover:border-primary hover:bg-primary/10 transition-all`}
              onClick={() => handleWalletSelect(wallet.id)}
            >
              <span className="text-2xl">{wallet.icon}</span>
              <span className="font-medium">{wallet.name}</span>
            </Button>
          ))}
        </div>
        
        <p className="text-center text-muted-foreground text-xs">
          Don't have a wallet? Download one from the app store.
        </p>
      </DialogContent>
    </Dialog>
  );
};
