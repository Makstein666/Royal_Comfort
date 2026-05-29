import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ShieldCheck, PenTool, CheckCircle, Star, Layers, Thermometer, ArrowRight, ImageOff } from 'lucide-react';

const ProductDetailsModal = ({ isOpen, onClose, product, onOrder }) => {
  const [activeTab, setActiveTab] = useState('desc'); 

  if (!isOpen || !product) return null;

  // Парсим JSON поля, если они строки
  const parseJSON = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try { return JSON.parse(data); } catch (e) { return null; }
  };

  const productFeatures = parseJSON(product.features) || [];
  const productSpecs = parseJSON(product.specs) || [];

  const details = {
      specs: productSpecs.length > 0 ? productSpecs : productFeatures.map(f => ({ label: 'Особенность', value: f })),
      fullDescription: product.description
  };

  const TabButton = ({ id, label }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex-1 pb-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative
            ${activeTab === id ? 'text-royal-900 border-b-2 border-gold-500' : 'text-gray-400 hover:text-royal-600 border-b-2 border-transparent'}
        `}
      >
          {label}
      </button>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        
        {/* 1. ЗАТЕМНЕНИЕ (Кликабельное) */}
        <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={onClose} 
        />

        {/* 2. ОКНО МОДАЛКИ */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          
          {/* --- ЛЕВАЯ КОЛОНКА (ФОТО) --- */}
          {/* w-full на мобильном, w-1/2 на пк. Фиксированная высота или full */}
          <div className="w-full h-48 md:w-1/2 md:h-full relative bg-gray-200 shrink-0">
              {/* Используем тег IMG для надежности. Если сломается - покажет заглушку */}
              {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} // Скрыть если битая
                  />
              ) : null}
              
              {/* Заглушка, если фото нет или битое */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 -z-10">
                  <ImageOff className="text-gray-600" size={48} />
              </div>

              {/* Градиент для текста */}
              <div className="absolute inset-0 bg-gradient-to-t from-royal-900/90 via-transparent to-transparent opacity-90" />
              
              {/* Текст поверх картинки (виден всегда) */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white z-20">
                  {product.isPremium && (
                      <div className="inline-flex items-center gap-2 bg-gold-500 text-royal-900 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest mb-3">
                          <Star size={12} fill="currentColor"/> Premium
                      </div>
                  )}
                  <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">{product.categoryName}</p>
                  <h2 className="text-2xl md:text-4xl font-serif font-medium leading-tight text-white">{product.name}</h2>
              </div>

              {/* Кнопка закрытия для Мобильных (на фото) */}
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-50 p-2 bg-black/40 text-white rounded-full md:hidden backdrop-blur-md"
              >
                <X size={24} />
              </button>
          </div>

          {/* --- ПРАВАЯ КОЛОНКА (КОНТЕНТ) --- */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-white relative">
              
              {/* Кнопка закрытия для ПК (в углу белого поля) */}
              <button 
                onClick={onClose} 
                className="hidden md:block absolute top-4 right-4 z-50 p-2 bg-gray-100 rounded-full text-royal-900 hover:bg-gold-500 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Меню вкладок */}
              <div className="px-6 md:px-10 pt-6 md:pt-12 pb-0 border-b border-gray-200 flex gap-4 shrink-0 bg-white">
                  <TabButton id="desc" label="О проекте" />
                  <TabButton id="specs" label="Характеристики" />
              </div>

              {/* Скроллируемая область контента */}
              <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white">
                  
                  {/* 1. ОПИСАНИЕ */}
                  {activeTab === 'desc' && (
                      <div className="space-y-6 animate-fade-in">
                          <p className="text-gray-800 text-lg leading-relaxed font-serif italic pl-4 border-l-4 border-gold-500">
                              "{details.fullDescription}"
                          </p>

                          <div className="grid grid-cols-1 gap-3 pt-4">
                              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 items-center">
                                  <ShieldCheck className="text-gold-600 shrink-0" size={28}/>
                                  <div>
                                      <h4 className="font-bold text-royal-900 text-sm uppercase">Гарантия качества</h4>
                                      <p className="text-xs text-gray-500 mt-0.5">Только сертифицированные материалы.</p>
                                  </div>
                              </div>
                              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 items-center">
                                  <Thermometer className="text-gold-600 shrink-0" size={28}/>
                                  <div>
                                      <h4 className="font-bold text-royal-900 text-sm uppercase">Всесезонность</h4>
                                      <p className="text-xs text-gray-500 mt-0.5">Эксплуатация от -50°C до +50°C.</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* 2. ХАРАКТЕРИСТИКИ */}
                  {activeTab === 'specs' && (
                      <div className="space-y-6 animate-fade-in">
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                              {details.specs && details.specs.length > 0 ? (
                                  details.specs.map((spec, i) => (
                                      <div key={i} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{spec.label}</span>
                                          <span className="text-royal-900 font-bold text-sm text-right">{spec.value}</span>
                                      </div>
                                  ))
                              ) : (
                                  <div className="p-8 text-center flex flex-col items-center justify-center">
                                      <Layers className="text-gray-300 mb-3" size={32} />
                                      <p className="text-gray-500 text-sm font-medium">Характеристики находятся в процессе заполнения.</p>
                                      <p className="text-gray-400 text-xs mt-1">Уточните детали у менеджера при оформлении заявки.</p>
                                  </div>
                              )}
                          </div>

                      </div>
                  )}

                  
              </div>

              {/* ФУТЕР (Кнопка) */}
              <div className="p-6 md:p-8 border-t border-gray-200 bg-gray-50 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
                  <div className="text-center sm:text-left">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Стоимость конфигурации</p>
                      <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                          <span className="text-sm text-gray-500">от</span>
                          <span className="text-3xl font-bold text-royal-900">{product.price.toLocaleString()} ₽</span>
                      </div>
                  </div>
                  
                  <button 
                    onClick={() => { onClose(); onOrder(product); }}
                    className="w-full sm:w-auto px-8 py-4 bg-gold-500 text-royal-900 font-bold rounded-xl hover:bg-white hover:text-royal-900 transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
                  >
                      <ShoppingBag size={20} />
                      <span>Рассчитать</span>
                      <ArrowRight size={18} />
                  </button>
              </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;