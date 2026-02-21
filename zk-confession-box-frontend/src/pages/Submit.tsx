import React, { useState } from 'react';
import { zkService } from '../services/zk';
import { stellarService, Wallet } from '../services/stellar';
import { usePlayer } from '../context/PlayerContext';
import { useWallet } from '../hooks/useWallet';

export const Submit: React.FC = () => {
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');
    const { playerSecret, registerIfNeeded, addConfession } = usePlayer();
    const { publicKey, getContractSigner } = useWallet();

    const handleSubmit = async () => {
        if (!content.trim()) return;
        if (!publicKey) return alert('Please connect wallet');

        const signer = getContractSigner();
        const wallet: Wallet = { publicKey, signer };

        setIsGenerating(true);
        setStatus('Initializing ZK circuit...');

        try {
            const secret = await registerIfNeeded(wallet);

            setStatus('Hashing confession content...');
            const contentHash = await zkService.hashContent(content);
            const dateSalt = Date.now(); // Changed for easier testing (allows multiple submissions per day)

            setStatus('Generating zero-knowledge proof...');
            const { proof, nullifier, commitment } = await zkService.generateSubmissionProof(
                secret,
                dateSalt,
                contentHash
            );

            setStatus('Submitting sealed confession to Stellar...');
            const confessionId = await stellarService.submitConfession(
                wallet,
                contentHash,
                nullifier,
                commitment,
                proof
            );

            addConfession(confessionId.toString());
            setContent('');
            setStatus('Confession sealed successfully.');
            alert(`Confession #${confessionId} submitted. Your secret is stored in memory for this session.`);
        } catch (e) {
            console.error(e);
            setStatus('Submission failed.');
            alert('Error during submission. Check console.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header stagger-enter stagger-1">
                <h1>Seal a Secret</h1>
                <p>Your identity stays private · only proof is shared</p>
            </header>

            <div className="dossier-card stagger-enter stagger-2">
                {/* Classification header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span className="text-label">Classified Entry</span>
                    <span className="text-label" style={{ color: 'var(--amber-dim)' }}>
                        {content.length}/280
                    </span>
                </div>

                {/* Textarea */}
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Speak your truth here..."
                        maxLength={280}
                        disabled={isGenerating}
                        className="vault-textarea"
                    />
                </div>

                {/* Status indicator */}
                {isGenerating && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        background: 'var(--amber-glow)',
                        border: '1px solid var(--vault-border)',
                        borderRadius: '2px',
                    }}>
                        <div className="vault-spinner" />
                        <span className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--amber)', letterSpacing: '0.05em' }}>
                            {status}
                        </span>
                    </div>
                )}

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={isGenerating || !content.trim()}
                    className="btn-primary"
                    style={{ width: '100%' }}
                >
                    {isGenerating ? 'Sealing...' : 'Seal & Submit Anonymously'}
                </button>

                {/* Divider */}
                <div className="divider" />

                {/* Warning */}
                <div className="warning-box">
                    <strong>Ephemeral Secret:</strong> Your player secret exists only in this browser tab's memory.
                    Closing or refreshing will permanently destroy your ability to prove authorship.
                </div>
            </div>
        </div>
    );
};
