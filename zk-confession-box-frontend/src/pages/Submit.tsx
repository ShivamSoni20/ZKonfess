import React, { useState } from 'react';
import { zkService } from '../services/zk';
import { stellarService } from '../services/stellar';
import { usePlayer } from '../context/PlayerContext';
import { useWallet } from '../hooks/useWallet';

export const Submit: React.FC = () => {
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');
    const { playerSecret, registerIfNeeded, addConfession } = usePlayer();
    const { publicKey } = useWallet();

    const handleSubmit = async () => {
        if (!content.trim()) return;
        if (!publicKey) return alert('Please connect wallet');

        setIsGenerating(true);
        setStatus('🔐 INITIALIZING ZK CIRCUIT...');

        try {
            // 1. Ensure registered
            await registerIfNeeded({ publicKey });

            // 2. Prepare inputs
            setStatus('⏳ HASHING CONTENT...');
            const contentHash = await zkService.hashContent(content);
            const dateSalt = Math.floor(Date.now() / 86400000);

            // 3. Generate Proof
            setStatus('🛡️ GENERATING ZERO-KNOWLEDGE PROOF...');
            // Note: In a real worker implementation, this would be a message send/wait
            // For MVP we call the service directly which might block UI (ideal: Worker)
            const secret = playerSecret || zkService.generatePlayerSecret();
            const { proof, nullifier, commitment } = await zkService.generateSubmissionProof(
                secret,
                dateSalt,
                contentHash
            );

            // 4. Submit to Stellar
            setStatus('🚀 SUBMITTING SEALED CONFESSION TO STELLAR...');
            const confessionId = await stellarService.submitConfession(
                { publicKey },
                contentHash,
                nullifier,
                commitment,
                proof
            );

            // 5. Track ownership locally
            addConfession(confessionId.toString());

            setContent('');
            setStatus('✅ CONFESSION SUBMITTED ANONYMOUSLY');
            alert(`Confession #${confessionId} submitted! Your secret is stored in memory for this session.`);
        } catch (e) {
            console.error(e);
            setStatus('❌ SUBMISSION FAILED');
            alert('Error during submission. Check console.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Seal a Secret</h2>
                <p className="text-zinc-500 text-sm mb-8">Your identity stays private. Only the proof of your knowledge is shared.</p>

                <div className="relative mb-8">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What is your confession?"
                        maxLength={280}
                        disabled={isGenerating}
                        className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all font-mono resize-none"
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-600">
                        {content.length}/280
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isGenerating || !content.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2 ${isGenerating
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>{status}</span>
                        </>
                    ) : (
                        <>
                            <span>SUBMIT ANONYMOUSLY</span>
                            <span>🔒</span>
                        </>
                    )}
                </button>

                <div className="mt-8 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50 italic text-[11px] text-zinc-500 leading-relaxed">
                    <span className="text-zinc-400 font-bold not-italic">Warning:</span> Your player secret is held only in memory. If you refresh or close this tab, you will lose the ability to prove you are the author of this confession.
                </div>
            </div>
        </div>
    );
};
