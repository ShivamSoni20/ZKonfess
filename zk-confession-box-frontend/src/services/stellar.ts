import {
    Client,
    networks,
    type Confession as ContractConfession,
    type Bet as ContractBet,
} from '../../../bindings/zk_confession_box/src/index';

const RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE || networks.testnet.networkPassphrase;
const CONTRACT_ID = import.meta.env.VITE_ZK_CONFESSION_BOX_CONTRACT_ID || networks.testnet.contractId;

export interface Confession {
    id: string;
    contentHash: string;
    commitment: string;
    nullifier: string;
    votesRelatable: number;
    votesShocking: number;
    votesFake: number;
    timestamp: number;
    revealed: boolean;
    author?: string;
}

export interface Bet {
    bettor: string;
    confessionId: string;
    betReal: boolean;
    amount: number;
    settled: boolean;
}

export enum VoteType {
    Relatable = 0,
    Shocking = 1,
    Fake = 2,
}

import { ContractSigner } from '../types/signer';

/**
 * Interface for a connected wallet with its signer
 */
export interface Wallet {
    publicKey: string;
    signer: ContractSigner;
}

function getClient(publicKey?: string, signer?: any): Client {
    return new Client({
        contractId: CONTRACT_ID,
        networkPassphrase: NETWORK_PASSPHRASE,
        rpcUrl: RPC_URL,
        publicKey,
        ...(signer ? {
            signTransaction: signer.signTransaction.bind(signer),
            signAuthEntry: signer.signAuthEntry.bind(signer)
        } : {})
    } as any);
}

/**
 * Safely converts a hex string (with or without 0x) or Uint8Array to a Buffer.
 * Ensures we don't send ASCII bytes of a hex string to the contract.
 */
function toBuffer(data: string | Uint8Array): Buffer {
    if (data instanceof Uint8Array) return Buffer.from(data);
    let hex = data;
    if (hex.startsWith('0x')) hex = hex.slice(2);
    if (hex.length % 2 !== 0) hex = '0' + hex;
    return Buffer.from(hex, 'hex');
}

export interface Comment {
    author: string;
    text: string;
    timestamp: number;
}

class StellarService {
    async registerPlayer(wallet: Wallet, identityCommitment: string | Uint8Array) {
        const client = getClient(wallet.publicKey, wallet.signer);
        const tx = await client.register_player({
            player: wallet.publicKey,
            identity_commitment: toBuffer(identityCommitment),
        });
        const result = await tx.signAndSend();
        return result;
    }

    async submitConfession(
        wallet: Wallet,
        contentHash: string | Uint8Array,
        nullifier: string | Uint8Array,
        commitment: string | Uint8Array,
        proof: Uint8Array
    ) {
        const client = getClient(wallet.publicKey, wallet.signer);
        const tx = await client.submit_confession({
            player: wallet.publicKey,
            content_hash: toBuffer(contentHash),
            nullifier: toBuffer(nullifier),
            commitment: toBuffer(commitment),
            zk_proof: Buffer.from(proof),
        });
        const { result } = await tx.signAndSend();
        if (result.isErr()) {
            throw new Error(`Execution failed: ${JSON.stringify(result.unwrapErr())}`);
        }
        return result.unwrap();
    }

    async vote(wallet: Wallet, confessionId: string, voteType: VoteType) {
        const client = getClient(wallet.publicKey, wallet.signer);
        const tx = await client.vote({
            voter: wallet.publicKey,
            confession_id: BigInt(confessionId),
            vote_type: voteType,
        });
        const result = await tx.signAndSend();
        return result;
    }

    async placeBet(wallet: Wallet, confessionId: string, betReal: boolean, amountXLM: number) {
        const amount = BigInt(Math.floor(amountXLM * 10_000_000));
        const client = getClient(wallet.publicKey, wallet.signer);
        const tx = await client.place_bet({
            bettor: wallet.publicKey,
            confession_id: BigInt(confessionId),
            bet_real: betReal,
            amount: amount,
        });
        const result = await tx.signAndSend();
        return result;
    }

    async revealAuthorship(wallet: Wallet, confessionId: string, proof: Uint8Array) {
        const client = getClient(wallet.publicKey, wallet.signer);
        const tx = await client.reveal_authorship({
            player: wallet.publicKey,
            confession_id: BigInt(confessionId),
            zk_proof: Buffer.from(proof),
        });
        const result = await tx.signAndSend();
        return result;
    }

    async fetchConfessions(limit: number = 20, offset: number = 0): Promise<Confession[]> {
        const client = getClient();
        try {
            // Bindings can vary: sometimes they return the value directly,
            // sometimes they return a transaction object with a result property.
            const response = await client.get_confessions({ limit: BigInt(limit), offset: BigInt(offset) });
            const raw = (response as any).result || response || [];

            return (raw as any[]).map((c: any) => ({
                id: c.id.toString(),
                contentHash: c.content_hash?.toString('hex') || '',
                commitment: c.commitment?.toString('hex') || '',
                nullifier: c.nullifier?.toString('hex') || '',
                votesRelatable: Number(c.votes_relatable || 0),
                votesShocking: Number(c.votes_shocking || 0),
                votesFake: Number(c.votes_fake || 0),
                timestamp: Number(c.timestamp || 0),
                revealed: c.revealed || false,
                author: c.author?.toString(),
            }));
        } catch (e) {
            console.error('[Stellar] fetchConfessions error:', e);
            return [];
        }
    }

    async fetchBets(confessionId: string): Promise<Bet[]> {
        const client = getClient();
        try {
            const response = await client.get_bets({ confession_id: BigInt(confessionId) });
            const raw = (response as any).result || response || [];
            return (raw as any[]).map((b: any) => ({
                bettor: b.bettor?.toString() || '',
                confessionId: b.confession_id.toString(),
                betReal: b.bet_real,
                amount: Number(b.amount || 0) / 10_000_000,
                settled: b.settled || false,
            }));
        } catch (e) {
            console.error('[Stellar] fetchBets error:', e);
            return [];
        }
    }

    async addComment(wallet: Wallet, confessionId: string, text: string) {
        const client = getClient(wallet.publicKey, wallet.signer);
        const tx = await client.add_comment({
            author: wallet.publicKey,
            confession_id: BigInt(confessionId),
            text: text,
        });
        const result = await tx.signAndSend();
        return result;
    }

    async fetchComments(confessionId: string): Promise<Comment[]> {
        const client = getClient();
        try {
            const response = await client.get_comments({ confession_id: BigInt(confessionId) });
            const raw = (response as any).result || response || [];
            return (raw as any[]).map((c: any) => ({
                author: c.author?.toString() || '',
                text: c.text?.toString() || '',
                timestamp: Number(c.timestamp || 0),
            }));
        } catch (e) {
            console.error('[Stellar] fetchComments error:', e);
            return [];
        }
    }
}

export const stellarService = new StellarService();

