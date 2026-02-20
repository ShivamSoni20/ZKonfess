#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Map,
    Symbol, Vec, Bytes, BytesN,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    NullifierAlreadyUsed = 1,
    InvalidProof = 2,
    PlayerNotRegistered = 3,
    ConfessionNotFound = 4,
    BetAlreadyClosed = 5,
    AlreadyVoted = 6,
    Unauthorized = 7,
    InsufficientFunds = 8,
    RoundNotActive = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Confession {
    pub id: u64,
    pub content_hash: BytesN<32>,
    pub commitment: BytesN<32>,
    pub nullifier: BytesN<32>,
    pub votes_relatable: u32,
    pub votes_shocking: u32,
    pub votes_fake: u32,
    pub timestamp: u64,
    pub revealed: bool,
    pub author: Option<Address>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bet {
    pub bettor: Address,
    pub confession_id: u64,
    pub bet_real: bool,
    pub amount: i128,
    pub settled: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PlayerProfile {
    pub identity_commitment: BytesN<32>,
    pub total_confessions: u32,
    pub reputation_score: i32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    GameHub,
    Player(Address),
    Confession(u64),
    ConfessionCount,
    Bet(Address, u64),
    ConfessionBets(u64),
    Voted(Address, u64),
    RoundActive,
    Nullifier(BytesN<32>),
}

mod game_hub {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/mock_game_hub.wasm"
    );
}

#[contract]
pub struct ZKConfessionBox;

#[contractimpl]
impl ZKConfessionBox {
    pub fn initialize(env: Env, admin: Address, game_hub: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::GameHub, &game_hub);
        env.storage().instance().set(&DataKey::ConfessionCount, &0u64);
        env.storage().instance().set(&DataKey::RoundActive, &true);
    }

    pub fn register_player(env: Env, player: Address, identity_commitment: BytesN<32>) -> Result<(), ContractError> {
        player.require_auth();
        let profile = PlayerProfile {
            identity_commitment,
            total_confessions: 0,
            reputation_score: 0,
        };
        env.storage().persistent().set(&DataKey::Player(player), &profile);
        Ok(())
    }

    pub fn submit_confession(
        env: Env,
        player: Address,
        content_hash: BytesN<32>,
        nullifier: BytesN<32>,
        commitment: BytesN<32>,
        zk_proof: Bytes,
    ) -> Result<u64, ContractError> {
        player.require_auth();

        if !env.storage().persistent().has(&DataKey::Player(player.clone())) {
            return Err(ContractError::PlayerNotRegistered);
        }

        if env.storage().persistent().has(&DataKey::Nullifier(nullifier.clone())) {
            return Err(ContractError::NullifierAlreadyUsed);
        }
        env.storage().persistent().set(&DataKey::Nullifier(nullifier.clone()), &true);

        let mut public_inputs = Vec::new(&env);
        public_inputs.push_back(ZKConfessionBox::bytes_to_field_element(&env, &nullifier));
        public_inputs.push_back(ZKConfessionBox::bytes_to_field_element(&env, &commitment));

        let vk = ZKConfessionBox::get_submit_verification_key(&env);
        if !ZKConfessionBox::verify_proof(&env, &vk, &zk_proof, &public_inputs) {
            return Err(ContractError::InvalidProof);
        }

        let mut count: u64 = env.storage().instance().get(&DataKey::ConfessionCount).unwrap_or(0);
        count += 1;

        let confession = Confession {
            id: count,
            content_hash,
            commitment,
            nullifier,
            votes_relatable: 0,
            votes_shocking: 0,
            votes_fake: 0,
            timestamp: env.ledger().timestamp(),
            revealed: false,
            author: None,
        };

        env.storage().persistent().set(&DataKey::Confession(count), &confession);
        env.storage().instance().set(&DataKey::ConfessionCount, &count);

        let mut profile: PlayerProfile = env.storage().persistent().get(&DataKey::Player(player.clone())).unwrap();
        profile.total_confessions += 1;
        env.storage().persistent().set(&DataKey::Player(player), &profile);

        if count == 1 {
            let game_hub_id: Address = env.storage().instance().get(&DataKey::GameHub).unwrap();
            let client = game_hub::Client::new(&env, &game_hub_id);
            client.start_game();
        }

        Ok(count)
    }

    pub fn vote(env: Env, voter: Address, confession_id: u64, vote_type: u32) -> Result<(), ContractError> {
        voter.require_auth();
        if env.storage().persistent().has(&DataKey::Voted(voter.clone(), confession_id)) {
            return Err(ContractError::AlreadyVoted);
        }
        let mut confession: Confession = env.storage().persistent().get(&DataKey::Confession(confession_id))
            .ok_or(ContractError::ConfessionNotFound)?;
        match vote_type {
            0 => confession.votes_relatable += 1,
            1 => confession.votes_shocking += 1,
            2 => confession.votes_fake += 1,
            _ => return Err(ContractError::Unauthorized),
        }
        env.storage().persistent().set(&DataKey::Confession(confession_id), &confession);
        env.storage().persistent().set(&DataKey::Voted(voter, confession_id), &true);
        Ok(())
    }

    pub fn place_bet(env: Env, bettor: Address, confession_id: u64, bet_real: bool, amount: i128) -> Result<(), ContractError> {
        bettor.require_auth();
        if !env.storage().instance().get(&DataKey::RoundActive).unwrap_or(false) {
            return Err(ContractError::RoundNotActive);
        }
        if !env.storage().persistent().has(&DataKey::Confession(confession_id)) {
            return Err(ContractError::ConfessionNotFound);
        }
        let bet = Bet { bettor: bettor.clone(), confession_id, bet_real, amount, settled: false };
        env.storage().persistent().set(&DataKey::Bet(bettor.clone(), confession_id), &bet);
        let mut confession_bets: Vec<Address> = env.storage().persistent().get(&DataKey::ConfessionBets(confession_id)).unwrap_or(Vec::new(&env));
        confession_bets.push_back(bettor);
        env.storage().persistent().set(&DataKey::ConfessionBets(confession_id), &confession_bets);
        Ok(())
    }

    pub fn reveal_authorship(env: Env, player: Address, confession_id: u64, zk_proof: Bytes) -> Result<(), ContractError> {
        player.require_auth();
        let mut confession: Confession = env.storage().persistent().get(&DataKey::Confession(confession_id))
            .ok_or(ContractError::ConfessionNotFound)?;
        if confession.revealed { return Ok(()); }
        let mut public_inputs = Vec::new(&env);
        public_inputs.push_back(ZKConfessionBox::bytes_to_field_element(&env, &confession.commitment));
        let vk = ZKConfessionBox::get_reveal_verification_key(&env);
        if !ZKConfessionBox::verify_proof(&env, &vk, &zk_proof, &public_inputs) {
            return Err(ContractError::InvalidProof);
        }
        confession.revealed = true;
        confession.author = Some(player.clone());
        env.storage().persistent().set(&DataKey::Confession(confession_id), &confession);
        let bettors: Vec<Address> = env.storage().persistent().get(&DataKey::ConfessionBets(confession_id)).unwrap_or(Vec::new(&env));
        for bettor in bettors.iter() {
            if let Some(mut bet) = env.storage().persistent().get::<_, Bet>(&DataKey::Bet(bettor.clone(), confession_id)) {
                if !bet.settled {
                    bet.settled = true;
                    env.storage().persistent().set(&DataKey::Bet(bettor, confession_id), &bet);
                }
            }
        }
        Ok(())
    }

    pub fn end_week(env: Env) -> Result<(), ContractError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let count: u64 = env.storage().instance().get(&DataKey::ConfessionCount).unwrap_or(0);
        let mut winner_id = 0u64;
        let mut max_votes = 0u32;
        for i in 1..=count {
            if let Some(conf) = env.storage().persistent().get::<_, Confession>(&DataKey::Confession(i)) {
                let total = conf.votes_relatable + conf.votes_shocking;
                if total > max_votes { max_votes = total; winner_id = i; }
            }
        }
        let game_hub_id: Address = env.storage().instance().get(&DataKey::GameHub).unwrap();
        let client = game_hub::Client::new(&env, &game_hub_id);
        client.end_game(&true);
        env.storage().instance().set(&DataKey::RoundActive, &false);
        Ok(())
    }

    pub fn get_confessions(env: Env, limit: u64, offset: u64) -> Vec<Confession> {
        let mut list = Vec::new(&env);
        let count: u64 = env.storage().instance().get(&DataKey::ConfessionCount).unwrap_or(0);
        let start = offset + 1;
        let end = (start + limit).min(count + 1);
        for i in start..end {
            if let Some(conf) = env.storage().persistent().get::<_, Confession>(&DataKey::Confession(i)) {
                list.push_back(conf);
            }
        }
        list
    }

    pub fn get_bets(env: Env, confession_id: u64) -> Vec<Bet> {
        let mut list = Vec::new(&env);
        let bettors: Vec<Address> = env.storage().persistent().get(&DataKey::ConfessionBets(confession_id)).unwrap_or(Vec::new(&env));
        for bettor in bettors.iter() {
            if let Some(bet) = env.storage().persistent().get::<_, Bet>(&DataKey::Bet(bettor, confession_id)) {
                list.push_back(bet);
            }
        }
        list
    }
}

impl ZKConfessionBox {
    fn get_submit_verification_key(env: &Env) -> Bytes { Bytes::from_slice(env, &[0u8; 32]) }
    fn get_reveal_verification_key(env: &Env) -> Bytes { Bytes::from_slice(env, &[0u8; 32]) }
    fn verify_proof(env: &Env, vk: &Bytes, proof: &Bytes, public_inputs: &Vec<BytesN<32>>) -> bool {
        // Assumption for Protocol 25 BN254 host function:
        // env.crypto().verify_groth16_proof(vk, proof, public_inputs).is_ok()
        if proof.len() == 0 { return false; }
        true 
    }
    fn bytes_to_field_element(env: &Env, bytes: &BytesN<32>) -> BytesN<32> { bytes.clone() }
}
