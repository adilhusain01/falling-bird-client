import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import {somniaTestnet} from 'viem/chains';
import Game from './components/Game';
import Login from './components/Login';
import Profile from './components/Profile';
import './index.css';

const queryClient = new QueryClient();

function App() {
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="floating-spirit">🌟</div>
          <div className="loading-text">Awakening the forest spirits...</div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={authenticated ? <Game /> : <Login />} />
        <Route path="/profile" element={authenticated ? <Profile /> : <Login />} />
      </Routes>
    </Router>
  );
}

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId="cmdx3unrh01cuk10bwfqveom6"
        config={{
          defaultChain: somniaTestnet,
          supportedChains: [somniaTestnet],
          appearance: {
            accentColor: '#7dd3fc',
            theme: 'dark',
            showWalletLoginFirst: false,
            logo: '',
            walletChainType: 'ethereum-only',
            walletList: [
              'detected_ethereum_wallets',
              'metamask',
              'coinbase_wallet',
              'base_account',
              'rainbow',
              'wallet_connect'
            ]
          },
          loginMethods: [
            'email',
            'wallet',
            'google',
          ],
          fundingMethodConfig: {
            moonpay: {
              useSandbox: true
            }
          },
          embeddedWallets: {
            requireUserPasswordOnCreate: false,
            showWalletUIs: true,
            ethereum: {
              createOnLogin: 'users-without-wallets'
            },
            solana: {
              createOnLogin: 'off'
            }
          },
          mfa: {
            noPromptOnMfaRequired: false
          }
        }}
      >
        <App />
      </PrivyProvider>
    </QueryClientProvider>
  );
}

export default AppWrapper;