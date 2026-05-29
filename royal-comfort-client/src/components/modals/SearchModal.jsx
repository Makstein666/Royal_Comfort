import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfigurator } from '../../../context/ConfiguratorContext';

const SearchModal = ({ isOpen, onClose }) => {
  const { products } = useConfigurator();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Логика поиска
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    if (!products) {
      setResults([]);
      return;
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(query.toLowerCase()))
    );
    setResults(filtered);
  }, [query, products]);

  // Очистка при закрытии
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center pt-24 px-4">
          
          {/* Затемнение фона (Blur эффект) */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-royal-900/90 backdrop-blur-md"
          />

          {/* Контент поиска */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="relative w-full max-w-3xl z-10"
          >
            {/* Поле ввода */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 w-6 h-6" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Что вы ищете? (например: тандыр, чан...)" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white/10 border-2 border-white/10 text-white text-2xl font-serif placeholder-gray-500 rounded-2xl py-6 pl-16 pr-14 focus:outline-none focus:border-gold-500 focus:bg-white/5 transition-all shadow-2xl"
                />
                <button 
                  onClick={onClose}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={28} />
                </button>
            </div>

            {/* Результаты */}
            {query && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-white rounded-2xl overflow-hidden shadow-2xl"
              >
                {results.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto">
                    <div className="p-3 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      Найдено товаров: {results.length}
                    </div>
                    {results.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/catalog?search=${product.name}`} // Или ссылка на страницу товара
                        onClick={onClose}
                        className="flex items-center gap-4 p-4 hover:bg-gold-50 transition-colors border-b border-gray-100 last:border-0 group"
                      >
                        {/* Миниатюра */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg bg-cover bg-center flex-shrink-0 border border-gray-200" style={{ backgroundImage: `url(${product.image})` }} />
                        
                        {/* Инфо */}
                        <div className="flex-grow">
                            <h4 className="font-serif font-bold text-royal-900 group-hover:text-gold-600 transition-colors text-lg">
                                {product.name}
                            </h4>
                            <span className="text-xs text-gray-400 uppercase tracking-wide">{product.categoryName || 'Проект'}</span>
                        </div>

                        {/* Цена и стрелка */}
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-royal-900 text-lg whitespace-nowrap">
                                {product.price.toLocaleString()} ₽
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-gold-500 group-hover:text-white group-hover:border-gold-500 transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3 text-gray-400">
                        <Search size={32} />
                    </div>
                    <p className="text-lg">По запросу "<span className="text-royal-900 font-bold">{query}</span>" ничего не найдено.</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;