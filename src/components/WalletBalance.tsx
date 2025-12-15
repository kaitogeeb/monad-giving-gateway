import { useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { formatEther, formatUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Popular Monad testnet tokens - add more as needed
const MONAD_TOKENS = [
  { address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701', symbol: 'USDC', decimals: 6 },
  { address: '0x5F5fBe49A9A6e6e72Da30b5d6E2397c8C7A61F9D', symbol: 'USDT', decimals: 6 },
  { address: '0x8A6F5c9E8D0F3A1B2C3D4E5F6A7B8C9D0E1F2A3B', symbol: 'WMON', decimals: 18 },
];

// ERC20 balanceOf ABI
const ERC20_BALANCE_OF = '0x70a08231';

interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
}

export const WalletBalance = () => {
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (wallets.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const wallet = wallets[0];
        const provider = await wallet.getEthereumProvider();
        
        // Fetch native MON balance
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [wallet.address, 'latest'],
        });
        
        const balanceWei = BigInt(balanceHex as string);
        setBalance(formatEther(balanceWei));

        // Fetch ERC20 token balances
        const paddedAddress = wallet.address.slice(2).padStart(64, '0');
        const data = ERC20_BALANCE_OF + paddedAddress;

        const tokenResults: TokenBalance[] = [];

        for (const token of MONAD_TOKENS) {
          try {
            const result = await provider.request({
              method: 'eth_call',
              params: [
                {
                  to: token.address,
                  data: data,
                },
                'latest',
              ],
            });

            if (result && result !== '0x') {
              const balanceBigInt = BigInt(result as string);
              if (balanceBigInt > 0n) {
                tokenResults.push({
                  symbol: token.symbol,
                  balance: formatUnits(balanceBigInt, token.decimals),
                  address: token.address,
                });
              }
            }
          } catch (err) {
            // Token contract might not exist, skip it
            console.log(`Could not fetch ${token.symbol} balance`);
          }
        }

        setTokenBalances(tokenResults);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [wallets]);

  const wallet = wallets[0];

  if (!wallet) return null;

  return (
    <Card className="bg-transparent backdrop-blur-sm border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Address</span>
          <span className="text-white font-mono text-sm">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">MON Balance</span>
          {loading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <span className="text-white font-semibold">
              {parseFloat(balance || '0').toFixed(4)} MON
            </span>
          )}
        </div>
        
        {/* Token Balances */}
        {tokenBalances.length > 0 && (
          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            <span className="text-white/70 text-xs uppercase tracking-wide">Tokens</span>
            {tokenBalances.map((token) => (
              <div key={token.address} className="flex items-center justify-between">
                <span className="text-white/70 text-sm">{token.symbol}</span>
                <span className="text-white font-semibold">
                  {parseFloat(token.balance).toFixed(4)} {token.symbol}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {!loading && tokenBalances.length === 0 && (
          <div className="border-t border-white/10 pt-3 mt-3">
            <span className="text-white/50 text-xs">No additional tokens found</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
