import {
    isConnected,
    getAddress,
    signTransaction,
    setAllowed,
    getNetwork
} from '@stellar/freighter-api';
import type { ContractSigner } from '../types/signer';

export class FreighterService {
    /**
     * Check if Freighter is installed
     */
    async isAvailable(): Promise<boolean> {
        try {
            const result = await isConnected();
            return !!result;
        } catch (e) {
            console.warn('[Freighter] isAvailable check failed:', e);
            return false;
        }
    }

    /**
     * Request permission from the user
     */
    async setAllowed(): Promise<boolean> {
        try {
            const result = await setAllowed();
            return !!result;
        } catch (e) {
            console.error('[Freighter] setAllowed error:', e);
            return false;
        }
    }

    /**
     * Get current network
     */
    async getNetwork(): Promise<string> {
        try {
            const result = await getNetwork();
            if (typeof result === 'string') return result;
            if (result && (result as any).network) return (result as any).network;
            return 'UNKNOWN';
        } catch (e) {
            console.error('[Freighter] getNetwork error:', e);
            return 'UNKNOWN';
        }
    }

    /**
     * Get the connected wallet address
     */
    async getPublicKey(): Promise<string | null> {
        try {
            // In v6, renamed to getAddress() which returns { address: string }
            const { address } = await getAddress();
            return address || null;
        } catch (e) {
            console.error('[Freighter] getPublicKey (getAddress) error:', e);
            return null;
        }
    }

    /**
     * Get a signer for contract interactions
     */
    getSigner(): ContractSigner {
        const self = this;
        return {
            signTransaction: async (xdr: string, opts?: { networkPassphrase?: string }) => {
                try {
                    const result = await signTransaction(xdr, {
                        networkPassphrase: opts?.networkPassphrase,
                    });

                    const signedTxXdr = (typeof result === 'string') ? result : (result as any).signedTxXdr;

                    if (!signedTxXdr) {
                        throw new Error('Failed to get signed transaction XDR from Freighter');
                    }

                    const signerAddress = await self.getPublicKey();
                    if (!signerAddress) throw new Error('Could not verify signer address');

                    return {
                        signedTxXdr,
                        signerAddress,
                    };
                } catch (error) {
                    console.error('[Freighter] signTransaction error:', error);
                    const message = error instanceof Error ? error.message : 'Failed to sign transaction';
                    return {
                        signedTxXdr: xdr,
                        error: {
                            message: message.includes('declined') ? 'Transaction signature declined by user.' : message,
                            code: -1,
                        },
                    } as any;
                }
            },

            signAuthEntry: async (authEntry: string, _opts?: any) => {
                return {
                    signedAuthEntry: authEntry,
                    error: {
                        message: 'signAuthEntry not directly supported by Freighter. Use signTransaction for the main call.',
                        code: -1
                    }
                } as any;
            },
        };
    }
}

export const freighterService = new FreighterService();
