import React from 'react';

export const ProofBadge: React.FC = () => {
    return (
        <div className="flex items-center space-x-1 px-2 py-0.5 bg-purple-900/40 border border-purple-500/50 rounded-full group cursor-help transition-all hover:bg-purple-900/60">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                ✓ ZK Verified
            </span>
            <div className="hidden group-hover:block absolute translate-y-8 bg-zinc-900 border border-zinc-800 p-2 rounded text-[11px] text-zinc-400 w-48 shadow-2xl z-50">
                This confession's anonymity and integrity is mathematically guaranteed via non-interactive zero-knowledge proofs.
            </div>
        </div>
    );
};
