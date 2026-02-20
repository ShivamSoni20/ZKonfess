import React, { useEffect, useState } from 'react';
import { stellarService, Confession, VoteType } from '../services/stellar';
import { ConfessionCard } from '../components/ConfessionCard';
import { usePlayer } from '../context/PlayerContext';
import { useWallet } from '../hooks/useWallet';

export const Feed: React.FC = () => {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const { publicKey } = useWallet();
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
        try {
            await stellarService.vote({ publicKey }, id, type);
            // Optimistic update
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
        try {
            await stellarService.placeBet({ publicKey }, id, isReal, amount);
            alert('Bet placed successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to place bet.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">The Confession Box</h1>
                <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Anonymous truths. Zero knowledge.</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-mono text-xs">Fetching secrets from the ledger...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {confessions.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-3xl">
                            <p className="text-zinc-600 font-mono">Silence is golden. Be the first to speak.</p>
                        </div>
                    ) : (
                        confessions.map((c) => (
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
