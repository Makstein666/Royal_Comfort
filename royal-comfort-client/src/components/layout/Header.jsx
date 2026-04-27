import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Truck, Phone, Type } from 'lucide-react'; // Добавил иконку Type (Буква А)
import { motion, AnimatePresence } from 'framer-motion';

import ContactModal from '../modals/ContactModal'; 
import Logo from './Logo';
import { useConfigurator } from '../../context/ConfiguratorContext';
import { useFontSize } from '../../context/FontSizeContext'; // 1. Импортируем контекст

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 2. Достаем функцию переключения и текущий масштаб
  const { toggleFontSize, fontScale } = useFontSize(); 
  
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { products, categories } = useConfigurator();

  const isHomePage = location.pathname === '/';
  const isTop = !isScrolled;
  const shouldBeTransparent = isHomePage && isTop;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const lowerQuery = query.toLowerCase();
      
      const foundCats = categories
          .filter(c => c.name.toLowerCase().includes(lowerQuery))
          .map(c => ({ type: 'category', ...c }));
      
      const foundProds = products
          .filter(p => p.name.toLowerCase().includes(lowerQuery))
          .map(p => ({ type: 'product', ...p }));
      
      setSearchResults([...foundCats, ...foundProds].slice(0, 6));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleGoToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleResultClick = (item) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (item.type === 'category') {
      navigate(`/catalog?categories=${item.id}`);
    } else {
      navigate(`/catalog?search=${item.name}`);
    }
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const handleSubmitSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          navigate(`/catalog?search=${searchQuery}`);
          setShowDropdown(false);
          setIsMobileMenuOpen(false);
      }
  };

  return (
    <>
    <header 
        className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 border-b border-transparent
            ${shouldBeTransparent 
                ? 'bg-[#0A2A2A] shadow-xl py-3 md:bg-transparent md:shadow-none md:py-6' 
                : 'bg-[#0A2A2A] shadow-xl py-3'
            }
        `}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4 relative">
        
        {/* 1. ЛОГОТИП */}
        <div 
            onClick={handleGoToHome}
            className="cursor-pointer group relative z-[1000] hover:opacity-90 transition-opacity"
        >
            <Logo />
        </div>

        {/* 2. ПОИСК (Десктоп) */}
        <div className="hidden md:block flex-1 max-w-xl mx-8 relative z-[900]" ref={searchRef}>
            <form onSubmit={handleSubmitSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Найти проект..." 
                    className={`w-full py-2.5 pl-10 pr-4 rounded-xl text-sm transition-all outline-none border ${
                        !shouldBeTransparent
                            ? 'bg-[#152525] border-gray-700 text-white placeholder-gray-400 focus:border-[#B88E2F]' 
                            : 'bg-white/10 border-white/20 text-white placeholder-gray-200 focus:bg-[#0A2A2A]'
                    }`}
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B88E2F]" size={18} />
            </form>

            <AnimatePresence>
            {showDropdown && searchResults.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-[1001]"
                >
                    {searchResults.map((item) => (
                        <div 
                            key={item.id + item.name}
                            onMouseDown={() => handleResultClick(item)}
                            className="flex items-center gap-3 p-3 hover:bg-[#FDFBF7] cursor-pointer border-b border-gray-100 transition-colors last:border-0"
                        >
                            <div className="w-10 h-10 rounded-lg bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}></div>
                            <div>
                                <p className="text-[#0A2A2A] font-bold text-sm">{item.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{item.type === 'category' ? 'Категория' : 'Товар'}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* 3. МЕНЮ (Десктоп) */}
        <nav className="hidden lg:flex items-center gap-6 relative z-[1000]">
          <span onClick={handleGoToHome} className="text-sm font-medium text-white hover:text-[#B88E2F] cursor-pointer uppercase tracking-wider transition-colors">Главная</span>
          <span onClick={() => navigate('/catalog')} className="text-sm font-medium text-white hover:text-[#B88E2F] cursor-pointer uppercase tracking-wider transition-colors">Каталог</span>
          <span onClick={() => navigate('/tracking')} className="flex items-center gap-2 text-sm font-medium text-white hover:text-[#B88E2F] cursor-pointer uppercase tracking-wider transition-colors">
             <Truck size={18} className="text-[#B88E2F]" /> Статус
          </span>
          
          {/* === КНОПКА ШРИФТА (Десктоп) === */}
          <button 
             onClick={toggleFontSize}
             className="flex items-center gap-1 text-white hover:text-[#B88E2F] transition-colors border border-white/20 rounded px-2 py-1"
             title="Изменить размер шрифта"
          >
             <Type size={18} />
             <span className="text-xs font-bold w-8 text-center">
                {fontScale === 1 ? '100%' : fontScale === 1.1 ? '110%' : '125%'}
             </span>
          </button>

          <button 
             onClick={() => setIsContactModalOpen(true)}
             className="flex items-center gap-2 bg-[#B88E2F] text-[#0A2A2A] px-5 py-2 rounded-full font-bold text-sm hover:bg-white transition-all shadow-lg active:scale-95 hover:shadow-xl"
          >
             <Phone size={16} /> Связаться
          </button>
        </nav>

        {/* 4. КНОПКА МОБИЛЬНОГО МЕНЮ */}
        <div className="lg:hidden flex items-center gap-3 z-[1000]">
           {/* Кнопка шрифта для мобилок (вынес наружу, чтобы была под рукой) */}
           <button 
             onClick={toggleFontSize}
             className="p-2.5 rounded-xl bg-white/10 text-white border border-white/20 active:scale-95 transition-transform"
           >
             <Type size={20} />
           </button>

            <button 
                className="p-2.5 rounded-xl bg-[#B88E2F] text-[#0A2A2A] shadow-lg active:scale-95 transition-transform" 
                onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>
        </div>

        {/* 5. МОБИЛЬНОЕ МЕНЮ */}
        <AnimatePresence>
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[1100] lg:hidden">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                
                <motion.div 
                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-0 right-0 h-full w-[85%] max-w-[340px] bg-[#0A2A2A] shadow-2xl p-6 flex flex-col border-l border-[#B88E2F]"
                >
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-[#B88E2F] font-bold text-xs uppercase tracking-widest">Меню</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-[#B88E2F]"><X size={28}/></button>
                    </div>

                    {/* Поиск (Мобильный) */}
                    <div className="mb-8 relative">
                        <input 
                            type="text" placeholder="Поиск..." 
                            className="w-full bg-[#152525] text-white p-3 pl-10 rounded-xl border border-[#B88E2F]/30 focus:border-[#B88E2F] outline-none placeholder:text-gray-500"
                            value={searchQuery}
                            onChange={handleSearchInput}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        
                        {searchResults.length > 0 && searchQuery && (
                            <div className="mt-2 bg-white rounded-xl overflow-hidden shadow-lg">
                                {searchResults.slice(0,3).map(item => (
                                    <div key={item.id} onMouseDown={() => handleResultClick(item)} className="p-3 border-b border-gray-200 text-[#0A2A2A] text-sm font-bold flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-200 rounded bg-cover" style={{backgroundImage: `url(${item.image})`}}></div>
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6 text-xl font-serif font-bold text-white">
                        <span onClick={handleGoToHome} className="cursor-pointer border-b border-white/5 pb-2 hover:text-[#B88E2F] transition-colors">Главная</span>
                        <span onClick={() => { navigate('/catalog'); setIsMobileMenuOpen(false); }} className="cursor-pointer border-b border-white/5 pb-2 hover:text-[#B88E2F] transition-colors">Каталог</span>
                        <span onClick={() => { navigate('/tracking'); setIsMobileMenuOpen(false); }} className="cursor-pointer border-b border-white/5 pb-2 hover:text-[#B88E2F] transition-colors flex items-center gap-2">
                            <Truck size={20} className="text-[#B88E2F]"/> Статус заказа
                        </span>
                    </div>

                    {/* Блок с кнопками внизу мобильного меню */}
                    <div className="mt-auto flex flex-col gap-3">
                        {/* Дублируем кнопку шрифта внутри меню для удобства */}
                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                            <span className="text-sm text-gray-400">Размер шрифта:</span>
                            <button 
                                onClick={toggleFontSize}
                                className="flex items-center gap-2 text-white font-bold"
                            >
                                <Type size={18} />
                                {fontScale === 1 ? '100%' : fontScale === 1.1 ? '110%' : '125%'}
                            </button>
                        </div>

                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); setIsContactModalOpen(true); }}
                            className="w-full py-4 bg-[#B88E2F] text-[#0A2A2A] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                            <Phone size={20}/>
                            Заказать звонок
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>
      </div>
    </header>
    
    <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </>
  );
};

export default Header;