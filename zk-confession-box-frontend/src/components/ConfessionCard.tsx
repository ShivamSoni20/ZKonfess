import React, { useState } from 'react';
import { Confession, VoteType } from '../services/stellar';
import { ProofBadge } from './ProofBadge';
import { BetModal } from './BetModal';

interface ConfessionCardProps {
    confession: Confession;
    onVote: (type: VoteType) => void;
    onBet: (isReal: boolean, amount: number) => void;
    onReveal?: () => void;
    isOwner?: boolean;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({
    confession,
    onVote,
    onBet,
    onReveal,
    isOwner,
}) => {
    const [showBetModal, setShowBetModal] = useState(false);

    return (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-sm hover:border-zinc-800 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-mono text-zinc-600 mb-1">
                        #{confession.id} • {new Date(confession.timestamp * 1000).toLocaleDateString()}
                    </span>
                    {confession.author && (
                        <span className="text-[10px] text-purple-400 font-mono">
                            Revealed by: {confession.author.slice(0, 6)}...{confession.author.slice(-4)}
                        </span>
                    )}
                </div>
                <ProofBadge />
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-5 mb-6 border border-zinc-800/50">
                <p className="font-mono text-zinc-300 leading-relaxed break-words italic">
                    "{confession.revealed ? 'This confession was proven authentic.' : 'Anonymous Confession Submitted Sealed with ZK Proof'}"
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-800/30 flex space-x-2">
                    <span className="text-[10px] text-zinc-500 font-mono">HASH: {confession.contentHash.slice(0, 16)}...</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                    onClick={() => onVote(VoteType.Relatable)}
                    className="flex flex-col items-center py-2 px-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all group"
                >
                    <span className="text-xl mb-1 group-active:scale-125 transition-transform">🥺</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{confession.votesRelatable} relatable</span>
                </button>
                <button
                    onClick={() => onVote(VoteType.Shocking)}
                    className="flex flex-col items-center py-2 px-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all group"
                >
                    <span className="text-xl mb-1 group-active:scale-125 transition-transform">😱</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{confession.votesShocking} shocking</span>
                </button>
                <button
                    onClick={() => onVote(VoteType.Fake)}
                    className="flex flex-col items-center py-2 px-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all group"
                >
                    <span className="text-xl mb-1 group-active:scale-125 transition-transform">🤥</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{confession.votesFake} fake</span>
                </button>
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => setShowBetModal(true)}
                    className="flex-1 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl transition-all active:scale-95"
                    disabled={confession.revealed}
                >
                    {confession.revealed ? 'BETS CLOSED' : 'BET ON THIS'}
                </button>

                {isOwner && !confession.revealed && (
                    <button
                        onClick={onReveal}
                        className="px-4 py-3 bg-purple-900/30 border border-purple-500/50 hover:bg-purple-900/50 text-purple-300 font-bold text-xs rounded-xl transition-all"
                    >
                        REVEAL
                    </button>
                )}
            </div>

            {showBetModal && (
                <BetModal
                    confessionId={confession.id}
                    onClose={() => setShowBetModal(false)}
                    onConfirm={(isReal, amount) => {
                        onBet(isReal, amount);
                        setShowBetModal(false);
                    }}
                />
            )}
        </div>
    );
};
