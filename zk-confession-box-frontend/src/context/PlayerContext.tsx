import React, { createContext, useContext, useState, useEffect } from 'react';
import { zkService } from '../services/zk';
import { stellarService } from '../services/stellar';

interface PlayerContextType {
    playerSecret: string | null;
    isRegistered: boolean;
    myConfessions: string[];
    isLoading: boolean;
    registerIfNeeded: (wallet: any) => Promise<void>;
    addConfession: (id: string) => void;
    resetPlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [playerSecret, setPlayerSecret] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [myConfessions, setMyConfessions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load myConfessions from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem('my_confessions');
        if (saved) {
            setMyConfessions(JSON.parse(saved));
        }
    }, []);

    const addConfession = (id: string) => {
        const updated = [...myConfessions, id];
        setMyConfessions(updated);
        sessionStorage.setItem('my_confessions', JSON.stringify(updated));
    };

    const resetPlayer = () => {
        setPlayerSecret(null);
        setIsRegistered(false);
        // We don't necessarily clear myConfessions because they might want to see them across wallet switches 
        // but without the secret they can't reveal. For strictly session based:
        // setMyConfessions([]);
    };

    const registerIfNeeded = async (wallet: any) => {
        if (!wallet?.publicKey || isRegistered) return;

        setIsLoading(true);
        try {
            // 1. Generate or get secret
            let secret = playerSecret;
            if (!secret) {
                secret = zkService.generatePlayerSecret();
                setPlayerSecret(secret);
            }

            // 2. Generate identity commitment
            const commitment = await zkService.generateIdentityCommitment(secret);

            // 3. Register on-chain
            await stellarService.registerPlayer(wallet, commitment);
            setIsRegistered(true);
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PlayerContext.Provider value={{
            playerSecret,
            isRegistered,
            myConfessions,
            isLoading,
            registerIfNeeded,
            addConfession,
            resetPlayer
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
    return context;
};
