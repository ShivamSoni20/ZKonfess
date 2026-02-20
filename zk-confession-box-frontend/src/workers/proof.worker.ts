import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { type CompiledCircuit } from '@noir-lang/types';

self.onmessage = async (e: MessageEvent) => {
    const { type, circuit, inputs } = e.data;

    try {
        const backend = new BarretenbergBackend(circuit as CompiledCircuit);
        const noir = new Noir(circuit as CompiledCircuit, backend);

        console.log(`[Worker] Starting proof generation for: ${type}`);
        const { proof, publicInputs } = await noir.generateProof(inputs);

        self.postMessage({
            type: 'SUCCESS',
            proof,
            publicInputs,
        });
    } catch (error) {
        console.error('[Worker] Proof generation failed:', error);
        self.postMessage({
            type: 'ERROR',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
