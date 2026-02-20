import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { Feed } from './pages/Feed';
import { Submit } from './pages/Submit';
import { MyConfessions } from './pages/MyConfessions';
import { useWallet } from './hooks/useWallet';

type Tab = 'feed' | 'submit' | 'my-confessions';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const { publicKey, isConnected, connect } = useWallet();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                CONFESS.ZK
              </span>

              <div className="hidden md:flex space-x-1">
                {(['feed', 'submit', 'my-confessions'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                        ? 'bg-zinc-900 text-white shadow-inner'
                        : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-purple-900/20"
                >
                  CONNECT WALLET
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-24">
        {activeTab === 'feed' && <Feed />}
        {activeTab === 'submit' && <Submit />}
        {activeTab === 'my-confessions' && <MyConfessions />}
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f] border-t border-zinc-900 p-2 flex justify-around items-center z-50">
        {(['feed', 'submit', 'my-confessions'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === tab ? 'text-purple-500' : 'text-zinc-600'
              }`}
          >
            <span className="text-xs font-bold uppercase tracking-tighter mt-1">{tab.split('-')[0]}</span>
          </button>
        ))}
      </div>
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
