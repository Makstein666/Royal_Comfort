import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, Clock, CheckCircle, Loader2, Send, MessageCircle } from 'lucide-react';

// Иконка Макс — стильная буква M
const MaxIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" fillOpacity="0.12"/>
    <path d="M6 17V7l6 7 6-7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ContactModal = ({ isOpen, onClose, title = "Заказать звонок", subtitle = "", productName = "" }) => {
  const [formState, setFormState] = useState({ name: '', phone: '+7', time: 'asap' });
  const [status, setStatus] = useState('idle'); // idle, loading, success
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [consent, setConsent] = useState(false);

  // Блокируем скролл фона при открытой модалке
  useEffect(() => {
    if (isOpen) {
      // Вычисляем ширину скроллбара, чтобы избежать "прыжка" контента
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setFormState({ name: '', phone: '+7', time: 'asap' });
      setErrors({});
      setTouched(false);
      setConsent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Форматирование телефона ---
  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    let clean = digits;
    if (clean.startsWith('8')) clean = '7' + clean.slice(1);
    if (!clean.startsWith('7')) clean = '7' + clean;
    clean = clean.slice(0, 11);

    let result = '+7';
    if (clean.length > 1) result += ' (' + clean.slice(1, 4);
    if (clean.length > 4) result += ') ' + clean.slice(4, 7);
    if (clean.length > 7) result += '-' + clean.slice(7, 9);
    if (clean.length > 9) result += '-' + clean.slice(9, 11);
    return result;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    if (!raw.startsWith('+7')) {
      setFormState({ ...formState, phone: '+7' });
      return;
    }
    setFormState({ ...formState, phone: formatPhone(raw) });
  };

  // --- Валидация ---
  const validate = (data) => {
    const errs = {};
    if (!data.name || data.name.trim().length < 2) errs.name = 'Введите ваше имя (минимум 2 символа)';
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 11) errs.phone = 'Введите полный номер (+7 и 10 цифр)';
    if (!consent) errs.consent = 'Необходимо согласие на обработку данных';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(formState);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: productName ? 'order' : 'consultation',
          clientName: formState.name,
          clientPhone: formState.phone,
          preferredTime: formState.time,
          contactMethod: 'phone',
          productName: productName || 'Общая консультация'
        })
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(onClose, 3000);
      } else {
        alert('Ошибка при отправке заявки. Попробуйте позже.');
        setStatus('idle');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Нет соединения с сервером.');
      setStatus('idle');
    }
  };

  const inputClass = (field) =>
    `w-full bg-white border rounded-xl py-3.5 pl-11 pr-4 text-[#0A2A2A] placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all text-sm ${
      touched && errors[field]
        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
        : 'border-gray-200 focus:border-[#B88E2F] focus:ring-[#B88E2F]'
    }`;

  return (
    <AnimatePresence>
      {/* 
        Оверлей: на мобиле — items-end (bottom sheet снизу),
        на sm+ — items-center (по центру экрана)
      */}
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">

        {/* Фон */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A2A2A]/60 backdrop-blur-sm"
        />

        {/* 
          Карточка:
          - На мобиле: занимает всю ширину, скруглена только сверху, прилипает к низу
          - На sm+: max-w-md, скруглена со всех сторон, ограничена по высоте
          - max-h-modal — CSS-класс с двойным fallback (90vh / 90dvh)
          - flex flex-col + overflow-hidden обеспечивают прокрутку внутри
        */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full sm:max-w-md bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#B88E2F]/20 flex flex-col overflow-hidden max-h-modal"
        >
          {/* Верхняя золотая полоса */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#0A2A2A] via-[#B88E2F] to-[#0A2A2A] flex-shrink-0" />

          {/* Индикатор свайпа (только мобиле) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Кнопка закрытия — ВНЕ прокручиваемой зоны, всегда видима */}
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute top-4 right-4 text-gray-400 hover:text-[#B88E2F] transition-colors p-2 rounded-full hover:bg-[#B88E2F]/10 z-20 touch-manipulation"
          >
            <X size={24} />
          </button>

          {/* Прокручиваемое содержимое */}
          <div className="modal-scroll flex-1">
            <div className="p-6 sm:p-8 pt-4">

              {status === 'success' ? (
                /* ЭКРАН УСПЕХА */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="w-20 h-20 bg-green-100/50 rounded-full flex items-center justify-center mb-6 border border-green-200">
                    <CheckCircle className="text-green-600 w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#0A2A2A] mb-2">Заявка принята</h3>
                  <p className="text-gray-500 text-sm">Наш менеджер свяжется с вами<br />в указанное время.</p>
                </motion.div>
              ) : (
                /* ФОРМА */
                <>
                  <div className="text-center mb-6 pr-8">
                    <p className="text-[#B88E2F] font-bold text-[10px] uppercase tracking-[0.2em] mb-2">Royal Service</p>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2A2A] leading-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-[#0A2A2A]/80 mt-2 font-medium">{subtitle}</p>}
                    <p className="text-xs text-gray-400 mt-3">
                      Поля, отмеченные <span className="text-red-500 font-bold">*</span>, обязательны
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                    {/* Имя */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Ваше имя <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="Иван Иванов"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className={inputClass('name')}
                        />
                      </div>
                      {touched && errors.name && <p className="text-red-500 text-xs mt-1 pl-1">{errors.name}</p>}
                    </div>

                    {/* Телефон */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Номер телефона <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors">
                          <Phone size={18} />
                        </div>
                        <input
                          type="tel"
                          placeholder="+7 (___) ___-__-__"
                          value={formState.phone}
                          onChange={handlePhoneChange}
                          className={inputClass('phone')}
                        />
                      </div>
                      {touched && errors.phone && <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone}</p>}
                    </div>

                    {/* Время звонка */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Удобное время <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors">
                          <Clock size={18} />
                        </div>
                        <select
                          value={formState.time}
                          onChange={(e) => setFormState({ ...formState, time: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-11 pr-10 text-[#0A2A2A] appearance-none cursor-pointer focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all text-sm"
                        >
                          <option value="asap">Позвонить сейчас</option>
                          <option value="morning">Утром (09:00 - 12:00)</option>
                          <option value="afternoon">Днем (12:00 - 18:00)</option>
                          <option value="evening">Вечером (18:00 - 21:00)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 1L5 5L9 1" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Чекбокс согласия */}
                    <div className="flex items-start gap-3 mt-4">
                      <div className="flex items-center h-5 mt-0.5 flex-shrink-0">
                        <input
                          id="consent-contact"
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className={`w-5 h-5 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer transition-colors ${
                            touched && errors.consent ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      <div className="text-xs text-gray-500 leading-tight text-left">
                        <label htmlFor="consent-contact" className="cursor-pointer">
                          Я даю согласие на обработку своих персональных данных в соответствии с{' '}
                        </label>
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#B88E2F] hover:underline">
                          политикой конфиденциальности
                        </a>
                        {touched && errors.consent && <p className="text-red-500 mt-1">{errors.consent}</p>}
                      </div>
                    </div>

                    {/* Кнопка */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-4 bg-[#B88E2F] hover:bg-[#A67C22] text-[#0A2A2A] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 relative overflow-hidden group touch-manipulation"
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {status === 'loading'
                        ? <><Loader2 className="animate-spin" size={18} /><span>Отправка...</span></>
                        : <span>Жду звонка</span>
                      }
                    </button>
                  </form>

                  {/* БЛОК МЕССЕНДЖЕРОВ */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-center text-xs text-gray-400 mb-4 uppercase tracking-widest">
                      Или напишите нам
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="https://t.me/royal_comfort1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-[#0A2A2A] text-[#B88E2F] rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#B88E2F] hover:text-[#0A2A2A] transition-all shadow-md touch-manipulation"
                      >
                        <Send size={18} />
                        Telegram
                      </a>

                      <a
                        href="https://wa.me/79338987788"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-[#0A2A2A] text-[#B88E2F] rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#B88E2F] hover:text-[#0A2A2A] transition-all shadow-md touch-manipulation"
                      >
                        <MessageCircle size={18} />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Отступ снизу для мобильных устройств */}
                  <div className="h-4 sm:hidden" />
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;