import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { UserProvider } from './contexts/UserContext';
import { Layout } from './components';
import { Home } from './pages/Home';
import { Comics } from './pages/Comics';
import { ComicDetails } from './pages/ComicDetails';
import { Memes } from './pages/Memes';
import { NFTs } from './pages/NFTs';

function App() {
  return (
    <UserProvider>
      <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/ton-community/tutorials/main/03-wallet/manifest.json">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="comics" element={<Comics />} />
              <Route path="comics/:id" element={<ComicDetails />} />
              <Route path="memes" element={<Memes />} />
              <Route path="nfts" element={<NFTs />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TonConnectUIProvider>
    </UserProvider>
  );
}

export default App;