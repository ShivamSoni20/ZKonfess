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
  const { connect, isConnecting, error } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      onClose();
    } catch (err) {
      // Error is caught and stored in state by useWallet
    }
  };

  const isWrongNetwork = error === 'WRONG_NETWORK';
  const isNotInstalled = error === 'FREIGHTER_NOT_INSTALLED';

  return (
    <div className="vault-overlay" onClick={onClose}>
      <div className="vault-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Secure Connection
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Connect your Freighter wallet to interact with the ZK Confession Box.
          </p>
        </div>

        <div className="connect-modal-grid">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="connect-option"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '2rem 1rem'
            }}
          >
            <div className="wallet-icon-placeholder" style={{
              width: '40px',
              height: '40px',
              background: 'var(--amber-glow)',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.2rem'
            }}>
              ⚓
            </div>
            <span style={{ fontWeight: 600 }}>Connect Freighter</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Stellar Network Extension</span>
          </button>
        </div>

        {(isConnecting || isWrongNetwork) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            {isConnecting && <div className="vault-spinner" />}
            <span className="text-label">
              {isWrongNetwork ? '⚠️ Switch to Testnet' : 'Awaiting approval...'}
            </span>
          </div>
        )}

        {error && (
          <div className="warning-box" style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '0.7rem' }}>
            <strong>
              {isWrongNetwork ? 'Wrong Network:' : 'Status:'}
            </strong>
            {isNotInstalled
              ? ' Freighter wallet extension not detected.'
              : isWrongNetwork
                ? ' Freighter must be set to TESTNET.'
                : ` ${error}`}
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
  const { publicKey, isConnected, disconnect, error } = useWallet();

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="vault-atmosphere" />

      {/* Network Warning Banner */}
      {error === 'WRONG_NETWORK' && (
        <div style={{
          background: 'var(--amber-glow)',
          color: '#000',
          textAlign: 'center',
          padding: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.05em'
        }}>
          ⚠️ WRONG NETWORK: PLEASE SWITCH FREIGHTER TO TESTNET
        </div>
      )}

      {/* Navigation */}
      <nav className="vault-nav">
        <div className="vault-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <span className="vault-logo">🤫 ZK Confession Box</span>

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
              <div className="wallet-connected" style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid var(--purple-neon)',
                padding: '0.4rem 0.75rem',
                borderRadius: '999px',
                color: 'var(--purple-neon)'
              }}>
                <div className="wallet-dot" style={{ background: 'var(--purple-neon)' }} />
                <span className="wallet-address" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {publicKey?.slice(0, 4)}···{publicKey?.slice(-4)}
                </span>
                <button onClick={disconnect} className="wallet-disconnect" title="Disconnect" style={{ color: 'var(--purple-neon)' }}>
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
