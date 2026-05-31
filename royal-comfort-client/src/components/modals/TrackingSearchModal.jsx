import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Copy, Phone, Send, AtSign, Check } from 'lucide-react';

const TrackingSearchModal = ({ isOpen, onClose }) => {
  const [contactValue, setContactValue] = useState('');
  const [method, setMethod] = useState('phone'); // 'phone' | 'telegram'
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null); 
  const [toast, setToast] = useState(null);

  useEffect(() => {
      if (!isOpen) {
          setContactValue('');
          setResults(null);
          setIsSearching(false);
          setToast(null);
      }
  }, [isOpen]);

  useEffect(() => {
      setContactValue('');
  }, [method]);

  const handleInputChange = (e) => {
      let val = e.target.value;

      if (method === 'telegram') {
          val = val.replace(/[^a-zA-Z0-9_@]/g, '');
          if (val.length > 0 && !val.startsWith('@')) {
              val = '@' + val.replace(/@/g, ''); 
          }
      } else {
          const digits = val.replace(/\D/g, '');
          if (digits.length === 0) {
              setContactValue('');
              return;
          }
          let cleanDigits = digits;
          if (digits[0] === '8') cleanDigits = '7' + digits.slice(1);
          else if (digits[0] !== '7') cleanDigits = '7' + digits;

          let formatted = '+7';
          if (cleanDigits.length > 1) formatted += ' (' + cleanDigits.slice(1, 4);
          if (cleanDigits.length > 4) formatted += ') ' + cleanDigits.slice(4, 7);
          if (cleanDigits.length > 7) formatted += '-' + cleanDigits.slice(7, 9);
          if (cleanDigits.length > 9) formatted += '-' + cleanDigits.slice(9, 11);
          val = formatted;
      }
      setContactValue(val);
  };

  const isValid = method === 'phone' ? contactValue.length >= 16 : contactValue.length >= 3;

  const handleSearch = async (e) => {
      e.preventDefault();
      if (!isValid) return;

      setIsSearching(true);
      setResults(null);

      try {
          // Формируем параметры запроса в зависимости от метода
          const params = new URLSearchParams();
          if (method === 'phone') {
              params.set('phone', contactValue);
          } else {
              params.set('telegram', contactValue);
          }

          const response = await fetch(`/api/orders/search?${params.toString()}`);

          if (response.status === 404) {
              // Заказы не найдены — показываем пустой массив
              setResults([]);
              return;
          }

          if (!response.ok) {
              throw new Error('Ошибка сервера');
          }

          const data = await response.json();
          setResults(Array.isArray(data) ? data : []);

      } catch (err) {
          console.error('Ошибка поиска:', err);
          setResults([]); // Показываем пустой результат при ошибке
      } finally {
          setIsSearching(false);
      }
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      setToast(`Номер ${text} скопирован`);
      setTimeout(() => {
          setToast(null);
      }, 3000);
  };

  if (!isOpen) return null;

  return (
    <>
    <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#051F1F]/90 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#B88E2F]/10 text-[#B88E2F] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mb-2">Найти заказ</h2>
                    <p className="text-sm text-gray-500">Укажите контактные данные, которые вы использовали при оформлении.</p>
                </div>

                <form onSubmit={handleSearch} className="mb-6">
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl mb-4">
                        <button 
                            type="button"
                            onClick={() => setMethod('phone')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${method === 'phone' ? 'bg-white text-[#0A2A2A] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Phone size={16} /> Телефон
                        </button>
                        <button 
                            type="button"
                            onClick={() => setMethod('telegram')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${method === 'telegram' ? 'bg-white text-[#229ED9] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Send size={16} /> Telegram
                        </button>
                    </div>

                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={method === 'phone' ? "+7 (999) 000-00-00" : "@username"}
                            className="w-full p-4 pl-12 rounded-xl border-2 border-gray-100 focus:border-[#B88E2F] outline-none font-bold text-lg text-[#0A2A2A] placeholder:font-normal placeholder:text-gray-300 transition-all"
                            value={contactValue}
                            onChange={handleInputChange}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {method === 'phone' ? <Phone size={20} /> : <AtSign size={20} />}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSearching || !isValid}
                        className="w-full mt-4 py-4 bg-[#0A2A2A] text-white font-bold rounded-xl hover:bg-[#B88E2F] hover:text-[#0A2A2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSearching ? 'Поиск в базе...' : 'Найти мои заказы'}
                    </button>
                </form>

                {results && results.length === 0 && (
                    <div className="border-t border-gray-100 pt-4 text-center py-6">
                        <p className="text-gray-400 text-sm font-medium">По вашим данным заказов не найдено.</p>
                        <p className="text-gray-300 text-xs mt-1">Проверьте номер телефона или свяжитесь с менеджером.</p>
                    </div>
                )}

                {results && results.length > 0 && (
                    <div className="space-y-3 animate-fade-in border-t border-gray-100 pt-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center mb-2">Найдено заказов: {results.length}</p>
                        {results.map(order => (
                            <div key={order.id} className="p-4 bg-[#FDFBF7] border border-[#B88E2F]/20 rounded-xl flex justify-between items-center group hover:shadow-md transition-all">
                                <div className="overflow-hidden">
                                    <p className="font-bold text-[#0A2A2A] text-sm truncate">{order.id}</p>
                                    <p className="text-xs text-gray-500 truncate">{order.product} • {order.date}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(order.id)}
                                    className="p-2 ml-2 bg-white rounded-lg text-gray-400 hover:text-[#B88E2F] hover:shadow-md transition-all border border-gray-100 shrink-0"
                                    title="Скопировать номер"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    </AnimatePresence>

    <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: 50, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 20, x: "-50%" }}
                className="fixed bottom-10 left-1/2 z-[10000] 
                           flex items-center gap-3 
                           bg-[#051F1F] border border-[#B88E2F] 
                           px-6 py-4 rounded-2xl shadow-2xl 
                           min-w-[300px] max-w-[90vw] justify-center"
            >
                <div className="w-6 h-6 bg-[#B88E2F] rounded-full flex items-center justify-center text-[#051F1F] shrink-0">
                    <Check size={14} strokeWidth={4} />
                </div>
                <span className="text-white text-sm font-bold tracking-wide text-center">
                    {toast}
                </span>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};

export default TrackingSearchModal;