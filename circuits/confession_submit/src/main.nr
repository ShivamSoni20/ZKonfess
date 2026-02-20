use dep::std;

fn main(
    player_secret: Field, 
    date_salt: Field, 
    confession_content_hash: Field
) -> pub (Field, Field) {
    // Generate the nullifier: Poseidon(player_secret, date_salt)
    // This prevents double-submission for the same "day" (or round)
    let nullifier = std::hash::poseidon::bn254::hash_2([player_secret, date_salt]);
    
    // Generate the commitment: Poseidon(player_secret, confession_content_hash)
    // This seals the confession to the player without revealing authorship or content
    let commitment = std::hash::poseidon::bn254::hash_2([player_secret, confession_content_hash]);

    (nullifier, commitment)
}

#[test]
fn test_main() {
    let player_secret = 0x123;
    let date_salt = 0x456;
    let content_hash = 0x789;
    
    let (n, c) = main(player_secret, date_salt, content_hash);
    
    let expected_n = std::hash::poseidon::bn254::hash_2([player_secret, date_salt]);
    let expected_c = std::hash::poseidon::bn254::hash_2([player_secret, content_hash]);
    
    assert(n == expected_n);
    assert(c == expected_c);
}
