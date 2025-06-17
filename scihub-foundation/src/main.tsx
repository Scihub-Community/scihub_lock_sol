import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import * as buffer from "buffer";

window.Buffer = buffer.Buffer;

const network = WalletAdapterNetwork.Devnet;
const endpoint = 'https://api.devnet.solana.com';
const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

// Solana 钱包提供者
// const SolanaWalletProvider = ({ children }) => {
//   const network = WalletAdapterNetwork.Mainnet;
//   const endpoint = useMemo(
//     () => "https://white-bitter-rain.solana-mainnet.quiknode.pro/4d5cb8fdd5d59fb6555e3d89ebf1ca05b3dbaea4",
//     [network]
//   );
//   const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [network]);

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect>
//         <WalletModalProvider>{children}</WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// };

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);