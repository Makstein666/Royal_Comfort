import React from "react";
import { Check, Search, Filter, X } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
// 1. ИМПОРТИРУЕМ РЕАЛЬНЫЕ КАТЕГОРИИ ИЗ MOCKDATA
import { categoriesList } from "../../data/mockData";

const SidebarFilters = ({ filters, setFilters, onReset, isOpen, onClose }) => {
  
  // Компонент чекбокса
  const CheckboxItem = ({ id, label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
      <div className={`
        relative flex items-center justify-center w-5 h-5 rounded 
        border transition-all duration-200 flex-shrink-0
        ${checked ? 'bg-gold-500 border-gold-500' : 'bg-transparent border-royal-600 group-hover:border-gold-500'}
      `}>
        {checked && <Check size={12} className="text-royal-950" strokeWidth={4} />}
        <input 
            type="checkbox" 
            className="hidden" 
            checked={checked} 
            onChange={() => onChange(id)} 
        />
      </div>
      <span className={`text-sm font-medium transition-colors ${checked ? 'text-gold-400' : 'text-gray-300 group-hover:text-white'}`}>
        {label}
      </span>
    </label>
  );

  const handleCategoryChange = (catId) => {
     const newCats = filters.categories.includes(catId) 
        ? filters.categories.filter(c => c !== catId) 
        : [...filters.categories, catId];
     setFilters({...filters, categories: newCats});
  };

  const handlePriceChange = (e) => {
    setFilters({...filters, [e.target.name]: e.target.value});
  };

  // Внутреннее содержимое фильтров
  const filtersContent = (
    <div className="space-y-6 relative z-10">
      
      {/* Декоративный заголовок */}
      <div className="text-center border-b border-gold-500/30 pb-4 mb-4">
        <h2 className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">
            Подбор проекта
        </h2>
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1">Manufacture</p>
      </div>

      {/* 1. ЖИВОЙ ПОИСК */}
      <div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500" size={16} />
            <input
                type="text"
                placeholder="Поиск (например: Чан...)"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-royal-950/50 border border-royal-700 text-white text-sm rounded-xl focus:ring-1 focus:ring-gold-500 focus:border-gold-500 block pl-10 p-3 placeholder-gray-500 transition-all outline-none shadow-inner"
            />
        </div>
      </div>

      {/* 2. КАТЕГОРИИ (Строим из categoriesList) */}
      <div>
        <h3 className="font-serif text-sm font-bold text-gold-500 mb-3 uppercase tracking-wider flex items-center gap-2">
             <Filter size={14} /> Категории
        </h3>
        <div className="space-y-0.5 bg-royal-950/30 rounded-xl p-2 border border-royal-800 max-h-[400px] overflow-y-auto custom-scrollbar">
          {categoriesList.map((cat) => (
              <CheckboxItem 
                key={cat.id} 
                id={cat.id} 
                label={cat.name} // Берем name из mockData
                checked={filters.categories.includes(cat.id)} 
                onChange={handleCategoryChange} 
              />
          ))}
        </div>
      </div>

      {/* 3. БЮДЖЕТ */}
      <div>
        <h3 className="font-serif text-sm font-bold text-gold-500 mb-3 uppercase tracking-wider">Бюджет</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handlePriceChange}
            placeholder="От"
            className="w-full px-3 py-2 bg-royal-950/50 border border-royal-700 rounded-lg text-sm text-white focus:border-gold-500 outline-none transition-all placeholder-gray-600 text-center"
          />
          <span className="text-gold-500 font-bold">-</span>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handlePriceChange}
            placeholder="До"
            className="w-full px-3 py-2 bg-royal-950/50 border border-royal-700 rounded-lg text-sm text-white focus:border-gold-500 outline-none transition-all placeholder-gray-600 text-center"
          />
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={onReset}
        className="w-full py-3 text-sm font-bold text-royal-900 bg-gold-500 hover:bg-gold-400 rounded-xl transition-all shadow-lg shadow-gold-500/20 active:scale-95"
      >
        Сбросить
      </button>
    </div>
  );

  return (
    <>
      {/* ДЕСКТОП: СТИЛЬ "Зеленый Чан" */}
      <div className="hidden lg:block relative p-6 rounded-[30px] shadow-2xl overflow-hidden border-x border-royal-800 bg-royal-900 sticky top-32">
        
        {/* ФОН */}
        <div className="absolute inset-0 bg-royal-900 z-0"></div>
        
        {/* ТЕКСТУРА */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 39px, #000 40px)' }}>
        </div>

        {/* ДЕКОР: Золотые обручи */}
        <div className="absolute top-4 left-0 w-full h-3 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700 opacity-90 shadow-md"></div>
        <div className="absolute bottom-4 left-0 w-full h-3 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700 opacity-90 shadow-md"></div>
        
        <div className="py-4">
            {filtersContent}
        </div>
      </div>

      {/* МОБИЛЬНЫЙ */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={onClose} 
                className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-sm" 
            />
            <motion.div 
                initial={{ x: "-100%" }} 
                animate={{ x: 0 }} 
                exit={{ x: "-100%" }} 
                className="fixed top-0 left-0 h-full w-[320px] bg-royal-900 z-[150] p-6 overflow-y-auto lg:hidden shadow-2xl border-r border-gold-900"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-serif font-bold text-gold-500">Фильтры</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                    <X size={24} />
                </button>
              </div>
              {filtersContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarFilters;