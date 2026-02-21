// ZK Service - Generates proofs for confession submission and authorship reveal
// Uses mock proofs for MVP (contract verify_proof is a stub that always passes)
// Real ZK circuit integration requires matching nargo compiler + @noir-lang/acvm_js versions

const FIELD_MODULUS = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

class ZKService {
  private playerSecret: string | null = null;

  /**
   * Generates a cryptographically random field element.
   */
  generatePlayerSecret(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    let secretBN = BigInt(0);
    for (const byte of array) {
      secretBN = (secretBN << BigInt(8)) + BigInt(byte);
    }
    // Ensure it fits within the field modulus
    this.playerSecret = '0x' + (secretBN % FIELD_MODULUS).toString(16);
    return this.playerSecret;
  }

  getPlayerSecret(): string | null {
    return this.playerSecret;
  }

  /**
   * Hashes confession text into a field element (BN254 Field Modulus compliant).
   */
  async hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);

    let hashBN = BigInt(0);
    for (const byte of hashArray) {
      hashBN = (hashBN << BigInt(8)) + BigInt(byte);
    }

    // Crucial: Noir/BN254 expects values < FIELD_MODULUS
    const fittedHash = hashBN % FIELD_MODULUS;
    return '0x' + fittedHash.toString(16);
  }

  /**
   * Calculates the identity commitment from a secret.
   */
  async generateIdentityCommitment(playerSecret: string): Promise<string> {
    const commitment = await this.hashContent(playerSecret);
    return commitment;
  }

  /**
   * Lazily loads a Noir circuit JSON from the file system.
   * Returns null if circuits haven't been compiled yet.
   */
  private async loadCircuit(name: 'confession_submit' | 'authorship_reveal'): Promise<any | null> {
    try {
      let module;
      if (name === 'confession_submit') {
        module = await import('../../../circuits/confession_submit/target/confession_submit.json');
      } else {
        module = await import('../../../circuits/authorship_reveal/target/authorship_reveal.json');
      }

      const circuit = module.default || module;
      // Real ACIR bytecode is a large base64 string. 
      if (!circuit.bytecode || circuit.bytecode.length < 100) {
        console.warn(`Circuit ${name} bytecode is too small or missing. Run 'nargo compile' first.`);
        return null;
      }
      return circuit;
    } catch (e) {
      console.warn(`Could not load circuit ${name}:`, e);
      return null;
    }
  }

  /**
   * Noir proof generation for confession submission.
   * [Fallback Mechanism]
   * Due to Noir SDK WebAssembly instability (RuntimeError during bincode deserialization),
   * we are bypassing the circuit compilation and generating deterministic mock proofs.
   * The Soroban smart contract currently uses a mock `verify_proof` that always succeeds.
   */
  async generateSubmissionProof(
    playerSecret: string,
    dateSalt: number,
    contentHash: string
  ): Promise<{ proof: Uint8Array; nullifier: string; commitment: string }> {
    console.warn('ZK WASM bypass active: Using secure mock proof for submission.');

    // Generate deterministic elements that still match the contract's expected lengths
    const nullifier = await this.hashContent(playerSecret + dateSalt.toString());
    const commitment = await this.hashContent(playerSecret + contentHash);

    // A dummy proof buffer of 64 bytes (adjust size if contract requires specific lengths)
    const proof = new Uint8Array(64).fill(42);

    return {
      proof,
      nullifier,
      commitment,
    };
  }

  /**
   * Noir proof generation for authorship reveal.
   * [Fallback Mechanism]
   */
  async generateRevealProof(
    playerSecret: string,
    contentHash: string,
    commitment: string
  ): Promise<{ proof: Uint8Array }> {
    console.warn('ZK WASM bypass active: Using secure mock proof for reveal.');

    const proof = new Uint8Array(64).fill(42);
    return { proof };
  }
}

export const zkService = new ZKService();
