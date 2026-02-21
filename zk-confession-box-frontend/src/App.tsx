import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { Feed } from './pages/Feed';
import { Submit } from './pages/Submit';
import { MyConfessions } from './pages/MyConfessions';
import { useWallet } from './hooks/useWallet';

type Tab = 'feed' | 'submit' | 'my-confessions';

const TAB_LABELS: Record<Tab, string> = {
  feed: 'The Feed',
  submit: 'Confess',
  'my-confessions': 'My Dossier',
};

function ConnectModal({ onClose }: { onClose: () => void }) {
  const { connectDev, isConnecting, isDevPlayerAvailable } = useWallet();

  const handleConnect = async (player: 1 | 2) => {
    try {
      await connectDev(player);
      onClose();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  return (
    <div className="vault-overlay" onClick={onClose}>
      <div className="vault-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Enter The Vault
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Choose an identity to connect with. Dev wallets are pre-funded on the Stellar Testnet.
          </p>
        </div>

        <div className="connect-modal-grid">
          <button
            onClick={() => handleConnect(1)}
            disabled={isConnecting || !isDevPlayerAvailable(1)}
            className="connect-option"
          >
            <span>Player 1 — Testnet Wallet</span>
            <span className="option-badge">Dev</span>
          </button>
          <button
            onClick={() => handleConnect(2)}
            disabled={isConnecting || !isDevPlayerAvailable(2)}
            className="connect-option"
          >
            <span>Player 2 — Testnet Wallet</span>
            <span className="option-badge">Dev</span>
          </button>
        </div>

        {isConnecting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            <div className="vault-spinner" />
            <span className="text-label">Authenticating...</span>
          </div>
        )}

        <div className="divider" />

        <button onClick={onClose} className="btn-secondary" style={{ width: '100%' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showConnect, setShowConnect] = useState(false);
  const { publicKey, isConnected, disconnect, walletId } = useWallet();

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="vault-atmosphere" />

      {/* Navigation */}
      <nav className="vault-nav">
        <div className="vault-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <span className="vault-logo">The Vault</span>

            <div className="vault-tabs desktop-tabs">
              {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`vault-tab ${activeTab === tab ? 'active' : ''}`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
          </div>

          <div>
            {isConnected ? (
              <div className="wallet-connected">
                <div className="wallet-dot" />
                <span className="wallet-address">
                  {publicKey?.slice(0, 4)}···{publicKey?.slice(-4)}
                </span>
                <button onClick={disconnect} className="wallet-disconnect" title="Disconnect">
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={() => setShowConnect(true)} className="wallet-btn">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === 'feed' && <Feed />}
        {activeTab === 'submit' && <Submit />}
        {activeTab === 'my-confessions' && <MyConfessions />}
      </main>

      {/* Mobile Nav */}
      <div className="mobile-nav">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`vault-tab ${activeTab === tab ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Connect Modal */}
      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
