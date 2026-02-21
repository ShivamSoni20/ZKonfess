import React, { useEffect, useState } from 'react';
import { stellarService, Confession, VoteType } from '../services/stellar';
import { zkService } from '../services/zk';
import { ConfessionCard } from '../components/ConfessionCard';
import { usePlayer } from '../context/PlayerContext';
import { useWallet } from '../hooks/useWallet';

export const MyConfessions: React.FC = () => {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const { myConfessions, playerSecret } = usePlayer();
    const { publicKey, getContractSigner } = useWallet();

    const loadMyConfessions = async () => {
        setLoading(true);
        try {
            const all = await stellarService.fetchConfessions(100, 0);
            setConfessions(all.filter(c => myConfessions.includes(c.id)));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyConfessions();
    }, [myConfessions]);

    const handleReveal = async (c: Confession) => {
        if (!playerSecret) return alert('Session secret lost. Refresh happened?');
        if (!publicKey) return alert('Connect wallet');
        const signer = getContractSigner();

        const confirmed = confirm(
            'Are you sure you want to reveal authorship? This will settle all bets and link your wallet to this confession hash on-chain.'
        );
        if (!confirmed) return;

        try {
            const { proof } = await zkService.generateRevealProof(
                playerSecret,
                c.contentHash,
                c.commitment
            );

            await stellarService.revealAuthorship({ publicKey, signer }, c.id, proof);
            alert('Authorship revealed! Bets are being settled.');
            loadMyConfessions();
        } catch (e) {
            console.error(e);
            alert('Reveal failed. Check console.');
        }
    };

    return (
        <div className="page-container">
            <header className="page-header stagger-enter stagger-1">
                <h1>Your Dossier</h1>
                <p>Secrets you carry · sealed by your hand</p>
            </header>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: '1rem' }}>
                    <div className="vault-spinner" />
                    <span className="text-label">Scanning your records...</span>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {confessions.length === 0 ? (
                        <div className="empty-state stagger-enter stagger-2">
                            <p>"Your dossier is empty.<br />Seal your first confession to begin."</p>
                        </div>
                    ) : (
                        confessions.map((c, i) => (
                            <div key={c.id} className={`stagger-enter stagger-${Math.min(i + 2, 8)}`}>
                                <ConfessionCard
                                    confession={c}
                                    onVote={async (type) => {
                                        if (!publicKey) return alert('Please connect wallet');
                                        try {
                                            await stellarService.vote({ publicKey, signer: getContractSigner() }, c.id, type);
                                            setConfessions(prev => prev.map(conf =>
                                                conf.id === c.id ? {
                                                    ...conf,
                                                    votesRelatable: type === VoteType.Relatable ? conf.votesRelatable + 1 : conf.votesRelatable,
                                                    votesShocking: type === VoteType.Shocking ? conf.votesShocking + 1 : conf.votesShocking,
                                                    votesFake: type === VoteType.Fake ? conf.votesFake + 1 : conf.votesFake,
                                                } : conf
                                            ));
                                        } catch (e) {
                                            console.error(e);
                                            alert('Failed to vote. Maybe you already voted?');
                                        }
                                    }}
                                    onBet={async (isReal, amount) => {
                                        if (!publicKey) return alert('Please connect wallet');
                                        try {
                                            await stellarService.placeBet({ publicKey, signer: getContractSigner() }, c.id, isReal, amount);
                                            alert('Bet placed successfully!');
                                        } catch (e) {
                                            console.error(e);
                                            alert('Failed to place bet.');
                                        }
                                    }}
                                    onReveal={() => handleReveal(c)}
                                    isOwner={true}
                                />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
