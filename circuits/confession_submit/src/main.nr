use dep::std;

fn main(
    player_secret: Field,
    date_salt: Field,
    confession_content_hash: Field
) -> pub (Field, Field) {
    let nullifier = std::hash::pedersen_hash([player_secret, date_salt]);
    let commitment = std::hash::pedersen_hash([player_secret, confession_content_hash]);
    (nullifier, commitment)
}

#[test]
fn test_main() {
    let player_secret = 0x123;
    let date_salt = 456;
    let content_hash = 0xabc;
    
    let (n, c) = main(player_secret, date_salt, content_hash);
    
    let expected_n = std::hash::pedersen_hash([player_secret, date_salt]);
    let expected_c = std::hash::pedersen_hash([player_secret, content_hash]);
    
    assert(n == expected_n);
    assert(c == expected_c);
}
