#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

// Rarity enum
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Rarity {
    Common = 0,
    Rare = 1,
    Epic = 2,
    Legendary = 3,
}

// Character struct
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Character {
    pub id: u64,
    pub rarity: Rarity,
    pub power: u32,
    pub name: String,
    pub owner: Address,
    pub rolled_at: u64,
}

// Storage keys
const TOKEN_COUNTER: Symbol = symbol_short!("COUNTER");
const ROLL_PRICE: Symbol = symbol_short!("PRICE");
const ADMIN: Symbol = symbol_short!("ADMIN");

fn get_character_key(token_id: u64) -> Symbol {
    symbol_short!("CHAR")
}

fn get_user_chars_key(user: &Address) -> Symbol {
    symbol_short!("USERCH")
}

#[contract]
pub struct GachaGame;

#[contractimpl]
impl GachaGame {
    /// Initialize the contract with admin and roll price
    pub fn initialize(env: Env, admin: Address, roll_price: i128) {
        // Check if already initialized
        if env.storage().instance().has(&ADMIN) {
            panic!("Contract already initialized");
        }

        // Set admin
        env.storage().instance().set(&ADMIN, &admin);

        // Set initial roll price (in stroops, 1 XLM = 10,000,000 stroops)
        // Default: 1 XLM = 10_000_000 stroops
        env.storage().instance().set(&ROLL_PRICE, &roll_price);

        // Initialize counter
        env.storage().instance().set(&TOKEN_COUNTER, &1u64);

        // Extend TTL
        env.storage().instance().extend_ttl(50, 100);
    }

    /// Roll for a new character (mint NFT)
    pub fn roll(env: Env, player: Address) -> Character {
        player.require_auth();

        // Get roll price
        let roll_price: i128 = env
            .storage()
            .instance()
            .get(&ROLL_PRICE)
            .unwrap_or(10_000_000); // Default 1 XLM

        // Transfer payment from player to contract (in real implementation)
        // For now, we skip payment validation as it requires token integration

        // Get and increment token counter
        let token_id: u64 = env
            .storage()
            .instance()
            .get(&TOKEN_COUNTER)
            .unwrap_or(1);

        env.storage().instance().set(&TOKEN_COUNTER, &(token_id + 1));

        // Generate pseudo-random rarity
        let rarity = Self::determine_rarity(&env, token_id);

        // Generate power based on rarity
        let power = Self::generate_power(&env, rarity, token_id);

        // Generate name
        let name = Self::generate_name(&env, rarity, token_id);

        // Get current ledger timestamp
        let rolled_at = env.ledger().timestamp();

        // Create character
        let character = Character {
            id: token_id,
            rarity,
            power,
            name,
            owner: player.clone(),
            rolled_at,
        };

        // Store character
        env.storage().persistent().set(&token_id, &character);

        // Add to user's character list
        let mut user_chars: Vec<u64> = env
            .storage()
            .persistent()
            .get(&player)
            .unwrap_or(Vec::new(&env));
        user_chars.push_back(token_id);
        env.storage().persistent().set(&player, &user_chars);

        // Extend TTL
        env.storage().instance().extend_ttl(50, 100);
        env.storage().persistent().extend_ttl(&token_id, 50, 100);
        env.storage().persistent().extend_ttl(&player, 50, 100);

        // Emit event (simplified)
        env.events().publish(
            (symbol_short!("roll"), player.clone()),
            (token_id, rarity as u32, power),
        );

        character
    }

    /// Get character by ID
    pub fn get_character(env: Env, token_id: u64) -> Option<Character> {
        env.storage().persistent().get(&token_id)
    }

    /// Get all characters owned by a user
    pub fn get_user_characters(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&user)
            .unwrap_or(Vec::new(&env))
    }

    /// Get total characters minted
    pub fn get_total_characters(env: Env) -> u64 {
        let counter: u64 = env.storage().instance().get(&TOKEN_COUNTER).unwrap_or(1);
        counter - 1
    }

    /// Update roll price (admin only)
    pub fn set_roll_price(env: Env, caller: Address, new_price: i128) {
        caller.require_auth();

        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        if caller != admin {
            panic!("Only admin can set roll price");
        }

        env.storage().instance().set(&ROLL_PRICE, &new_price);
        env.storage().instance().extend_ttl(50, 100);
    }

    /// Get current roll price
    pub fn get_roll_price(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&ROLL_PRICE)
            .unwrap_or(10_000_000)
    }

    // === Internal Helper Functions ===

    /// Determine rarity based on pseudo-random number
    fn determine_rarity(env: &Env, seed: u64) -> Rarity {
        let random = Self::get_random_number(env, seed) % 10000;

        // Legendary: 1% (0-99)
        // Epic: 5% (100-599)
        // Rare: 20% (600-2599)
        // Common: 74% (2600-9999)

        if random < 100 {
            Rarity::Legendary
        } else if random < 600 {
            Rarity::Epic
        } else if random < 2600 {
            Rarity::Rare
        } else {
            Rarity::Common
        }
    }

    /// Generate power based on rarity
    fn generate_power(env: &Env, rarity: Rarity, seed: u64) -> u32 {
        let base_random = Self::get_random_number(env, seed + 1);

        match rarity {
            Rarity::Legendary => 800 + (base_random % 201), // 800-1000
            Rarity::Epic => 500 + (base_random % 301),      // 500-800
            Rarity::Rare => 200 + (base_random % 301),      // 200-500
            Rarity::Common => 50 + (base_random % 151),     // 50-200
        }
    }

    /// Generate character name
    fn generate_name(env: &Env, rarity: Rarity, seed: u64) -> String {
        // Predefined names for simplicity (avoiding format! which isn't available in no_std)
        let names = [
            // Common names (0-3)
            "Shadow Warrior",
            "Fire Mage",
            "Ice Assassin",
            "Thunder Knight",
            // Rare names (4-7)
            "Rare Shadow Mage",
            "Rare Fire Warrior",
            "Rare Ice Knight",
            "Rare Thunder Assassin",
            // Epic names (8-11)
            "Epic Shadow Knight",
            "Epic Fire Assassin",
            "Epic Ice Mage",
            "Epic Thunder Warrior",
            // Legendary names (12-15)
            "Legendary Shadow Assassin",
            "Legendary Fire Knight",
            "Legendary Ice Warrior",
            "Legendary Thunder Mage",
        ];

        let index = match rarity {
            Rarity::Common => Self::get_random_number(env, seed + 2) % 4,
            Rarity::Rare => 4 + (Self::get_random_number(env, seed + 2) % 4),
            Rarity::Epic => 8 + (Self::get_random_number(env, seed + 2) % 4),
            Rarity::Legendary => 12 + (Self::get_random_number(env, seed + 2) % 4),
        };

        String::from_str(env, names[index as usize])
    }

    /// Pseudo-random number generator (NOT cryptographically secure)
    fn get_random_number(env: &Env, seed: u64) -> u32 {
        // Use ledger timestamp, sequence, and seed for pseudo-randomness
        let timestamp = env.ledger().timestamp();
        let sequence = env.ledger().sequence();

        // Combine values for randomness
        let combined = timestamp
            .wrapping_mul(sequence as u64)
            .wrapping_add(seed);

        (combined % u32::MAX as u64) as u32
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register(GachaGame, ());
        let client = GachaGameClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let roll_price = 10_000_000i128; // 1 XLM

        client.initialize(&admin, &roll_price);

        assert_eq!(client.get_roll_price(), roll_price);
        assert_eq!(client.get_total_characters(), 0);
    }

    #[test]
    fn test_roll_character() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(GachaGame, ());
        let client = GachaGameClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let player = Address::generate(&env);
        let roll_price = 10_000_000i128;

        client.initialize(&admin, &roll_price);

        // Roll a character
        let character = client.roll(&player);

        assert_eq!(character.id, 1);
        assert_eq!(character.owner, player);
        assert!(character.power > 0);

        // Check total characters
        assert_eq!(client.get_total_characters(), 1);

        // Check user's characters
        let user_chars = client.get_user_characters(&player);
        assert_eq!(user_chars.len(), 1);
        assert_eq!(user_chars.get(0).unwrap(), 1);
    }

    #[test]
    fn test_multiple_rolls() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(GachaGame, ());
        let client = GachaGameClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        client.initialize(&admin, &10_000_000);

        // Roll 10 characters
        for _ in 0..10 {
            client.roll(&player);
        }

        assert_eq!(client.get_total_characters(), 10);

        let user_chars = client.get_user_characters(&player);
        assert_eq!(user_chars.len(), 10);
    }
}
