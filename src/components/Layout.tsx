import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, Sun, Moon, Wallet } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';

export function Layout() {
  const [isDark, setIsDark] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [tonConnectUI] = useTonConnectUI();

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-text/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-poppins font-bold text-2xl text-primary">
              SuperPutin
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/comics" className="hover:text-primary transition-colors">Comics</Link>
              <Link to="/memes" className="hover:text-primary transition-colors">Memes</Link>
              <Link to="/nfts" className="hover:text-primary transition-colors">NFTs</Link>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 hover:bg-text/5 rounded-full"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => tonConnectUI.connectWallet()}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Wallet size={20} />
                Connect Wallet
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-text/5 rounded-full"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-text/10 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-text/60">
          <p>&copy; 2024 SuperPutin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}