import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, FileText, Upload, CheckCircle,
  Loader2, Send, MessageCircle, Trash2, ImageIcon, Clock, Lock
} from 'lucide-react';

const MAX_FILES = 5;
const MAX_FILE_MB = 5;

/**
 * Универсальный модал для подачи индивидуального проекта.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string|null} categoryName — если передан, форма адаптируется под эту категорию
 *                                      (используется для неактивных категорий)
 */
const CustomProjectModal = ({ isOpen, onClose, categoryName = null }) => {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState([]);
  const [consent, setConsent] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '+7',
    description: '',
    time: 'asap',
    files: []
  });

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.classList.add('modal-open');
      setStatus('idle');
      setTouched(false);
      setErrors({});
      setPreviews([]);
      setConsent(false);
      setForm({ name: '', phone: '+7', description: '', time: 'asap', files: [] });
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  // Контекст: если передана категория — форма адаптируется
  const isSpecificCategory = !!categoryName;
  const modalTitle = isSpecificCategory ? categoryName : 'Индивидуальный проект';
  const modalSubtitle = isSpecificCategory
    ? `Это направление скоро появится в нашем каталоге. Пока вы можете задать вопросы или описать свой проект — менеджер свяжется с вами лично.`
    : 'Опишите вашу идею — размеры, материалы, особые пожелания. Мы подготовим персональное предложение.';
  const descLabel = isSpecificCategory ? 'Ваш вопрос или идея проекта' : 'Описание проекта';
  const descPlaceholder = isSpecificCategory
    ? `Задайте вопрос или опишите идею по теме «${categoryName}»: бюджет, сроки, пожелания по материалу и размеру...`
    : 'Расскажите подробнее: желаемые размеры, материалы, особенности участка, количество человек...';
  const productName = isSpecificCategory
    ? `Консультация: ${categoryName}`
    : 'Индивидуальный проект';
  const submitLabel = isSpecificCategory ? 'Записаться на консультацию' : 'Отправить заявку';

  // --- Телефон ---
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
    if (!raw.startsWith('+7')) { setForm({ ...form, phone: '+7' }); return; }
    setForm({ ...form, phone: formatPhone(raw) });
  };

  // --- Файлы ---
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(f => f.size <= MAX_FILE_MB * 1024 * 1024);
    const all = [...form.files, ...valid].slice(0, MAX_FILES);
    setForm(prev => ({ ...prev, files: all }));
    setPreviews(all.map(f => ({ name: f.name, url: URL.createObjectURL(f) })));
  };

  const removeFile = (idx) => {
    const newFiles = form.files.filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, files: newFiles }));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  // --- Валидация ---
  const validate = (data) => {
    const errs = {};
    if (!data.name || data.name.trim().length < 2) errs.name = 'Введите ваше имя';
    if (data.phone.replace(/\D/g, '').length < 11) errs.phone = 'Введите полный номер';
    if (!data.description || data.description.trim().length < 10)
      errs.description = 'Опишите проект подробнее (минимум 10 символов)';
    if (!consent) {
      errs.consent = 'Необходимо согласие на обработку данных';
    }
    return errs;
  };

  // --- Отправка ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isSpecificCategory ? 'consultation' : 'custom_project',
          clientName: form.name,
          clientPhone: form.phone,
          preferredTime: form.time,
          contactMethod: 'phone',
          productName,
          notes: form.description,
          referenceFiles: form.files.map(f => f.name)
        })
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(onClose, 3500);
      } else {
        alert('Ошибка при отправке заявки. Попробуйте позже.');
        setStatus('idle');
      }
    } catch {
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A2A2A]/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-2xl max-h-modal overflow-hidden flex flex-col bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#B88E2F]/20"
        >
          <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#0A2A2A] via-[#B88E2F] to-[#0A2A2A]" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-[#B88E2F] transition-colors p-1.5 rounded-full hover:bg-[#B88E2F]/10 z-10"
          >
            <X size={22} />
          </button>

          <div className="p-8 pt-9 overflow-y-auto custom-scrollbar flex-1">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-10"
              >
                <div className="w-24 h-24 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="text-green-500 w-12 h-12" />
                </div>
                <p className="text-[#B88E2F] font-bold text-xs uppercase tracking-widest mb-3">Отлично!</p>
                <h3 className="text-3xl font-serif font-bold text-[#0A2A2A] mb-3">
                  {isSpecificCategory ? 'Запрос принят!' : 'Заявка отправлена'}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  {isSpecificCategory
                    ? 'Наш менеджер ответит на ваши вопросы и уточнит детали в ближайшее время.'
                    : 'Наш менеджер изучит ваш проект и свяжется с вами в ближайшее время.'}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Заголовок */}
                <div className="mb-8">
                  {isSpecificCategory ? (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                        <Lock size={11} className="text-amber-500" />
                        <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest">Скоро откроется</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#B88E2F] font-bold text-[10px] uppercase tracking-[0.25em] mb-2">Royal Comfort</p>
                  )}
                  <h2 className="text-3xl font-serif font-bold text-[#0A2A2A] leading-tight">{modalTitle}</h2>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{modalSubtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Ваше имя <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors" />
                        <input type="text" placeholder="Иван Иванов" value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inputClass('name')} />
                      </div>
                      {touched && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Телефон <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors" />
                        <input type="tel" placeholder="+7 (___) ___-__-__" value={form.phone}
                          onChange={handlePhoneChange}
                          className={inputClass('phone')} />
                      </div>
                      {touched && errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {descLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <FileText size={17} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors" />
                      <textarea rows={5} placeholder={descPlaceholder} value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className={`${inputClass('description')} pl-11 pt-3 resize-none leading-relaxed`} />
                    </div>
                    <div className="flex justify-between mt-1">
                      {touched && errors.description
                        ? <p className="text-red-500 text-xs">{errors.description}</p>
                        : <span />
                      }
                      <span className={`text-xs ml-auto ${form.description.length >= 10 ? 'text-[#B88E2F]' : 'text-gray-300'}`}>
                        {form.description.length} симв.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Удобное время для звонка
                    </label>
                    <div className="relative group">
                      <Clock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F] transition-colors" />
                      <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-11 pr-10 text-[#0A2A2A] appearance-none cursor-pointer focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all text-sm">
                        <option value="asap">Позвонить сейчас</option>
                        <option value="morning">Утром (09:00 – 12:00)</option>
                        <option value="afternoon">Днём (12:00 – 18:00)</option>
                        <option value="evening">Вечером (18:00 – 21:00)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Фото-референсы{' '}
                      <span className="text-gray-400 font-normal normal-case tracking-normal">
                        (до {MAX_FILES} фото, макс. {MAX_FILE_MB} МБ)
                      </span>
                    </label>
                    {form.files.length < MAX_FILES && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[#B88E2F]/30 hover:border-[#B88E2F] bg-[#B88E2F]/3 hover:bg-[#B88E2F]/5 rounded-2xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:text-[#B88E2F] transition-all cursor-pointer group">
                        <Upload size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Нажмите чтобы добавить фото</span>
                        <span className="text-[10px]">JPG, PNG, WEBP</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

                    {previews.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mt-3">
                        {previews.map((p, i) => (
                          <div key={i} className="relative group/thumb aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => removeFile(i)}
                                className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Чекбокс согласия */}
                  <div className="flex items-start gap-3 mt-4">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="consent-custom"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className={`w-5 h-5 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer transition-colors ${
                          touched && errors.consent ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 leading-tight text-left">
                      <label htmlFor="consent-custom" className="cursor-pointer">
                        Я даю согласие на обработку своих персональных данных в соответствии с{' '}
                      </label>
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#B88E2F] hover:underline">
                        политикой конфиденциальности
                      </a>
                      {touched && errors.consent && (
                        <p className="text-red-500 mt-1">{errors.consent}</p>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={status === 'loading'}
                    className="w-full py-4 bg-[#B88E2F] hover:bg-[#A67C22] text-[#0A2A2A] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {status === 'loading'
                      ? <><Loader2 className="animate-spin" size={18} /><span>Отправка...</span></>
                      : <><Send size={18} /><span>{submitLabel}</span></>
                    }
                  </button>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-center text-xs text-gray-400 mb-3 uppercase tracking-widest">Или напишите нам напрямую</p>
                    <div className="flex gap-3">
                      <a href="https://t.me/John_Kristov" target="_blank" rel="noopener noreferrer"
                        className="flex-1 py-3 bg-[#0A2A2A] text-[#B88E2F] rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#B88E2F] hover:text-[#0A2A2A] transition-all shadow-md">
                        <Send size={16} /> Telegram
                      </a>
                      <a href="https://wa.me/79255204053" target="_blank" rel="noopener noreferrer"
                        className="flex-1 py-3 bg-[#0A2A2A] text-[#B88E2F] rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#B88E2F] hover:text-[#0A2A2A] transition-all shadow-md">
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                    </div>
                  </div>

                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomProjectModal;
