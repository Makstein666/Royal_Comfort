import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Gift, Copy, CheckCircle } from 'lucide-react';
import { useConfigurator } from '../../context/ConfiguratorContext';

const ReferralModal = () => {
  const { isReferralModalOpen, setIsReferralModalOpen, appliedReferralCode, setAppliedReferralCode } = useConfigurator();

  const [mode, setMode] = useState('invite'); // 'invite' или 'apply'
  const [phone, setPhone] = useState('+7');
  const [generatedCode, setGeneratedCode] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Загружаем ранее сгенерированный код, если есть (защита от спама)
  useEffect(() => {
    const savedCode = localStorage.getItem('myReferralCode');
    if (savedCode) {
      setGeneratedCode(savedCode);
    }
  }, []);

  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    let clean = digits;
    if (clean.startsWith('8')) clean = '7' + clean.slice(1);
    if (!clean.startsWith('7')) clean = '7' + clean;
    clean = clean.slice(0, 11);
    
    let result = '+7';
    if (clean.length > 1) result += clean.slice(1);
    return result;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    if (!raw.startsWith('+7')) {
      setPhone('+7');
      return;
    }
    setPhone(formatPhone(raw));
  };

  const handleGenerate = async () => {
    if (phone.length < 12) {
      alert('Введите корректный номер телефона.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/referral/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await res.json();
      if (data.success) {
        setGeneratedCode(data.code);
        localStorage.setItem('myReferralCode', data.code);
      } else {
        alert(data.message || 'Ошибка генерации кода');
      }
    } catch (e) {
      console.error(e);
      alert('Не удалось связаться с сервером для генерации кода.');
    }
  };

  const handleApplyCode = async () => {
    if (friendCode.trim().length < 5) {
      alert('Введите корректный код друга.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: friendCode })
      });
      
      const data = await res.json();
      if (data.valid) {
        setAppliedReferralCode(friendCode.toUpperCase());
        alert(`✅ Реферальный код друга (${data.ownerName || 'клиент'}) успешно применен! Сертификат на 5 000₽ будет активирован при заказе.`);
        setIsReferralModalOpen(false);
      } else {
        alert(`⚠️ Ошибка: ${data.message || 'Недействительный реферальный код'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Не удалось верифицировать код на сервере.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isReferralModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsReferralModalOpen(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="bg-[#0A2A2A] p-6 text-white text-center relative">
            <button 
              onClick={() => setIsReferralModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="w-16 h-16 bg-[#B88E2F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#B88E2F]/20">
              <Users size={32} color="#0A2A2A" />
            </div>
            <h2 className="text-2xl font-serif font-bold">Программа лояльности</h2>
            <p className="text-gray-300 mt-2 text-sm">Дарите подарки и получайте бонусы</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button 
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'invite' ? 'text-[#0A2A2A] border-b-2 border-[#B88E2F]' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setMode('invite')}
            >
              Пригласить друга
            </button>
            <button 
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'apply' ? 'text-[#0A2A2A] border-b-2 border-[#B88E2F]' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setMode('apply')}
            >
              У меня есть код
            </button>
          </div>

          <div className="p-6">
            {mode === 'invite' && (
              <div className="space-y-4">
                {!generatedCode ? (
                  <>
                    <p className="text-gray-600 text-sm mb-4">
                      Введите ваш номер телефона, чтобы создать личный реферальный код. Ваш друг получит скидку, а вы — сертификат на 5 000₽ за его заказ!
                      <span className="block mt-2 text-xs text-[#B88E2F] font-bold">
                        *Генерация кода доступна только действующим клиентам с активным заказом.
                      </span>
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ваш телефон</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors outline-none"
                        placeholder="+79990000000"
                      />
                    </div>
                    <button 
                      onClick={handleGenerate}
                      className="w-full py-4 bg-[#B88E2F] text-white font-bold rounded-xl hover:bg-[#a07b28] transition-colors shadow-lg"
                    >
                      Сгенерировать код
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 text-sm mb-4">Ваш уникальный код готов! Отправьте его друзьям.</p>
                    <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between border border-gray-200 mb-6">
                      <span className="font-mono text-xl font-bold tracking-widest text-[#0A2A2A]">{generatedCode}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 text-gray-500 hover:text-[#B88E2F] transition-colors bg-white rounded-lg shadow-sm"
                      >
                        {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Код сохранен на вашем устройстве.</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'apply' && (
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4 flex gap-3">
                  <Gift className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Введите код друга, чтобы закрепить за вашим заказом сертификат на <span className="font-bold">5 000₽</span>.
                  </p>
                </div>

                {appliedReferralCode ? (
                  <div className="text-center py-4">
                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-500" />
                     </div>
                     <h3 className="font-bold text-lg mb-2">Код применен!</h3>
                     <p className="text-gray-500 text-sm mb-4">Текущий код: <span className="font-mono font-bold text-[#0A2A2A]">{appliedReferralCode}</span></p>
                     <button 
                       onClick={() => setAppliedReferralCode(null)}
                       className="text-red-500 text-sm font-medium hover:underline"
                     >
                       Удалить код
                     </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Код друга</label>
                      <input 
                        type="text" 
                        value={friendCode}
                        onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors outline-none font-mono uppercase tracking-wider text-center"
                        placeholder="RC-XXXX-XXX"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCode}
                      className="w-full py-4 bg-[#0A2A2A] text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
                    >
                      Активировать
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReferralModal;
