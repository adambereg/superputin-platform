import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { UserProvider } from './contexts/UserContext';
import { Layout } from './components';
import { Home, Comics, ComicDetails, Memes, NFTs } from './pages';
import bridge from '@vkontakte/vk-bridge';

function App() {
  useEffect(() => {
    // Инициализируем VK Mini Apps
    bridge.send('VKWebAppInit');
  }, []);

  return (
    <UserProvider>
      <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/ton-community/tutorials/main/03-wallet/manifest.json">
        <BrowserRouter basename="/">
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