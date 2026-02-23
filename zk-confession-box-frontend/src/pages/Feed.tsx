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

    const [sortBy, setSortBy] = useState<'recent' | 'trending'>('recent');

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


    const sortedConfessions = [...confessions].sort((a, b) => {
        if (sortBy === 'trending') {
            const votesA = a.votesRelatable + a.votesShocking + a.votesFake;
            const votesB = b.votesRelatable + b.votesShocking + b.votesFake;
            return votesB - votesA;
        }
        return b.timestamp - a.timestamp;
    });

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="page-container">
            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Today's Confessions</h1>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {currentDate} · {confessions.length} entries
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setSortBy('trending')}
                            className={`btn-secondary ${sortBy === 'trending' ? 'active' : ''}`}
                            style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', background: sortBy === 'trending' ? 'var(--purple-neon)' : '' }}
                        >
                            🔥 Trending
                        </button>
                        <button
                            onClick={() => setSortBy('recent')}
                            className={`btn-secondary ${sortBy === 'recent' ? 'active' : ''}`}
                            style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', background: sortBy === 'recent' ? 'var(--purple-neon)' : '' }}
                        >
                            🕐 Recent
                        </button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton-card" style={{ height: '240px' }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {sortedConfessions.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                                No confessions yet today. Be the first to confess. 🤫
                            </p>
                            <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('nav-submit')); }} className="btn-primary">
                                Submit a Confession
                            </a>
                        </div>
                    ) : (
                        sortedConfessions.map((c, i) => (
                            <ConfessionCard
                                key={c.id}
                                confession={c}
                                onVote={(type) => handleVote(c.id, type)}
                                onBet={(isReal, amount) => handleBet(c.id, isReal, amount)}
                                isOwner={myConfessions.includes(c.id)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

