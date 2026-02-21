use dep::std;

fn main(
    player_secret: Field,
    confession_content_hash: Field,
    claimed_commitment: pub Field
) {
    let commitment = std::hash::pedersen_hash([player_secret, confession_content_hash]);
    assert(commitment == claimed_commitment);
}

#[test]
fn test_main() {
    let player_secret = 0x123;
    let content_hash = 0xabc;
    let commitment = std::hash::pedersen_hash([player_secret, content_hash]);
    
    main(player_secret, content_hash, commitment);
}
