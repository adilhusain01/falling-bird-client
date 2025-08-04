import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Game from './components/Game';
import Login from './components/Login';
import Profile from './components/Profile';
import './index.css';

const queryClient = new QueryClient();

function App() {
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
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
        appId="cmdx3unrh01cuk10bwfqveom6" // Replace with your Privy App ID from the Privy Dashboard
        config={{
          appearance: {
            accentColor: '#6A6FF5',
            theme: '#FFFFFF',
            showWalletLoginFirst: false,
            logo: 'https://auth.privy.io/logos/privy-logo.png',
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
            'github'
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