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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-zinc-100 mb-2">Place Your Bet</h2>
                <p className="text-sm text-zinc-500 mb-6">Bet XLM on whether this confession is actual truth or a fabrication.</p>

                <div className="flex bg-zinc-900 rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setIsReal(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isReal ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        REAL
                    </button>
                    <button
                        onClick={() => setIsReal(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isReal ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        FAKE
                    </button>
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">Amount (XLM)</label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all font-mono"
                        />
                        <span className="absolute right-4 top-3.5 text-zinc-500 font-bold">XLM</span>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(isReal, amount)}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
                    >
                        Confirm Bet
                    </button>
                </div>
            </div>
        </div>
    );
};
