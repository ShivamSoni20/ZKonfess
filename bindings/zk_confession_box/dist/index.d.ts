import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, i32, u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CD6TPVFNBPVMKZPXI2ZTXGUFFPDKY5U6W5O6OSCAXOUHDBNJSIJWEEXZ";
    };
};
export interface Bet {
    amount: i128;
    bet_real: boolean;
    bettor: string;
    confession_id: u64;
    settled: boolean;
}
export interface Comment {
    author: string;
    text: string;
    timestamp: u64;
}
export type DataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "GameHub";
    values: void;
} | {
    tag: "Player";
    values: readonly [string];
} | {
    tag: "Confession";
    values: readonly [u64];
} | {
    tag: "ConfessionCount";
    values: void;
} | {
    tag: "Bet";
    values: readonly [string, u64];
} | {
    tag: "ConfessionBets";
    values: readonly [u64];
} | {
    tag: "Voted";
    values: readonly [string, u64];
} | {
    tag: "RoundActive";
    values: void;
} | {
    tag: "Nullifier";
    values: readonly [Buffer];
} | {
    tag: "Comments";
    values: readonly [u64];
};
export interface Confession {
    author: Option<string>;
    commitment: Buffer;
    content_hash: Buffer;
    id: u64;
    nullifier: Buffer;
    revealed: boolean;
    timestamp: u64;
    votes_fake: u32;
    votes_relatable: u32;
    votes_shocking: u32;
}
export declare const ContractError: {
    1: {
        message: string;
    };
    2: {
        message: string;
    };
    3: {
        message: string;
    };
    4: {
        message: string;
    };
    5: {
        message: string;
    };
    6: {
        message: string;
    };
    7: {
        message: string;
    };
    8: {
        message: string;
    };
    9: {
        message: string;
    };
};
export interface PlayerProfile {
    identity_commitment: Buffer;
    reputation_score: i32;
    total_confessions: u32;
}
export interface Client {
    /**
     * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    vote: ({ voter, confession_id, vote_type }: {
        voter: string;
        confession_id: u64;
        vote_type: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a end_week transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    end_week: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_bets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_bets: ({ confession_id }: {
        confession_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<Bet>>>;
    /**
     * Construct and simulate a place_bet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    place_bet: ({ bettor, confession_id, bet_real, amount }: {
        bettor: string;
        confession_id: u64;
        bet_real: boolean;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    initialize: ({ admin, game_hub }: {
        admin: string;
        game_hub: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a add_comment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_comment: ({ author, confession_id, text }: {
        author: string;
        confession_id: u64;
        text: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_comments transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_comments: ({ confession_id }: {
        confession_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<Comment>>>;
    /**
     * Construct and simulate a get_confessions transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_confessions: ({ limit, offset }: {
        limit: u64;
        offset: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<Confession>>>;
    /**
     * Construct and simulate a register_player transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    register_player: ({ player, identity_commitment }: {
        player: string;
        identity_commitment: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a reveal_authorship transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    reveal_authorship: ({ player, confession_id, zk_proof }: {
        player: string;
        confession_id: u64;
        zk_proof: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a submit_confession transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_confession: ({ player, content_hash, nullifier, commitment, zk_proof }: {
        player: string;
        content_hash: Buffer;
        nullifier: Buffer;
        commitment: Buffer;
        zk_proof: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        vote: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        end_week: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_bets: (json: string) => AssembledTransaction<Bet[]>;
        place_bet: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        initialize: (json: string) => AssembledTransaction<null>;
        add_comment: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_comments: (json: string) => AssembledTransaction<Comment[]>;
        get_confessions: (json: string) => AssembledTransaction<Confession[]>;
        register_player: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        reveal_authorship: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        submit_confession: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
