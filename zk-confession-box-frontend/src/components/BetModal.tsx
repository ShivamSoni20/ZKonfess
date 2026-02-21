import React, { useState } from 'react';

interface BetModalProps {
    confessionId: string;
    onClose: () => void;
    onConfirm: (isReal: boolean, amount: number) => void;
}

export const BetModal: React.FC<BetModalProps> = ({ confessionId, onClose, onConfirm }) => {
    const [isReal, setIsReal] = useState(true);
    const [amount, setAmount] = useState(1);

    return (
        <div className="vault-overlay" onClick={onClose}>
            <div className="vault-modal" onClick={(e) => e.stopPropagation()}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        Place Your Wager
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Stake XLM on whether Entry #{confessionId} is authentic or a fabrication.
                    </p>
                </div>

                {/* Toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setIsReal(true)}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase' as const,
                            padding: '0.75rem',
                            border: `1px solid ${isReal ? 'var(--teal)' : 'var(--vault-border)'}`,
                            borderRadius: '2px',
                            background: isReal ? 'var(--teal-dim)' : 'transparent',
                            color: isReal ? 'var(--teal)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Authentic
                    </button>
                    <button
                        onClick={() => setIsReal(false)}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase' as const,
                            padding: '0.75rem',
                            border: `1px solid ${!isReal ? 'var(--sienna)' : 'var(--vault-border)'}`,
                            borderRadius: '2px',
                            background: !isReal ? 'var(--sienna-dim)' : 'transparent',
                            color: !isReal ? 'var(--sienna)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Fabricated
                    </button>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: '2rem' }}>
                    <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Wager Amount (XLM)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="vault-input"
                            style={{ width: '100%', paddingRight: '3.5rem' }}
                        />
                        <span style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                        }}>
                            XLM
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(isReal, amount)}
                        className="btn-primary"
                        style={{ flex: 1 }}
                    >
                        Confirm Wager
                    </button>
                </div>
            </div>
        </div>
    );
};
