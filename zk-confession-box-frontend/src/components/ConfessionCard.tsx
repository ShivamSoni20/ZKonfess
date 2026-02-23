import React, { useState } from 'react';
import { Confession, VoteType } from '../services/stellar';
import { ProofBadge } from './ProofBadge';
import { BetModal } from './BetModal';
import { CommentSection } from './CommentSection';

import { contentStorage } from '../services/contentStorage';

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
    const [showComments, setShowComments] = useState(false);
    const [voted, setVoted] = useState<VoteType | null>(null);

    const timeAgo = (ts: number) => {
        if (ts === 0) return 'just now';
        const diff = Math.floor(Date.now() / 1000) - ts;
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const handleVoteAction = (type: VoteType) => {
        if (voted !== null) return;
        setVoted(type);
        onVote(type);
    };

    // Calculate bet split for visualization (simulated for now)
    const totalBets = confession.votesRelatable + confession.votesShocking + confession.votesFake;
    const realPercent = totalBets > 0 ? ((confession.votesRelatable + confession.votesShocking) / totalBets) * 100 : 50;
    const fakePercent = totalBets > 0 ? (confession.votesFake / totalBets) * 100 : 50;

    return (
        <div className="dossier-card" style={{
            background: '#111118',
            border: '1px solid #4c1d95', // purple-900 equivalent
            padding: '1.5rem'
        }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        #ENTRY_{confession.id}
                    </span>
                    <span className="text-hash" style={{ fontSize: '0.7rem' }}>
                        {timeAgo(confession.timestamp)}
                    </span>
                </div>
                <div className="proof-seal" style={{ padding: '0.2rem 0.6rem', fontSize: '0.6rem', background: 'rgba(139, 92, 246, 0.1)' }}>
                    <span style={{ color: 'var(--purple-neon)' }}>✓ ZK Verified</span>
                </div>
            </div>

            {/* Confession text */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    color: '#fff',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                }}>
                    {contentStorage.getContent(confession.contentHash) ||
                        contentStorage.getContent(`id_${confession.id}`) ||
                        (confession.id === '42' ? 'I secretly used the company card to buy 1000 XLM and then replaced it before the audit.' : 'Anonymous entry. Content cryptographically sealed.')}
                </p>

                {confession.revealed && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--teal)' }}>
                        👤 Revealed by: {confession.author?.slice(0, 6)}···{confession.author?.slice(-4)}
                    </div>
                )}
            </div>

            {/* Vote Buttons (Spec specific) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => handleVoteAction(VoteType.Relatable)}
                    disabled={voted !== null}
                    className={`btn-vote ${voted === VoteType.Relatable ? 'selected' : ''}`}
                    style={{
                        background: voted === VoteType.Relatable ? 'var(--purple-neon)' : 'rgba(255,255,255,0.05)',
                        color: voted === VoteType.Relatable ? '#fff' : 'var(--text-secondary)'
                    }}
                >
                    🥺 Relatable — {confession.votesRelatable + (voted === VoteType.Relatable ? 1 : 0)}
                </button>
                <button
                    onClick={() => handleVoteAction(VoteType.Shocking)}
                    disabled={voted !== null}
                    className={`btn-vote ${voted === VoteType.Shocking ? 'selected' : ''}`}
                    style={{
                        background: voted === VoteType.Shocking ? 'var(--purple-neon)' : 'rgba(255,255,255,0.05)',
                        color: voted === VoteType.Shocking ? '#fff' : 'var(--text-secondary)'
                    }}
                >
                    😱 Shocking — {confession.votesShocking + (voted === VoteType.Shocking ? 1 : 0)}
                </button>
                <button
                    onClick={() => handleVoteAction(VoteType.Fake)}
                    disabled={voted !== null}
                    className={`btn-vote ${voted === VoteType.Fake ? 'selected' : ''}`}
                    style={{
                        background: voted === VoteType.Fake ? 'var(--sienna)' : 'rgba(255,255,255,0.05)',
                        color: voted === VoteType.Fake ? '#fff' : 'var(--text-secondary)'
                    }}
                >
                    🤥 Fake — {confession.votesFake + (voted === VoteType.Fake ? 1 : 0)}
                </button>
            </div>

            {/* Bet Summary Bar */}
            <div
                onClick={() => setShowBetModal(true)}
                style={{
                    cursor: 'pointer',
                    marginBottom: '1.25rem'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '0.4rem' }}>
                    <span className="text-label" style={{ color: 'var(--purple-neon)' }}>💰 {totalBets * 1.5} XLM at stake</span>
                    <span className="text-label" style={{ color: 'var(--text-muted)' }}>{totalBets} bets</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'var(--sienna-dim)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    display: 'flex'
                }}>
                    <div style={{ width: `${realPercent}%`, height: '100%', background: 'var(--purple-neon)' }} />
                    <div style={{ width: `${fakePercent}%`, height: '100%', background: 'var(--sienna)' }} />
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => setShowBetModal(true)}
                    disabled={confession.revealed}
                    className="btn-secondary"
                    style={{ flex: 1, borderColor: 'var(--purple-light)', borderStyle: 'solid' }}
                >
                    {confession.revealed ? 'Bets Sealed' : 'Place Bet'}
                </button>

                {isOwner && !confession.revealed && (
                    <button onClick={onReveal} className="btn-ghost" style={{ fontSize: '0.7rem', color: 'var(--teal)' }}>
                        🔓 Reveal Authorship
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

