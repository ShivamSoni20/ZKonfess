import { Contract, networks } from './bindings'; // Assuming bindings are generated here or moved
import * as Client from '../games/zk-confession-box/bindings';
import { Address, Keypair, TransactionBuilder, Asset, Operation } from '@stellar/stellar-sdk';

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

class StellarService {
    private client: typeof Client;
    private contractId: string = import.meta.env.VITE_ZK_CONFESSION_BOX_CONTRACT_ID || '';

    constructor() {
        // In a real app, Client would be initialized with network and contract ID
        // Client.setNetwork(networks.testnet);
        // Client.setContractId(this.contractId);
    }

    async registerPlayer(wallet: any, identityCommitment: string) {
        try {
            // Check if already registered (fetch profile)
            const profile = await Client.registerPlayer({
                player: wallet.publicKey,
                identity_commitment: identityCommitment,
            });
            return profile;
        } catch (e) {
            console.warn('Registration might have already happened or failed:', e);
            throw e;
        }
    }

    async submitConfession(
        wallet: any,
        contentHash: string,
        nullifier: string,
        commitment: string,
        proof: Uint8Array
    ) {
        return await Client.submitConfession({
            player: wallet.publicKey,
            content_hash: contentHash,
            nullifier: nullifier,
            commitment: commitment,
            zk_proof: Buffer.from(proof),
        });
    }

    async vote(wallet: any, confessionId: string, voteType: VoteType) {
        return await Client.vote({
            voter: wallet.publicKey,
            confession_id: BigInt(confessionId),
            vote_type: voteType,
        });
    }

    async placeBet(wallet: any, confessionId: string, betReal: boolean, amountXLM: number) {
        // 1 XLM = 10,000,000 stroops in Soroban i128 terms for common implementations
        const amount = BigInt(Math.floor(amountXLM * 10_000_000));
        return await Client.placeBet({
            bettor: wallet.publicKey,
            confession_id: BigInt(confessionId),
            bet_real: betReal,
            amount: amount,
        });
    }

    async revealAuthorship(wallet: any, confessionId: string, proof: Uint8Array) {
        return await Client.revealAuthorship({
            player: wallet.publicKey,
            confession_id: BigInt(confessionId),
            zk_proof: Buffer.from(proof),
        });
    }

    async fetchConfessions(limit: number = 10, offset: number = 0): Promise<Confession[]> {
        const raw = await Client.getConfessions({ limit: BigInt(limit), offset: BigInt(offset) });
        return raw.map((c: any) => ({
            id: c.id.toString(),
            contentHash: c.content_hash,
            commitment: c.commitment,
            nullifier: c.nullifier,
            votesRelatable: Number(c.votes_relatable),
            votesShocking: Number(c.votes_shocking),
            votesFake: Number(c.votes_fake),
            timestamp: Number(c.timestamp),
            revealed: c.revealed,
            author: c.author?.toString(),
        }));
    }

    async fetchBets(confessionId: string): Promise<Bet[]> {
        const raw = await Client.getBets({ confession_id: BigInt(confessionId) });
        return raw.map((b: any) => ({
            bettor: b.bettor.toString(),
            confessionId: b.confession_id.toString(),
            betReal: b.bet_real,
            amount: Number(b.amount) / 10_000_000,
            settled: b.settled,
        }));
    }
}

export const stellarService = new StellarService();
