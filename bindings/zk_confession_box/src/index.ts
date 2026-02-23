import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CD6TPVFNBPVMKZPXI2ZTXGUFFPDKY5U6W5O6OSCAXOUHDBNJSIJWEEXZ",
  }
} as const


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

export type DataKey = {tag: "Admin", values: void} | {tag: "GameHub", values: void} | {tag: "Player", values: readonly [string]} | {tag: "Confession", values: readonly [u64]} | {tag: "ConfessionCount", values: void} | {tag: "Bet", values: readonly [string, u64]} | {tag: "ConfessionBets", values: readonly [u64]} | {tag: "Voted", values: readonly [string, u64]} | {tag: "RoundActive", values: void} | {tag: "Nullifier", values: readonly [Buffer]} | {tag: "Comments", values: readonly [u64]};


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

export const ContractError = {
  1: {message:"NullifierAlreadyUsed"},
  2: {message:"InvalidProof"},
  3: {message:"PlayerNotRegistered"},
  4: {message:"ConfessionNotFound"},
  5: {message:"BetAlreadyClosed"},
  6: {message:"AlreadyVoted"},
  7: {message:"Unauthorized"},
  8: {message:"InsufficientFunds"},
  9: {message:"RoundNotActive"}
}


export interface PlayerProfile {
  identity_commitment: Buffer;
  reputation_score: i32;
  total_confessions: u32;
}

export interface Client {
  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vote: ({voter, confession_id, vote_type}: {voter: string, confession_id: u64, vote_type: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a end_week transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  end_week: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_bets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bets: ({confession_id}: {confession_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Bet>>>

  /**
   * Construct and simulate a place_bet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  place_bet: ({bettor, confession_id, bet_real, amount}: {bettor: string, confession_id: u64, bet_real: boolean, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, game_hub}: {admin: string, game_hub: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a add_comment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_comment: ({author, confession_id, text}: {author: string, confession_id: u64, text: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_comments transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_comments: ({confession_id}: {confession_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Comment>>>

  /**
   * Construct and simulate a get_confessions transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_confessions: ({limit, offset}: {limit: u64, offset: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Confession>>>

  /**
   * Construct and simulate a register_player transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_player: ({player, identity_commitment}: {player: string, identity_commitment: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a reveal_authorship transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reveal_authorship: ({player, confession_id, zk_proof}: {player: string, confession_id: u64, zk_proof: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a submit_confession transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_confession: ({player, content_hash, nullifier, commitment, zk_proof}: {player: string, content_hash: Buffer, nullifier: Buffer, commitment: Buffer, zk_proof: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAA0JldAAAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACGJldF9yZWFsAAAAAQAAAAAAAAAGYmV0dG9yAAAAAAATAAAAAAAAAA1jb25mZXNzaW9uX2lkAAAAAAAABgAAAAAAAAAHc2V0dGxlZAAAAAAB",
        "AAAAAQAAAAAAAAAAAAAAB0NvbW1lbnQAAAAAAwAAAAAAAAAGYXV0aG9yAAAAAAATAAAAAAAAAAR0ZXh0AAAAEAAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAHR2FtZUh1YgAAAAABAAAAAAAAAAZQbGF5ZXIAAAAAAAEAAAATAAAAAQAAAAAAAAAKQ29uZmVzc2lvbgAAAAAAAQAAAAYAAAAAAAAAAAAAAA9Db25mZXNzaW9uQ291bnQAAAAAAQAAAAAAAAADQmV0AAAAAAIAAAATAAAABgAAAAEAAAAAAAAADkNvbmZlc3Npb25CZXRzAAAAAAABAAAABgAAAAEAAAAAAAAABVZvdGVkAAAAAAAAAgAAABMAAAAGAAAAAAAAAAAAAAALUm91bmRBY3RpdmUAAAAAAQAAAAAAAAAJTnVsbGlmaWVyAAAAAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAAIQ29tbWVudHMAAAABAAAABg==",
        "AAAAAQAAAAAAAAAAAAAACkNvbmZlc3Npb24AAAAAAAoAAAAAAAAABmF1dGhvcgAAAAAD6AAAABMAAAAAAAAACmNvbW1pdG1lbnQAAAAAA+4AAAAgAAAAAAAAAAxjb250ZW50X2hhc2gAAAPuAAAAIAAAAAAAAAACaWQAAAAAAAYAAAAAAAAACW51bGxpZmllcgAAAAAAA+4AAAAgAAAAAAAAAAhyZXZlYWxlZAAAAAEAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAACnZvdGVzX2Zha2UAAAAAAAQAAAAAAAAAD3ZvdGVzX3JlbGF0YWJsZQAAAAAEAAAAAAAAAA52b3Rlc19zaG9ja2luZwAAAAAABA==",
        "AAAABAAAAAAAAAAAAAAADUNvbnRyYWN0RXJyb3IAAAAAAAAJAAAAAAAAABROdWxsaWZpZXJBbHJlYWR5VXNlZAAAAAEAAAAAAAAADEludmFsaWRQcm9vZgAAAAIAAAAAAAAAE1BsYXllck5vdFJlZ2lzdGVyZWQAAAAAAwAAAAAAAAASQ29uZmVzc2lvbk5vdEZvdW5kAAAAAAAEAAAAAAAAABBCZXRBbHJlYWR5Q2xvc2VkAAAABQAAAAAAAAAMQWxyZWFkeVZvdGVkAAAABgAAAAAAAAAMVW5hdXRob3JpemVkAAAABwAAAAAAAAARSW5zdWZmaWNpZW50RnVuZHMAAAAAAAAIAAAAAAAAAA5Sb3VuZE5vdEFjdGl2ZQAAAAAACQ==",
        "AAAAAQAAAAAAAAAAAAAADVBsYXllclByb2ZpbGUAAAAAAAADAAAAAAAAABNpZGVudGl0eV9jb21taXRtZW50AAAAA+4AAAAgAAAAAAAAABByZXB1dGF0aW9uX3Njb3JlAAAABQAAAAAAAAARdG90YWxfY29uZmVzc2lvbnMAAAAAAAAE",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAANY29uZmVzc2lvbl9pZAAAAAAAAAYAAAAAAAAACXZvdGVfdHlwZQAAAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAIZW5kX3dlZWsAAAAAAAAAAQAAA+kAAAACAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAIZ2V0X2JldHMAAAABAAAAAAAAAA1jb25mZXNzaW9uX2lkAAAAAAAABgAAAAEAAAPqAAAH0AAAAANCZXQA",
        "AAAAAAAAAAAAAAAJcGxhY2VfYmV0AAAAAAAABAAAAAAAAAAGYmV0dG9yAAAAAAATAAAAAAAAAA1jb25mZXNzaW9uX2lkAAAAAAAABgAAAAAAAAAIYmV0X3JlYWwAAAABAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAhnYW1lX2h1YgAAABMAAAAA",
        "AAAAAAAAAAAAAAALYWRkX2NvbW1lbnQAAAAAAwAAAAAAAAAGYXV0aG9yAAAAAAATAAAAAAAAAA1jb25mZXNzaW9uX2lkAAAAAAAABgAAAAAAAAAEdGV4dAAAABAAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAMZ2V0X2NvbW1lbnRzAAAAAQAAAAAAAAANY29uZmVzc2lvbl9pZAAAAAAAAAYAAAABAAAD6gAAB9AAAAAHQ29tbWVudAA=",
        "AAAAAAAAAAAAAAAPZ2V0X2NvbmZlc3Npb25zAAAAAAIAAAAAAAAABWxpbWl0AAAAAAAABgAAAAAAAAAGb2Zmc2V0AAAAAAAGAAAAAQAAA+oAAAfQAAAACkNvbmZlc3Npb24AAA==",
        "AAAAAAAAAAAAAAAPcmVnaXN0ZXJfcGxheWVyAAAAAAIAAAAAAAAABnBsYXllcgAAAAAAEwAAAAAAAAATaWRlbnRpdHlfY29tbWl0bWVudAAAAAPuAAAAIAAAAAEAAAPpAAAAAgAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAARcmV2ZWFsX2F1dGhvcnNoaXAAAAAAAAADAAAAAAAAAAZwbGF5ZXIAAAAAABMAAAAAAAAADWNvbmZlc3Npb25faWQAAAAAAAAGAAAAAAAAAAh6a19wcm9vZgAAAA4AAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAARc3VibWl0X2NvbmZlc3Npb24AAAAAAAAFAAAAAAAAAAZwbGF5ZXIAAAAAABMAAAAAAAAADGNvbnRlbnRfaGFzaAAAA+4AAAAgAAAAAAAAAAludWxsaWZpZXIAAAAAAAPuAAAAIAAAAAAAAAAKY29tbWl0bWVudAAAAAAD7gAAACAAAAAAAAAACHprX3Byb29mAAAADgAAAAEAAAPpAAAABgAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    vote: this.txFromJSON<Result<void>>,
        end_week: this.txFromJSON<Result<void>>,
        get_bets: this.txFromJSON<Array<Bet>>,
        place_bet: this.txFromJSON<Result<void>>,
        initialize: this.txFromJSON<null>,
        add_comment: this.txFromJSON<Result<void>>,
        get_comments: this.txFromJSON<Array<Comment>>,
        get_confessions: this.txFromJSON<Array<Confession>>,
        register_player: this.txFromJSON<Result<void>>,
        reveal_authorship: this.txFromJSON<Result<void>>,
        submit_confession: this.txFromJSON<Result<u64>>
  }
}