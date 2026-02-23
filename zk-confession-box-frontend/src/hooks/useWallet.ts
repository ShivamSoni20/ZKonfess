import { useCallback } from 'react';
import { useWalletStore } from '../store/walletSlice';
import { freighterService } from '../services/freighterService';
import { NETWORK, NETWORK_PASSPHRASE } from '../utils/constants';
import type { ContractSigner } from '../types/signer';

export function useWallet() {
  const {
    publicKey,
    isConnected,
    isConnecting,
    network,
    networkPassphrase,
    walletType,
    error,
    setWallet,
    setConnecting,
    setNetwork,
    setError,
    disconnect: storeDisconnect,
  } = useWalletStore();

  /**
   * Connect to Freighter wallet
   */
  const connect = useCallback(async () => {
    try {
      setConnecting(true);
      setError(null);

      // 1. Check if Freighter is installed
      const isInstalled = await freighterService.isAvailable();
      if (!isInstalled) {
        throw new Error('FREIGHTER_NOT_INSTALLED');
      }

      // 2. Request permission (v6 requires this)
      const allowed = await freighterService.setAllowed();
      if (!allowed) {
        throw new Error('Access to Freighter was denied.');
      }

      // 3. Get current network and validate
      const freighterNetwork = await freighterService.getNetwork();
      if (freighterNetwork.toUpperCase() !== 'TESTNET') {
        throw new Error('WRONG_NETWORK');
      }

      // 4. Get connected wallet address
      const address = await freighterService.getPublicKey();
      if (!address) {
        throw new Error('Please log in to your Freighter wallet.');
      }

      setWallet(address, address, 'freighter');
      setNetwork('testnet', NETWORK_PASSPHRASE);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [setWallet, setConnecting, setNetwork, setError]);


  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    storeDisconnect();
  }, [storeDisconnect]);

  /**
   * Get a signer for contract interactions
   */
  const getContractSigner = useCallback((): ContractSigner => {
    if (!isConnected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    // Always return freighter signer if connected
    return freighterService.getSigner();
  }, [isConnected, publicKey]);

  return {
    // State
    publicKey,
    isConnected,
    isConnecting,
    network,
    networkPassphrase,
    walletType,
    error,

    // Actions
    connect,
    disconnect,
    getContractSigner,

    // Dev methods for WalletSwitcher compatibility
    connectDev: async (player: number) => { console.log('Dev connect to player', player); },
    switchPlayer: async (player: number) => { console.log('Dev switch to player', player); },
    getCurrentDevPlayer: () => 1,
  };
}

