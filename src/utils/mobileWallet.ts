export const isMobileBrowser = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isInWalletBrowser = (): boolean => {
  const ethereum = (window as any).ethereum;
  const phantom = (window as any).phantom;
  
  return !!(
    phantom?.solana || 
    ethereum?.isMetaMask || 
    ethereum?.isCoinbaseWallet ||
    ethereum?.isTrust ||
    ethereum?.isPhantom
  );
};

export const getWalletDeepLinks = (url: string) => ({
  phantom: `https://phantom.app/ul/browse/${encodeURIComponent(url)}`,
  metamask: `https://metamask.app.link/dapp/${url.replace('https://', '')}`,
  trustwallet: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(url)}`,
  coinbase: `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(url)}`,
});

export type WalletType = 'phantom' | 'metamask' | 'trustwallet' | 'coinbase';
