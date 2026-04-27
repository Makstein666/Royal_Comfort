import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Ваши существующие импорты
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Tracking from './pages/Tracking';

import GiftNotification from './components/modals/GiftNotification'; 

// ... импорты
import { FontSizeProvider } from './context/FontSizeContext';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <FontSizeProvider>
        {/* Убрал style={{ fontSize... }}, он больше не нужен */}
        <div className="flex flex-col min-h-screen font-sans bg-[#FDFBF7] text-[#0A2A2A]">
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/tracking" element={<Tracking />} />
            </Routes>
          </main>

          <Footer />
          <GiftNotification />
          
        </div>
    </FontSizeProvider>
  );
}

export default App;