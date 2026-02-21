import React, { useState } from 'react';
import { Confession, VoteType } from '../services/stellar';
import { ProofBadge } from './ProofBadge';
import { BetModal } from './BetModal';
import { CommentSection } from './CommentSection';

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

    const timeAgo = (ts: number) => {
        if (ts === 0) return 'just now';
        const diff = Math.floor(Date.now() / 1000) - ts;
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="dossier-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span className="text-label">Entry #{confession.id}</span>
                        <span className="text-hash">{timeAgo(confession.timestamp)}</span>
                    </div>
                    {confession.author && (
                        <span className="text-mono" style={{ fontSize: '0.6rem', color: 'var(--teal)' }}>
                            Revealed by {confession.author.slice(0, 6)}···{confession.author.slice(-4)}
                        </span>
                    )}
                </div>
                <ProofBadge />
            </div>

            {/* Confession body */}
            <div style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--vault-border)',
                borderRadius: '2px',
                marginBottom: '1.25rem',
            }}>
                <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                }}>
                    {confession.revealed
                        ? 'This confession has been proven authentic by its author.'
                        : 'Anonymous confession — sealed with a zero-knowledge proof.'}
                </p>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--vault-border)' }}>
                    <span className="text-hash">SHA256: {confession.contentHash.slice(0, 24)}…</span>
                </div>
            </div>

            {/* Vote buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button onClick={() => onVote(VoteType.Relatable)} className="btn-vote">
                    <span className="vote-emoji">🤝</span>
                    <span className="vote-label">{confession.votesRelatable} relatable</span>
                </button>
                <button onClick={() => onVote(VoteType.Shocking)} className="btn-vote">
                    <span className="vote-emoji">⚡</span>
                    <span className="vote-label">{confession.votesShocking} shocking</span>
                </button>
                <button onClick={() => onVote(VoteType.Fake)} className="btn-vote">
                    <span className="vote-emoji">🎭</span>
                    <span className="vote-label">{confession.votesFake} fabricated</span>
                </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => setShowBetModal(true)}
                    disabled={confession.revealed}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                >
                    {confession.revealed ? 'Bets Sealed' : 'Wager'}
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="btn-secondary"
                    style={{ flex: 1, borderStyle: showComments ? 'solid' : 'dashed' }}
                >
                    {showComments ? 'Close Intel' : 'Discussion'}
                </button>

                {isOwner && !confession.revealed && (
                    <button onClick={onReveal} className="btn-teal">
                        Reveal
                    </button>
                )}
            </div>

            {/* Comment Section Panel */}
            {showComments && <CommentSection confessionId={confession.id} />}

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
