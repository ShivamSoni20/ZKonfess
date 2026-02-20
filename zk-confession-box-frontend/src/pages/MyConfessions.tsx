import React, { useEffect, useState } from 'react';
import { stellarService, Confession } from '../services/stellar';
import { zkService } from '../services/zk';
import { ConfessionCard } from '../components/ConfessionCard';
import { usePlayer } from '../context/PlayerContext';
import { useWallet } from '../hooks/useWallet';

export const MyConfessions: React.FC = () => {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const { myConfessions, playerSecret } = usePlayer();
    const { publicKey } = useWallet();

    const loadMyConfessions = async () => {
        setLoading(true);
        try {
            // For this MVP, we fetch all and filter by IDs in session
            // In production, we'd have an on-chain indexing or local index
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

        const confirmed = confirm('Are you sure you want to reveal authorship? This will settle all bets and link your wallet to this confession hash on-chain.');
        if (!confirmed) return;

        try {
            // 1. Generate Reveal Proof
            const { proof } = await zkService.generateRevealProof(
                playerSecret,
                c.contentHash,
                c.commitment
            );

            // 2. Submit to contract
            await stellarService.revealAuthorship({ publicKey }, c.id, proof);

            alert('Authorship revealed! Bets are being settled.');
            loadMyConfessions();
        } catch (e) {
            console.error(e);
            alert('Reveal failed. Check console.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-2">My Activity</h1>
                <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Secrets you possess.</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {confessions.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-3xl">
                            <p className="text-zinc-600 font-mono">You haven't shared any secrets yet.</p>
                        </div>
                    ) : (
                        confessions.map((c) => (
                            <ConfessionCard
                                key={c.id}
                                confession={c}
                                onVote={() => { }}
                                onBet={() => { }}
                                onReveal={() => handleReveal(c)}
                                isOwner={true}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
