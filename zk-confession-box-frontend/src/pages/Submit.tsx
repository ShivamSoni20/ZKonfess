import React, { useState } from 'react';
import { zkService } from '../services/zk';
import { stellarService, Wallet } from '../services/stellar';
import { usePlayer } from '../context/PlayerContext';
import { useWallet } from '../hooks/useWallet';
import { contentStorage } from '../services/contentStorage';
import { Buffer } from 'buffer';

export const Submit: React.FC = () => {
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');
    const { playerSecret, registerIfNeeded, addConfession } = usePlayer();
    const { publicKey, getContractSigner } = useWallet();

    const handleSubmit = async () => {
        if (content.trim().length < 3) return;
        if (!publicKey) return;

        const signer = getContractSigner();
        const wallet: Wallet = { publicKey, signer };

        setIsGenerating(true);
        setStatus('📝 Preparing your confession...');

        try {
            // Step 1: Registration (silent check as per spec)
            setStatus('⛓️ Verifying player registration...');
            const secret = await registerIfNeeded(wallet);


            // Step 2: Hashing
            setStatus('📝 Preparing your confession...');
            const contentHash = await zkService.hashContent(content);
            const dateSalt = Math.floor(Date.now() / 86400000); // Spec: daily salt

            // Step 3: ZK Proof Generation
            setStatus('🔐 Generating your zero-knowledge proof...');
            const { proof, nullifier, commitment } = await zkService.generateSubmissionProof(
                secret,
                dateSalt,
                contentHash
            );

            // Step 4: Submitting to chain
            setStatus('📡 Submitting to Stellar testnet...');

            // Save to local content storage (Mocking Supabase as per spec)
            contentStorage.saveContent(Buffer.from(contentHash).toString('hex'), content);

            const confessionId = await stellarService.submitConfession(

                wallet,
                contentHash,
                nullifier,
                commitment,
                proof
            );

            // Step 5: Success
            addConfession(confessionId.toString());
            setContent('');
            setStatus('SUCCESS');
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : 'Unknown error';
            if (msg.includes('declined')) {
                setStatus('Transaction cancelled.');
            } else if (msg.includes('Proof generation failed')) {
                setStatus('Proof generation failed. Please try again.');
            } else {
                setStatus('Submission failed.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="page-container">
                <div className="dossier-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✅</div>
                    <h2 className="heading-section">Confession live.</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Only you can ever prove you wrote this.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => { setStatus(''); setContent(''); }} className="btn-primary" style={{ flex: 1 }}>
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header stagger-enter stagger-1" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Confess Anonymously</h1>
                <p>No one will know it's you. Mathematically guaranteed.</p>
            </header>

            <div className="dossier-card stagger-enter stagger-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Textarea Area */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's your confession? Be honest. No one is watching... except the blockchain."
                        maxLength={280}
                        disabled={isGenerating}
                        className="vault-textarea"
                        style={{ minHeight: '160px' }}
                    />
                    <div className="text-label" style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        color: 'var(--text-muted)'
                    }}>
                        {content.length}/280
                    </div>
                </div>

                {/* Warning Banner */}
                <div style={{
                    padding: '1rem',
                    border: '1px solid var(--amber-glow)',
                    background: 'rgba(255, 191, 0, 0.05)',
                    borderRadius: '4px',
                    marginBottom: '1.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--amber-dim)',
                    lineHeight: 1.5
                }}>
                    ⚠️ <strong>Your identity secret lives only in this browser session.</strong><br />
                    If you refresh or close this tab, you cannot prove authorship later.
                    Make sure you want to submit before proceeding.
                </div>

                {/* Status indicator UI */}
                {isGenerating && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                    }}>
                        <div className="vault-spinner" style={{ margin: '0 auto 1rem' }} />
                        <p className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--purple-neon)' }}>
                            {status}
                        </p>
                        <div style={{
                            width: '100%',
                            height: '2px',
                            background: 'rgba(255,255,255,0.1)',
                            marginTop: '0.5rem',
                            borderRadius: '2px',
                            overflow: 'hidden'
                        }}>
                            <div className="progress-bar-indet" />
                        </div>
                    </div>
                )}

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={isGenerating || content.trim().length < 3}
                    className="btn-primary"
                    style={{ width: '100%', padding: '1.25rem' }}
                >
                    {isGenerating ? 'Sealing...' : 'Submit Anonymously'}
                </button>

                {/* Footer Error msg if needed */}
                {status && status !== 'SUCCESS' && !isGenerating && (
                    <p style={{ color: 'var(--sienna)', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
                        {status}
                    </p>
                )}
            </div>
        </div>
    );
};

