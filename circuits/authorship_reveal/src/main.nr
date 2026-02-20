use dep::std;

fn main(
    player_secret: Field,
    confession_content_hash: Field,
    claimed_commitment: pub Field
) {
    // Verify that the provided secret and content hash match the public commitment
    let commitment = std::hash::poseidon::bn254::hash_2([player_secret, confession_content_hash]);
    
    assert(commitment == claimed_commitment);
}

#[test]
fn test_reveal() {
    let player_secret = 0x123;
    let content_hash = 0x789;
    let commitment = std::hash::poseidon::bn254::hash_2([player_secret, content_hash]);
    
    main(player_secret, content_hash, commitment);
}
