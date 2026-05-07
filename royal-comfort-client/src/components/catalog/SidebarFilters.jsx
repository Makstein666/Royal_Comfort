import React from "react";
import { Check, Search, Filter, X, SlidersHorizontal, Trash2, Lock } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

const SidebarFilters = ({ categories, filters, setFilters, onReset, isOpen, onClose }) => {
  
  // CheckboxItem — обычный и заблокированный (isLocked) режимы
  const CheckboxItem = ({ id, label, checked, onChange, isLocked = false }) => (
    <label
      title={isLocked ? 'Направление скоро откроется' : ''}
      className={`flex items-center justify-between gap-3 py-3 px-4 rounded-2xl transition-all duration-300 border border-transparent ${
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer group hover:border-[#B88E2F]/20 hover:bg-white/60 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isLocked && <Lock size={11} className="text-gray-400 flex-shrink-0" />}
        <span className={`text-sm font-medium transition-colors truncate ${
          isLocked ? 'text-gray-400' : checked ? 'text-[#051F1F]' : 'text-gray-500 group-hover:text-[#051F1F]'
        }`}>
          {label}
        </span>
        {isLocked && (
          <span className="text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
            Скоро
          </span>
        )}
      </div>
      <div className={`
        relative flex items-center justify-center w-5 h-5 rounded-full 
        border-2 transition-all duration-300 flex-shrink-0
        ${isLocked ? 'bg-gray-100 border-gray-200' : checked ? 'bg-[#B88E2F] border-[#B88E2F] scale-110' : 'bg-transparent border-gray-200 group-hover:border-[#B88E2F]'}
      `}>
        {checked && !isLocked && <Check size={10} className="text-white" strokeWidth={4} />}
        {isLocked && <Lock size={8} className="text-gray-300" />}
        <input 
            type="checkbox" 
            className="hidden" 
            checked={checked} 
            onChange={() => !isLocked && onChange(id)} 
            disabled={isLocked}
        />
      </div>
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

  const filtersContent = (
    <div className="space-y-8">
      
      {/* 1. ПОИСК */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-[#B88E2F] uppercase tracking-[0.2em] ml-1">Поиск проекта</label>
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors" size={18} />
            <input
                type="text"
                placeholder="Начните вводить..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-white/50 backdrop-blur-sm border-2 border-gray-100 text-[#051F1F] text-sm rounded-2xl focus:border-[#B88E2F] block pl-12 p-4 placeholder-gray-400 transition-all outline-none shadow-sm"
            />
        </div>
      </div>

      {/* 2. КАТЕГОРИИ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-bold text-[#B88E2F] uppercase tracking-[0.2em]">Категории</label>
            {/* Счёт только активных (без custom) */}
            <span className="text-[10px] font-bold text-gray-400">
              {categories.filter(c => c.id !== 'custom').length}
            </span>
        </div>
        <div className="space-y-1 bg-white/30 backdrop-blur-md rounded-[2rem] p-2 border border-white shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
          {categories
            .filter(c => c.id !== 'custom')   /* убираем "Индивидуальный проект" */
            .map((cat) => (
              <CheckboxItem 
                key={cat.id} 
                id={cat.id} 
                label={cat.name} 
                checked={filters.categories.includes(cat.id)} 
                onChange={handleCategoryChange}
                isLocked={!cat.isActive}   /* закрытые — заблокированы */
              />
          ))}
        </div>
      </div>

      {/* 3. БЮДЖЕТ */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-[#B88E2F] uppercase tracking-[0.2em] ml-1">Бюджет, ₽</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handlePriceChange}
                placeholder="От"
                className="w-full pl-4 pr-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl text-sm text-[#051F1F] focus:border-[#B88E2F] outline-none transition-all placeholder-gray-400 font-medium"
            />
          </div>
          <div className="relative">
            <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handlePriceChange}
                placeholder="До"
                className="w-full pl-4 pr-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl text-sm text-[#051F1F] focus:border-[#B88E2F] outline-none transition-all placeholder-gray-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={onReset}
        className="w-full py-4 mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-all group"
      >
        <Trash2 size={14} className="group-hover:rotate-12 transition-transform" /> Сбросить фильтры
      </button>
    </div>
  );

  return (
    <>
      {/* ДЕСКТОП */}
      <div className="hidden lg:block w-full">
        <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 ml-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B88E2F] to-[#9A7624] flex items-center justify-center shadow-lg shadow-[#B88E2F]/20">
                    <SlidersHorizontal size={18} className="text-white" />
                </div>
                <div>
                    <h3 className="font-serif font-bold text-xl text-[#051F1F]">Фильтры</h3>
                    <p className="text-[9px] text-[#B88E2F] uppercase tracking-[0.2em] font-bold">Royal Selection</p>
                </div>
            </div>
            {filtersContent}
        </div>
      </div>

      {/* МОБИЛЬНЫЙ */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={onClose} 
                className="fixed inset-0 bg-[#051F1F]/60 z-[140] lg:hidden backdrop-blur-sm" 
            />
            <motion.div 
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} 
                className="fixed top-0 left-0 h-full w-full max-w-[340px] bg-[#F5F1E6] z-[150] p-8 overflow-y-auto lg:hidden shadow-2xl border-r border-[#B88E2F]/10"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <SlidersHorizontal size={20} className="text-[#B88E2F]" />
                    <h2 className="text-2xl font-serif font-bold text-[#051F1F]">Параметры</h2>
                </div>
                <button onClick={onClose} className="p-3 bg-white/50 hover:bg-white rounded-full text-gray-400 transition-all shadow-sm">
                    <X size={20} />
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