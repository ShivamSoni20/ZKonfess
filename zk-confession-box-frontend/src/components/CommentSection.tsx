import React, { useState, useEffect } from 'react';
import { stellarService, Comment } from '../services/stellar';
import { useWallet } from '../hooks/useWallet';

interface CommentSectionProps {
    confessionId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ confessionId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { publicKey, getContractSigner } = useWallet();

    const loadComments = async () => {
        setIsLoading(true);
        try {
            const data = await stellarService.fetchComments(confessionId);
            setComments(data);
        } catch (e) {
            console.error('Failed to load comments:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [confessionId]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !publicKey) return;
        const signer = getContractSigner();
        setIsSubmitting(true);
        try {
            await stellarService.addComment({ publicKey, signer }, confessionId, newComment);
            setNewComment('');
            loadComments();
        } catch (e) {
            console.error('Failed to add comment:', e);
            alert('Failed to post comment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const timeAgo = (ts: number) => {
        if (ts === 0) return 'just now';
        const diff = Math.floor(Date.now() / 1000) - ts;
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--vault-border)', paddingTop: '1.25rem' }}>
            <h4 className="text-label" style={{ marginBottom: '1rem', color: 'var(--violet-bright)' }}>
                Analysis & Discussions
            </h4>

            {/* Comment list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {isLoading && comments.length === 0 ? (
                    <span className="text-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Decrypting logs...</span>
                ) : comments.length === 0 ? (
                    <span className="text-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>No intelligence reported.</span>
                ) : (
                    comments.map((c, i) => (
                        <div key={i} style={{
                            padding: '0.75rem',
                            background: 'rgba(139, 92, 246, 0.03)',
                            borderLeft: '2px solid var(--violet-dim)',
                            borderRadius: '0 2px 2px 0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <span className="text-mono" style={{ fontSize: '0.55rem', color: 'var(--violet-bright)' }}>
                                    {c.author.slice(0, 4)}...{c.author.slice(-4)}
                                </span>
                                <span className="text-hash" style={{ fontSize: '0.5rem' }}>{timeAgo(c.timestamp)}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                {c.text}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Input area */}
            {publicKey ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add to the dossier..."
                        className="vault-input"
                        style={{ flex: 1, fontSize: '0.75rem' }}
                        disabled={isSubmitting}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={isSubmitting || !newComment.trim()}
                        className="btn-teal"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        {isSubmitting ? '...' : 'Post'}
                    </button>
                </div>
            ) : (
                <p className="text-mono" style={{ fontSize: '0.55rem', color: 'var(--rose)', textAlign: 'center' }}>
                    Connect identity to contribute.
                </p>
            )}
        </div>
    );
};
