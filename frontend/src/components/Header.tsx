import React from 'react';
import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';

export const Header = () => {
  return (
    <header className="bg-background shadow">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            SuperPutin
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/comics" className="text-text hover:text-primary">
              Comics
            </Link>
            <Link to="/memes" className="text-text hover:text-primary">
              Memes
            </Link>
            <Link to="/nfts" className="text-text hover:text-primary">
              NFTs
            </Link>
            <WalletConnect />
          </div>
        </nav>
      </div>
    </header>
  );
}; 