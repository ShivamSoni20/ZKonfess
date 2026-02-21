import React, { useEffect, useState } from 'react';
import { stellarService, Confession, VoteType } from '../services/stellar';
import { ConfessionCard } from '../components/ConfessionCard';
import { usePlayer } from '../context/PlayerContext';
import { useWallet } from '../hooks/useWallet';

export const Feed: React.FC = () => {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const { publicKey, getContractSigner } = useWallet();
    const { myConfessions } = usePlayer();

    const loadConfessions = async () => {
        setLoading(true);
        try {
            const data = await stellarService.fetchConfessions(20, 0);
            setConfessions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfessions();
    }, []);

    const handleVote = async (id: string, type: VoteType) => {
        if (!publicKey) return alert('Please connect wallet');
        const signer = getContractSigner();
        try {
            await stellarService.vote({ publicKey, signer }, id, type);
            setConfessions(prev => prev.map(c =>
                c.id === id ? {
                    ...c,
                    votesRelatable: type === VoteType.Relatable ? c.votesRelatable + 1 : c.votesRelatable,
                    votesShocking: type === VoteType.Shocking ? c.votesShocking + 1 : c.votesShocking,
                    votesFake: type === VoteType.Fake ? c.votesFake + 1 : c.votesFake,
                } : c
            ));
        } catch (e) {
            console.error(e);
            alert('Failed to vote. Maybe you already voted?');
        }
    };

    const handleBet = async (id: string, isReal: boolean, amount: number) => {
        if (!publicKey) return alert('Please connect wallet');
        const signer = getContractSigner();
        try {
            await stellarService.placeBet({ publicKey, signer }, id, isReal, amount);
            alert('Bet placed successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to place bet.');
        }
    };

    return (
        <div className="page-container">
            <header className="page-header stagger-enter stagger-1">
                <h1>The Confession Box</h1>
                <p>Anonymous truths · sealed with zero knowledge</p>
            </header>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: '1rem' }}>
                    <div className="vault-spinner" />
                    <span className="text-label">Retrieving sealed confessions...</span>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {confessions.length === 0 ? (
                        <div className="empty-state stagger-enter stagger-2">
                            <p>"In the silence before the first confession,<br />even the walls hold their breath."</p>
                        </div>
                    ) : (
                        confessions.map((c, i) => (
                            <div key={c.id} className={`stagger-enter stagger-${Math.min(i + 2, 8)}`}>
                                <ConfessionCard
                                    confession={c}
                                    onVote={(type) => handleVote(c.id, type)}
                                    onBet={(isReal, amount) => handleBet(c.id, isReal, amount)}
                                    isOwner={myConfessions.includes(c.id)}
                                />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
