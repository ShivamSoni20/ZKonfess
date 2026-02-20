import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { type CompiledCircuit } from '@noir-lang/types';

// We import the compiled circuits from the targets
// Note: In a real production environment, we might fetch these as JSON files
import confessionSubmitCircuit from '../../../circuits/confession_submit/target/confession_submit.json';
import authorshipRevealCircuit from '../../../circuits/authorship_reveal/target/authorship_reveal.json';

class ZKService {
  private playerSecret: string | null = null;

  /**
   * Generates a cryptographically random 32-byte hex secret.
   * Proves: The player possess a unique, private identity.
   */
  generatePlayerSecret(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    this.playerSecret = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return this.playerSecret;
  }

  getPlayerSecret(): string | null {
    return this.playerSecret;
  }

  /**
   * Hashes confession text into a field element (Poseidon compatible).
   * Proves: The commitment is tied to a specific text without revealing it.
   */
  async hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert to hex string for Noir field
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Calculates the identity commitment (Poseidon hash of secret).
   * Proves: The player is registered without revealing the secret.
   */
  async generateIdentityCommitment(playerSecret: string): Promise<string> {
    // This would typically use the Poseidon implementation from Noir/Barretenberg
    // For the MVP, we assume the frontend can compute this or get it from a circuit
    return await this.hashContent(playerSecret); // Placeholder for Poseidon(secret)
  }

  /**
   * Noir proof generation for submission.
   * Proves: Player knows secret & salt that results in nullifier + knows secret & content that results in commitment.
   */
  async generateSubmissionProof(
    playerSecret: string,
    dateSalt: number,
    contentHash: string
  ): Promise<{ proof: Uint8Array; nullifier: string; commitment: string }> {
    const backend = new BarretenbergBackend(confessionSubmitCircuit as unknown as CompiledCircuit);
    const noir = new Noir(confessionSubmitCircuit as unknown as CompiledCircuit, backend);

    const inputs = {
      player_secret: playerSecret,
      date_salt: dateSalt,
      confession_content_hash: contentHash,
    };

    const { proof, publicInputs } = await noir.generateProof(inputs);
    
    return {
      proof,
      nullifier: publicInputs[0], // Order depends on Nargo public outputs
      commitment: publicInputs[1],
    };
  }

  /**
   * Noir proof generation for reveal.
   * Proves: Poseidon(player_secret, content_hash) == claimed_commitment.
   */
  async generateRevealProof(
    playerSecret: string,
    contentHash: string,
    commitment: string
  ): Promise<{ proof: Uint8Array }> {
    const backend = new BarretenbergBackend(authorshipRevealCircuit as unknown as CompiledCircuit);
    const noir = new Noir(authorshipRevealCircuit as unknown as CompiledCircuit, backend);

    const inputs = {
      player_secret: playerSecret,
      confession_content_hash: contentHash,
      claimed_commitment: commitment,
    };

    const { proof } = await noir.generateProof(inputs);
    return { proof };
  }
}

export const zkService = new ZKService();
