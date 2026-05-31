import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, CheckCircle, Loader2 } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, prefilledOrderId = '' }) => {
  const [step, setStep] = useState(1); // 1 = ввод номера, 2 = отзыв
  const [orderId, setOrderId] = useState(prefilledOrderId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, checking, loading, success, error
  const [error, setError] = useState('');

  // Состояние для картинок
  const [images, setImages] = useState([]); // массив Base64-строк
  const [previews, setPreviews] = useState([]); // массив { file, url }
  const fileInputRef = React.useRef(null);

  // Сброс при открытии
  React.useEffect(() => {
    if (isOpen) {
        setStep(prefilledOrderId ? 2 : 1);
        setOrderId(prefilledOrderId);
        setRating(5);
        setText('');
        setName('');
        setConsent(false);
        setError('');
        setStatus('idle');
        setImages([]);
        // Очищаем старые blob-ссылки
        previews.forEach(p => URL.revokeObjectURL(p.url));
        setPreviews([]);

        if (prefilledOrderId) {
            setStatus('loading');
            fetch(`/api/reviews/check-order/${prefilledOrderId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        setName(data.clientName || '');
                        setStatus('idle');
                    } else {
                        // Если заказ не подходит (уже оставлен отзыв и т.д.)
                        alert(data.message || 'Заказ не прошел проверку');
                        onClose();
                    }
                })
                .catch(e => {
                    console.error(e);
                    setStatus('idle');
                });
        }
    }
  }, [isOpen, prefilledOrderId]);

  if (!isOpen) return null;

  const handleCheckOrder = async () => {
    if (!orderId || orderId.trim().length < 5) {
        alert('Введите корректный номер заказа');
        return;
    }
    
    setStatus('checking');
    try {
        const response = await fetch(`/api/reviews/check-order/${orderId.trim()}`);
        const data = await response.json();
        
        if (response.ok) {
            setName(data.clientName || '');
            setStep(2);
            setStatus('idle');
        } else {
            alert(data.message || 'Ошибка проверки заказа');
            setStatus('idle');
        }
    } catch (err) {
        console.error(err);
        alert('Ошибка соединения с сервером');
        setStatus('idle');
    }
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    // Допускаем только файлы размером до 5МБ
    const valid = selected.filter(f => f.size <= 5 * 1024 * 1024);
    
    // Получаем текущие файлы
    const currentFiles = previews.map(p => p.file);
    const allFiles = [...currentFiles, ...valid].slice(0, 5); // лимит 5 фото

    // Высвобождаем старые URL, чтобы избежать утечек памяти
    previews.forEach(p => URL.revokeObjectURL(p.url));

    const newPreviews = allFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);

    // Конвертируем все в Base64
    const promises = allFiles.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    });

    Promise.all(promises).then(base64s => {
        setImages(base64s);
    });
  };

  const removeFile = (idx) => {
    const target = previews[idx];
    if (target) {
        URL.revokeObjectURL(target.url);
    }
    const newPreviews = previews.filter((_, i) => i !== idx);
    setPreviews(newPreviews);

    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 2 && !consent) {
        setError('Необходимо согласие на обработку данных');
        return;
    }

    setStatus('loading');

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                rating: rating,
                text: text,
                author: name,
                images: images
            })
        });

        const data = await response.json();

        if (response.ok) {
            setStatus('success');
            setTimeout(onClose, 3000);
        } else {
            alert(data.message || 'Ошибка. Проверьте номер заказа.');
            setStatus('idle');
        }
    } catch (error) {
        console.error(error);
        alert('Ошибка соединения с сервером');
        setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A2A2A]/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl shadow-2xl p-8 border border-[#B88E2F]/20"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#B88E2F]"><X /></button>

          {status === 'success' ? (
              <div className="text-center py-10">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-[#0A2A2A]">Спасибо!</h3>
                  <p className="text-gray-500 mt-2">Ваш отзыв отправлен на модерацию.</p>
              </div>
          ) : (
              <form onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mb-6 text-center">Оставить отзыв</h2>

                  {/* ШАГ 1: Номер заказа */}
                  {step === 1 && (
                      <div className="space-y-4">
                          <p className="text-sm text-gray-500 text-center">Введите номер заказа, чтобы мы убедились, что вы наш клиент.</p>
                          <input 
                              type="text" 
                              placeholder="RC-XXXX-XXXX" 
                              className="w-full p-4 bg-white border border-gray-200 rounded-xl font-bold text-center uppercase"
                              value={orderId}
                              onChange={(e) => setOrderId(e.target.value)}
                          />
                          <button 
                              type="button"
                              disabled={status === 'checking'}
                              onClick={handleCheckOrder}
                              className="w-full py-3 bg-[#0A2A2A] text-[#B88E2F] rounded-xl font-bold flex justify-center items-center gap-2"
                          >
                              {status === 'checking' ? <Loader2 className="animate-spin" size={18} /> : 'Далее'}
                          </button>
                      </div>
                  )}

                  {/* ШАГ 2: Сам отзыв */}
                  {step === 2 && (
                      <div className="space-y-4">
                           {status === 'loading' && name === '' ? (
                               <div className="flex justify-center items-center py-8">
                                   <Loader2 className="animate-spin text-[#B88E2F]" size={24} />
                               </div>
                           ) : (
                               <>
                                   <div className="flex justify-center gap-2 mb-4">
                                       {[1, 2, 3, 4, 5].map((star) => (
                                           <button type="button" key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                                               <Star size={32} fill={star <= rating ? "#B88E2F" : "transparent"} stroke={star <= rating ? "#B88E2F" : "#D1D5DB"} />
                                           </button>
                                       ))}
                                   </div>

                                   <div className="text-left">
                                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                           Ваше имя
                                       </label>
                                       <input 
                                          type="text" placeholder="Ваше имя" required
                                          className="w-full p-3 bg-white border border-gray-200 rounded-xl"
                                          value={name} onChange={e => setName(e.target.value)}
                                       />
                                   </div>

                                   <textarea 
                                       placeholder="Что вам понравилось?" 
                                       required
                                       className="w-full p-3 bg-white border border-gray-200 rounded-xl h-32 resize-none"
                                       value={text} onChange={e => setText(e.target.value)}
                                   />

                                   {/* Загрузка фотографий */}
                                   <div>
                                     <label className="block text-left text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                       Фотографии товара{' '}
                                       <span className="text-gray-400 font-normal normal-case tracking-normal">
                                         (до 5 фото, макс. 5 МБ)
                                       </span>
                                     </label>
                                     {previews.length < 5 && (
                                       <button type="button" onClick={() => fileInputRef.current?.click()}
                                         className="w-full border border-dashed border-[#B88E2F]/30 hover:border-[#B88E2F] bg-[#B88E2F]/3 hover:bg-[#B88E2F]/5 rounded-2xl py-4 flex flex-col items-center gap-1 text-gray-400 hover:text-[#B88E2F] transition-all cursor-pointer group">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                         <span className="text-xs font-semibold">Нажмите, чтобы загрузить фото</span>
                                       </button>
                                     )}
                                     <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

                                     {previews.length > 0 && (
                                       <div className="grid grid-cols-5 gap-2 mt-3">
                                         {previews.map((p, i) => (
                                           <div key={i} className="relative group/thumb aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                             <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
                                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                               <button type="button" onClick={() => removeFile(i)}
                                                 className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
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
                                         id="consent-review"
                                         type="checkbox"
                                         checked={consent}
                                         onChange={(e) => {
                                             setConsent(e.target.checked);
                                             if(e.target.checked) setError('');
                                         }}
                                         className={`w-5 h-5 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer transition-colors ${
                                           error ? 'border-red-500' : ''
                                         }`}
                                       />
                                     </div>
                                     <div className="text-xs text-gray-500 leading-tight text-left">
                                       <label htmlFor="consent-review" className="cursor-pointer">
                                         Я даю согласие на обработку своих персональных данных в соответствии с{' '}
                                       </label>
                                       <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#B88E2F] hover:underline">
                                         политикой конфиденциальности
                                       </a>
                                       {error && (
                                         <p className="text-red-500 mt-1">{error}</p>
                                       )}
                                     </div>
                                   </div>

                                   <button 
                                       type="submit" 
                                      disabled={status === 'loading'}
                                      className="w-full py-4 bg-[#B88E2F] text-[#0A2A2A] rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#a67c22]"
                                   >
                                      {status === 'loading' ? <Loader2 className="animate-spin"/> : <><Send size={18}/> Отправить отзыв</>}
                                   </button>
                               </>
                           )}
                      </div>
                  )}
              </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;