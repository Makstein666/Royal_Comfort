import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, CheckCircle, Loader2 } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, prefilledOrderId = '' }) => {
  const [step, setStep] = useState(1); // 1 = ввод номера, 2 = отзыв
  const [orderId, setOrderId] = useState(prefilledOrderId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  // Сброс при открытии
  React.useEffect(() => {
    if (isOpen) {
        setStep(prefilledOrderId ? 2 : 1);
        setOrderId(prefilledOrderId);
        setRating(5);
        setText('');
        setStatus('idle');
    }
  }, [isOpen, prefilledOrderId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
        const response = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                rating: rating,
                text: text
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
                              onClick={() => { if(orderId.length > 5) setStep(2); else alert('Введите номер'); }}
                              className="w-full py-3 bg-[#0A2A2A] text-[#B88E2F] rounded-xl font-bold"
                          >
                              Далее
                          </button>
                      </div>
                  )}

                  {/* ШАГ 2: Сам отзыв */}
                  {step === 2 && (
                      <div className="space-y-4">
                           <div className="flex justify-center gap-2 mb-4">
                               {[1, 2, 3, 4, 5].map((star) => (
                                   <button type="button" key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                                       <Star size={32} fill={star <= rating ? "#B88E2F" : "transparent"} stroke={star <= rating ? "#B88E2F" : "#D1D5DB"} />
                                   </button>
                               ))}
                           </div>

                           <input 
                              type="text" placeholder="Ваше имя" required
                              className="w-full p-3 bg-white border border-gray-200 rounded-xl"
                              value={name} onChange={e => setName(e.target.value)}
                           />

                           <textarea 
                              placeholder="Что вам понравилось?" 
                              required
                              className="w-full p-3 bg-white border border-gray-200 rounded-xl h-32 resize-none"
                              value={text} onChange={e => setText(e.target.value)}
                           />

                           <button 
                              type="submit" 
                              disabled={status === 'loading'}
                              className="w-full py-4 bg-[#B88E2F] text-[#0A2A2A] rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#a67c22]"
                           >
                              {status === 'loading' ? <Loader2 className="animate-spin"/> : <><Send size={18}/> Отправить отзыв</>}
                           </button>
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