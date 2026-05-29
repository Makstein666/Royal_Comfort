import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import { 
  X, Check, Calculator, ArrowRight, Info, ChevronRight, LayoutGrid, PenTool, ArrowLeft, 
  Phone, User, MessageSquare, Send, Smartphone, Clock, AtSign, Copy, ExternalLink, Edit2, AlertCircle,
  Droplet, Flame, TreePine, Sparkles, Home, Sun, Wind, Utensils
} from 'lucide-react';
import { useConfigurator } from '../../context/ConfiguratorContext';

const ConfiguratorModal = () => {
  const { 
    isOpen, 
    openModal, 
    closeModal, 
    configuration, 
    updateOption, 
    totalPrice, 
    configData, 
    activeCategory,
    categories, 
    products, 
    currentProduct, 
    checkCompatibility,
    activeGift 
  } = useConfigurator();

  const navigate = useNavigate();

  // Состояния навигации
  const [viewStep, setViewStep] = useState('form'); 
  const [formSource, setFormSource] = useState('direct'); 
  
  // Данные формы
  const [formData, setFormData] = useState({ name: '', phone: '', preferredTime: '', comment: '' });
  const [contactMethod, setContactMethod] = useState('phone'); 
  const [errors, setErrors] = useState({}); // Храним ошибки валидации
  
  // Состояния процесса заказа
  const [isVerifying, setIsVerifying] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null); 
  
  // Состояние для анимации копирования
  const [isCopied, setIsCopied] = useState(false);
  
  // Согласие
  const [consent, setConsent] = useState(false);

  const isInitialized = useRef(false);

  // --- ГЕНЕРАЦИЯ ВРЕМЕННОГО ID (Только как запасной вариант) ---
  const generateTempId = () => {
      const datePart = new Date().toISOString().slice(2, 7).replace('-', ''); 
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      return `RC-${datePart}-${randomPart}`;
  };

  // Инициализация
  useEffect(() => {
    if (isOpen) {
      if (!isInitialized.current) {
        if (currentProduct) {
          setViewStep('form');
          setFormSource('direct');
        } else {
          setViewStep('choice');
          setFormSource('custom');
        }
        isInitialized.current = true;
      }
    } else {
      isInitialized.current = false;
      setFormData({ name: '', phone: '', preferredTime: '', comment: '' }); 
      setContactMethod('phone');
      setIsVerifying(false);
      setIsSubmitting(false);
      setOrderId(null);
      setIsCopied(false);
      setConsent(false);
      setErrors({});
    }
  }, [isOpen, currentProduct]);

  // Сброс телефона и ошибок при смене метода
  useEffect(() => {
      setFormData(prev => ({ ...prev, phone: '' }));
      setErrors({});
  }, [contactMethod]);

  const categoryObj = useMemo(() => categories.find(c => c.id === activeCategory), [categories, activeCategory]);
  const categoryName = categoryObj ? categoryObj.name : 'Проект';

  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];
    return products.filter(p => p.categoryId === activeCategory);
  }, [products, activeCategory]);

  const modalTitle = useMemo(() => {
      if (!activeCategory) return "С чего начнем?";
      switch (viewStep) {
          case 'choice': return "Выберите метод";
          case 'templates': return "Выберите базу";
          case 'order': return isVerifying ? "Проверка данных" : "Оформление заявки";
          case 'success': return "Заказ оформлен!";
          default: return currentProduct ? currentProduct.name : "Индивидуальный проект";
      }
  }, [activeCategory, viewStep, currentProduct, isVerifying]);
  
  const modalSubtitle = useMemo(() => {
    if (!activeCategory) return "Выберите категорию для конфигурации";
    switch (viewStep) {
        case 'choice': return "Создать с нуля или взять готовый проект?";
        case 'templates': return "Популярные конфигурации";
        case 'order': return isVerifying ? "Убедитесь, что мы сможем с вами связаться" : "Заполните данные для связи";
        case 'success': return "Сохраните номер заказа для отслеживания";
        default: return "Настройте комплектацию под себя";
    }
  }, [activeCategory, viewStep, isVerifying]);

  // Абстрактный паттерн вместо скучной картинки
  const renderAbstractPattern = () => {
      let Icons = [Sparkles, TreePine, Flame];
      
      if (activeCategory === 'tub' || activeCategory === 'pool') {
          Icons = [Droplet, Flame, TreePine, Sparkles];
      } else if (activeCategory === 'gazebo' || activeCategory === 'bath') {
          Icons = [Home, Sun, TreePine, Wind];
      } else if (activeCategory === 'grill') {
          Icons = [Flame, Utensils, Sparkles];
      }

      const Icon0 = Icons[0];
      const Icon1 = Icons[1];
      const Icon2 = Icons[2];
      const Icon3 = Icons[3];

      return (
          <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-20 text-[#B88E2F]">
              <Icon0 size={300} className="absolute -top-10 -left-10 rotate-12 drop-shadow-lg" />
              <Icon1 size={400} className="absolute top-1/2 -right-32 -translate-y-1/2 -rotate-12 drop-shadow-lg" />
              <Icon2 size={250} className="absolute -bottom-10 -left-10 rotate-45 drop-shadow-lg" />
              {Icon3 && <Icon3 size={200} className="absolute top-20 right-10 -rotate-12 drop-shadow-lg" />}
          </div>
      );
  }; 

  // --- ОБРАБОТЧИКИ ---

  const handleStartCustom = () => { setViewStep('form'); setFormSource('custom'); };
  const handleGoToTemplates = () => { setViewStep('templates'); };
  const handleChooseTemplate = (product) => { openModal(activeCategory, product); setViewStep('form'); setFormSource('template'); };
  const handleGoToOrder = () => { setViewStep('order'); };

  // --- ВАЛИДАЦИЯ ВВОДА ---
  const handleContactChange = (e) => {
    let val = e.target.value;
    setErrors(prev => ({ ...prev, phone: null })); // Сбрасываем ошибку при вводе

    if (contactMethod === 'telegram') {
        if (val.length === 0) {
             setFormData({ ...formData, phone: '' });
             return;
        }
        val = val.replace(/[^a-zA-Z0-9_@]/g, '');
        if (!val.startsWith('@')) {
            val = '@' + val.replace(/@/g, ''); 
        }
        setFormData({ ...formData, phone: val });

    } else {
        const digits = val.replace(/\D/g, '');
        if (digits.length === 0) {
            setFormData({ ...formData, phone: '' });
            return;
        }
        let cleanDigits = digits;
        if (digits[0] === '8') cleanDigits = '7' + digits.slice(1);
        else if (digits[0] === '9') cleanDigits = '7' + digits;
        else if (digits[0] !== '7') cleanDigits = '7' + digits; 

        let formatted = '+7';
        if (cleanDigits.length > 1) formatted += ' (' + cleanDigits.slice(1, 4);
        if (cleanDigits.length > 4) formatted += ') ' + cleanDigits.slice(4, 7);
        if (cleanDigits.length > 7) formatted += '-' + cleanDigits.slice(7, 9);
        if (cleanDigits.length > 9) formatted += '-' + cleanDigits.slice(9, 11);

        setFormData({ ...formData, phone: formatted });
    }
  };

  const validateForm = () => {
      const newErrors = {};
      
      if (!formData.name.trim()) newErrors.name = "Введите имя";
      
      if (contactMethod === 'telegram') {
          if (formData.phone.length < 3) newErrors.phone = "Некорректный никнейм";
      } else {
          if (formData.phone.length < 16) newErrors.phone = "Введите полный номер";
      }

      if (!consent) {
          newErrors.consent = "Необходимо согласие на обработку данных";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
        setIsVerifying(true);
    }
  };

  // --- ОТПРАВКА ДАННЫХ ---
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    const orderPayload = {
        type: 'order', 
        clientName: formData.name,
        clientPhone: formData.phone,
        contactMethod: contactMethod,
        preferredTime: formData.preferredTime,
        
        productId: currentProduct ? currentProduct.id : activeCategory,
        productName: currentProduct ? currentProduct.name : `Индивидуальный проект (${categoryName})`,
        totalPrice: totalPrice,
        configuration: configuration,
        gift: activeGift ? activeGift.name : null
    };

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
        });

        const data = await response.json();

        if (response.ok) {
            const realOrderId = data.id || (data.order && data.order.id) || (data.order && data.order._id) || data._id || data.orderId;
            
            if (realOrderId) {
                setOrderId(realOrderId);
            } else {
                setOrderId(generateTempId());
            }
            
            setIsSubmitting(false);
            setIsVerifying(false);
            setViewStep('success'); 
        } else {
            console.error("Ошибка сервера:", data);
            alert("Произошла ошибка при отправке заявки. Попробуйте еще раз.");
            setIsSubmitting(false);
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
        alert("Не удалось соединиться с сервером. Проверьте подключение.");
        setIsSubmitting(false);
    }
  };

  // --- КОПИРОВАНИЕ ---
  const handleCopyId = () => {
      navigator.clipboard.writeText(orderId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTrackOrder = () => {
      closeModal();
      navigate('/tracking'); 
  };

  const handleBack = () => {
    if (isVerifying) {
        setIsVerifying(false); 
    } else if (viewStep === 'success') {
        closeModal();
    } else if (viewStep === 'order') {
        setViewStep('form');
    } else if (viewStep === 'form') {
      if (formSource === 'template') setViewStep('templates');
      else if (formSource === 'custom') setViewStep('choice');
      else closeModal();
    } else if (viewStep === 'templates') {
      setViewStep('choice');
    } else {
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center md:p-4">
        
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-[#051F1F]/90 backdrop-blur-sm transition-all"
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full md:max-w-6xl h-[100dvh] md:h-[90vh] bg-[#FDFBF7] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-[#051F1F]"
        >
          {/* НАВИГАЦИЯ */}
          <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start pointer-events-none">
            <button 
                onClick={handleBack}
                className="pointer-events-auto flex items-center gap-2 bg-white/80 hover:bg-[#B88E2F] hover:text-white text-[#051F1F] px-4 py-2 rounded-full backdrop-blur-md shadow-sm transition-all text-xs font-bold uppercase tracking-wider group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/>
                {isVerifying ? "Изменить данные" :
                 viewStep === 'order' ? "К конфигурации" :
                 viewStep === 'success' ? "Закрыть" : "Назад"}
            </button>
            <button onClick={closeModal} className="pointer-events-auto p-2 bg-white/50 hover:bg-red-500 hover:text-white text-[#051F1F] rounded-full transition-colors backdrop-blur-md">
                <X size={24} />
            </button>
          </div>

          {/* ЛЕВАЯ ЧАСТЬ */}
          <div className="w-full md:w-5/12 bg-[#F0EFE9] relative flex flex-col justify-center p-6 md:p-10 shrink-0 overflow-hidden min-h-[160px] md:h-auto border-b md:border-b-0 md:border-r border-[#B88E2F]/10 pt-16 md:pt-10">
             <div className="absolute -top-10 -left-10 w-[200px] h-[200px] md:w-[600px] md:h-[600px] bg-[#B88E2F]/10 rounded-full blur-3xl pointer-events-none"></div>
             
             {viewStep !== 'success' && renderAbstractPattern()}

             <div className="relative z-20 mt-auto md:mt-0 text-center md:text-left">
                {activeCategory && viewStep !== 'choice' && (
                   <span className="text-[#B88E2F] text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] border border-[#B88E2F]/30 px-3 py-1.5 rounded mb-4 inline-block bg-white/50 backdrop-blur-sm">
                      {categoryName}
                   </span>
                )}
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#051F1F] max-w-md leading-tight mb-2 md:mb-4 drop-shadow-sm">{modalTitle}</h2>
                <p className="text-gray-500 text-sm md:text-base mt-2 font-medium leading-relaxed max-w-xs mx-auto md:mx-0">{modalSubtitle}</p>
             </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="w-full md:w-7/12 bg-[#FDFBF7] flex flex-col h-full overflow-hidden relative pt-4 md:pt-0">
            
            <div className={`flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-32 md:pb-10 pt-12 md:pt-16 
                ${!activeCategory ? 'flex flex-col justify-center' : ''}`} // Центрируем категории по вертикали
            >
                
                {/* 1. КАТЕГОРИИ (ИСПРАВЛЕННАЯ СЕТКА) */}
                {!activeCategory && (
                    <div className="flex flex-wrap justify-center gap-3 w-full content-start">
                        {categories.filter(c => c.id !== 'custom' && c.isActive).map((cat) => (
                            <div 
                                key={cat.id} 
                                onClick={() => openModal(cat.id)} 
                                className="flex-1 min-w-[140px] max-w-[250px] p-3 border border-[#B88E2F]/10 rounded-2xl hover:border-[#B88E2F] hover:bg-white hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center gap-2 group bg-white/50"
                            >
                                <div className="w-14 h-14 bg-gray-100 rounded-full bg-cover bg-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300" style={{backgroundImage: `url(${cat.image})`}}></div>
                                <div>
                                    <h4 className="font-bold text-[#051F1F] group-hover:text-[#B88E2F] transition-colors font-serif text-sm leading-tight">{cat.name}</h4>
                                    <div className="w-6 h-0.5 bg-[#B88E2F]/20 mx-auto mt-1.5 rounded-full group-hover:w-10 group-hover:bg-[#B88E2F] transition-all"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. МЕТОД */}
                {activeCategory && viewStep === 'choice' && (
                    <div className="flex flex-col gap-4 h-full justify-center">
                        <div onClick={handleStartCustom} className="group relative p-6 md:p-8 rounded-3xl border-2 border-[#B88E2F]/10 hover:border-[#B88E2F] bg-white hover:shadow-xl transition-all cursor-pointer flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-[#B88E2F]/10 flex items-center justify-center text-[#B88E2F] group-hover:bg-[#B88E2F] group-hover:text-white transition-colors"><PenTool size={32} /></div>
                            <div className="flex-1"><h3 className="text-xl font-serif font-bold text-[#051F1F] mb-1">Создать с нуля</h3><p className="text-sm text-gray-500">Полная кастомизация.</p></div>
                            <ArrowRight className="text-gray-300 group-hover:text-[#B88E2F] transition-all" />
                        </div>
                        <div onClick={handleGoToTemplates} className="group relative p-6 md:p-8 rounded-3xl border-2 border-[#B88E2F]/10 hover:border-[#B88E2F] bg-white hover:shadow-xl transition-all cursor-pointer flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-[#B88E2F]/10 flex items-center justify-center text-[#B88E2F] group-hover:bg-[#B88E2F] group-hover:text-white transition-colors"><LayoutGrid size={32} /></div>
                            <div className="flex-1"><h3 className="text-xl font-serif font-bold text-[#051F1F] mb-1">Готовые проекты</h3><p className="text-sm text-gray-500">Популярные модели.</p></div>
                            <ArrowRight className="text-gray-300 group-hover:text-[#B88E2F] transition-all" />
                        </div>
                    </div>
                )}

                {/* 3. ШАБЛОНЫ */}
                {activeCategory && viewStep === 'templates' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categoryProducts.map((prod) => (
                            <div key={prod.id} onClick={() => handleChooseTemplate(prod)} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#B88E2F]/50 transition-all cursor-pointer">
                                <div className="h-32 bg-gray-100 bg-cover bg-center" style={{backgroundImage: `url(${prod.image})`}}></div>
                                <div className="p-4">
                                    <h4 className="font-serif font-bold text-[#051F1F] mb-1">{prod.name}</h4>
                                    <span className="text-[#B88E2F] font-bold text-sm">от {prod.price.toLocaleString()} ₽</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. ФОРМА КОНФИГУРАТОРА */}
                {activeCategory && viewStep === 'form' && configData && (
                    <div className="space-y-8">
                        <div className="bg-[#FFFDF5] p-4 rounded-xl border border-[#B88E2F]/20 flex gap-3">
                            <Info size={20} className="text-[#B88E2F] flex-shrink-0" />
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Это предварительная конфигурация. Как производитель, мы адаптируем каждый проект индивидуально.
                            </p>
                        </div>

                        {configData.groups && configData.groups.map((group) => {
                            // Логика блокировки: если выбран товар из каталога, нельзя менять размер
                            const isLocked = group.id === 'tub_size' && !!currentProduct;
                            
                            return (
                                <div key={group.id} className="space-y-4">
                                    <div className="flex justify-between items-center pr-2">
                                        <h3 className="text-[#051F1F] font-bold text-xs uppercase tracking-wider flex items-center gap-2 pl-1 border-l-2 border-[#B88E2F] h-4 leading-none">
                                            {group.title}
                                        </h3>
                                        {isLocked && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-[#B88E2F] bg-[#B88E2F]/10 px-2 py-0.5 rounded uppercase">
                                                <AlertCircle size={10}/> Фиксировано для модели
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {group.options.map((option) => {
                                            const isSelected = configuration[group.id] === option.id;
                                            const isDisabled = isLocked && !isSelected;
                                            
                                            return (
                                                <div 
                                                    key={option.id} 
                                                    onClick={() => !isDisabled && updateOption(group.id, option.id)} 
                                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center group/opt
                                                        ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 
                                                          isSelected ? 'border-[#B88E2F] bg-[#B88E2F]/5' : 
                                                          'border-gray-200 bg-white hover:border-[#B88E2F]/50'}`}
                                                >
                                                    <div className="flex-1 flex items-center gap-4 pr-4">
                                                        {option.image && (
                                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gray-100 bg-cover bg-center shrink-0 border border-gray-200 group-hover/opt:border-[#B88E2F]/30 overflow-hidden" style={{ backgroundImage: `url(${option.image})` }}>
                                                                <div className="w-full h-full bg-black/0 group-hover/opt:bg-black/10 transition-colors"></div>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium text-sm ${isSelected ? 'text-[#051F1F]' : 'text-gray-600'}`}>
                                                                    {option.name}
                                                                </span>
                                                                {option.description && (
                                                                    <div className="relative group/info">
                                                                        <Info size={12} className="text-gray-300 group-hover/info:text-[#B88E2F] cursor-help" />
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#051F1F] text-white text-[10px] rounded shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50">
                                                                            {option.description}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-400 block mt-0.5">
                                                                {option.price === 0 ? 'В базе' : `+ ${option.price.toLocaleString()} ₽`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 rounded-full bg-[#B88E2F] flex items-center justify-center shrink-0">
                                                            <Check size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {activeGift && (
                            <div className="relative overflow-hidden rounded-2xl bg-[#0A2A2A] text-white p-6 shadow-xl border border-[#B88E2F]/30 mt-6">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88E2F] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#B88E2F] text-[#B88E2F]">
                                        {activeGift.image ? (
                                            <img src={activeGift.image} alt={activeGift.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Sparkles size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-[#B88E2F] text-[#0A2A2A] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Подарок</span>
                                            <span className="text-[#B88E2F] text-xs line-through opacity-70">5 000 ₽</span>
                                        </div>
                                        <h4 className="font-serif font-bold text-lg leading-tight mb-2">{activeGift.name}</h4>
                                        <p className="text-[10px] text-gray-400 leading-tight max-w-xs">* Акция действительна только при оформлении первого заказа до конца текущего месяца.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. ФОРМА ЗАЯВКИ */}
                {activeCategory && viewStep === 'order' && (
                    <div className="max-w-lg mx-auto h-full flex flex-col justify-start md:justify-center relative pt-20 md:pt-0 pb-10 md:pb-0">
                        <form onSubmit={handlePreSubmit} className={`space-y-6 transition-all duration-300 ${isVerifying ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
                            
                            {/* Выбор метода */}
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {[
                                    { id: 'phone', label: 'Звонок', icon: <Phone size={20} /> },
                                    { id: 'whatsapp', label: 'WhatsApp', icon: <Smartphone size={20} /> },
                                    { id: 'telegram', label: 'Telegram', icon: <Send size={20} /> },
                                    { id: 'max', label: 'Макс', icon: (
                                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" fillOpacity="0.12"/>
                                          <path d="M6 17V7l6 7 6-7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )},
                                ].map((method) => (
                                    <div key={method.id} onClick={() => setContactMethod(method.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer gap-2 h-20 ${contactMethod === method.id ? 'border-[#B88E2F] bg-[#B88E2F]/10 text-[#051F1F]' : 'border-gray-100 bg-white text-gray-400 hover:border-[#B88E2F]/30 hover:text-[#B88E2F]'}`}>
                                            {method.icon}<span className="text-[10px] uppercase font-bold tracking-wider">{method.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Поля ввода */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#051F1F] ml-1 uppercase tracking-wider">Ваше имя</label>
                                    <div className="relative group">
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="Иван Иванов" 
                                            className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 outline-none transition-colors ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-[#B88E2F]'}`} 
                                            value={formData.name} 
                                            onChange={e => setFormData({...formData, name: e.target.value})} 
                                        />
                                        <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B88E2F]" />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#051F1F] ml-1 uppercase tracking-wider">{contactMethod === 'telegram' ? 'Никнейм' : 'Телефон'}</label>
                                    <div className="relative group">
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder={contactMethod === 'telegram' ? "@username" : "+7 (___) ___-__-__"} 
                                            className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 outline-none transition-colors ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-[#B88E2F]'}`} 
                                            value={formData.phone} 
                                            onChange={handleContactChange} 
                                        />
                                        {contactMethod === 'telegram' ? <AtSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /> : <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-500 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
                                </div>

                                {/* Выбор времени (SELECT) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#051F1F] ml-1 uppercase tracking-wider">Удобное время</label>
                                    <div className="relative group">
                                        <select 
                                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-100 focus:border-[#B88E2F] outline-none appearance-none cursor-pointer text-gray-700"
                                            value={formData.preferredTime}
                                            onChange={e => setFormData({...formData, preferredTime: e.target.value})}
                                        >
                                            <option value="">В ближайшее время</option>
                                            <option value="Утром (9:00 - 12:00)">Утром (9:00 - 12:00)</option>
                                            <option value="Днем (12:00 - 17:00)">Днем (12:00 - 17:00)</option>
                                            <option value="Вечером (17:00 - 21:00)">Вечером (17:00 - 21:00)</option>
                                        </select>
                                        <Clock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <ChevronRight size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#051F1F] p-5 rounded-2xl relative overflow-hidden text-[#FDFBF7] shadow-lg mt-4">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88E2F]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10 flex justify-between items-end mb-3">
                                    <div><p className="text-[10px] text-[#B88E2F] uppercase tracking-widest font-bold mb-1">Итого</p><p className="text-2xl font-serif font-bold">~ {totalPrice.toLocaleString()} ₽</p></div>
                                </div>
                                <div className="relative z-10 pt-3 border-t border-white/10"><p className="text-[10px] text-gray-400">* Стоимость ориентировочная.</p></div>
                            </div>

                            {/* Чекбокс согласия */}
                            <div className="flex items-start gap-3 mt-4">
                              <div className="flex items-center h-5 mt-0.5">
                                <input
                                  id="consent-config"
                                  type="checkbox"
                                  checked={consent}
                                  onChange={(e) => {
                                    setConsent(e.target.checked);
                                    if (e.target.checked) {
                                      setErrors(prev => ({ ...prev, consent: null }));
                                    }
                                  }}
                                  className={`w-5 h-5 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer transition-colors ${
                                    errors.consent ? 'border-red-500' : ''
                                  }`}
                                />
                              </div>
                              <div className="text-xs text-gray-500 leading-tight text-left">
                                <label htmlFor="consent-config" className="cursor-pointer">
                                  Я даю согласие на обработку своих персональных данных в соответствии с{' '}
                                </label>
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#B88E2F] hover:underline">
                                  политикой конфиденциальности
                                </a>
                                {errors.consent && (
                                  <p className="text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.consent}</p>
                                )}
                              </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-[#B88E2F] text-white font-bold rounded-xl hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-3 shadow-lg">Продолжить <ArrowRight size={20} /></button>
                        </form>

                        <AnimatePresence>
                        {isVerifying && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 z-20 flex items-center justify-center"
                            >
                                <div className="bg-white border-2 border-[#B88E2F] p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center">
                                    <h3 className="text-xl font-serif font-bold text-[#051F1F] mb-4">Всё верно?</h3>
                                    
                                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl text-left">
                                        <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Имя</p><p className="font-bold text-[#051F1F] text-lg">{formData.name}</p></div>
                                        <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Контакт ({contactMethod === 'max' ? 'Макс' : contactMethod})</p><p className="font-bold text-[#B88E2F] text-xl">{formData.phone}</p></div>
                                        <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Время</p><p className="font-medium text-[#051F1F]">{formData.preferredTime || 'В ближайшее время'}</p></div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setIsVerifying(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:border-[#B88E2F] hover:text-[#B88E2F] transition-colors flex items-center justify-center gap-2"><Edit2 size={16}/> Изменить</button>
                                        <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-[#051F1F] text-white rounded-xl font-bold hover:bg-[#B88E2F] transition-colors flex items-center justify-center gap-2">{isSubmitting ? '...' : 'Подтвердить'}</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 6. ЭКРАН УСПЕХА */}
                {viewStep === 'success' && orderId && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"><Check size={48} className="text-green-600" /></motion.div>
                        <h3 className="text-3xl font-serif font-bold text-[#051F1F] mb-2">Заказ принят!</h3>
                        <p className="text-gray-500 mb-8">Номер вашего заказа:</p>
                        
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} delay={0.2} className="bg-[#051F1F] text-[#B88E2F] text-2xl md:text-4xl font-mono font-bold py-4 px-8 rounded-2xl mb-6 tracking-widest border border-[#B88E2F]/30 flex items-center gap-4 shadow-xl relative">
                            {orderId}
                            <button 
                                onClick={handleCopyId} 
                                className="p-2 hover:bg-[#B88E2F]/20 rounded-lg transition-colors relative" 
                                title="Скопировать"
                            >
                                {isCopied ? <Check size={24} className="text-green-500" /> : <Copy size={24}/>}
                                {isCopied && (
                                    <motion.span 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] bg-[#B88E2F] text-[#0A2A2A] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap"
                                    >
                                        Скопировано!
                                    </motion.span>
                                )}
                            </button>
                        </motion.div>

                        <div className="flex flex-col gap-3 w-full max-w-sm">
                            <button onClick={handleTrackOrder} className="w-full py-4 bg-[#B88E2F] text-white font-bold rounded-xl hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2 shadow-lg">Отследить статус <ExternalLink size={20} /></button>
                            <button onClick={closeModal} className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:border-[#B88E2F] hover:text-[#B88E2F] transition-colors">Вернуться в каталог</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ИТОГОВАЯ ПАНЕЛЬ */}
            {activeCategory && viewStep === 'form' && (
                <div className="p-5 md:p-8 border-t border-[#B88E2F]/10 bg-[#FDFBF7] shrink-0 z-10 shadow-[0_-10px_40px_rgba(184,142,47,0.1)]">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <div className="text-[10px] text-[#B88E2F] uppercase tracking-widest font-bold flex items-center gap-1 mb-1"><Info size={12} /> Ориентировочно</div>
                            <div className="text-3xl md:text-4xl font-serif font-bold text-[#051F1F]">~ {totalPrice.toLocaleString()} ₽</div>
                        </div>
                    </div>
                    
                    <button onClick={handleGoToOrder} className="w-full py-4 bg-[#051F1F] text-white font-bold rounded-xl hover:bg-[#B88E2F] hover:text-[#051F1F] transition-all flex items-center justify-center gap-3 group shadow-xl">
                        Оформить заявку <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                    
                    <p className="text-[9px] text-gray-400 mt-3 text-center leading-tight">* Не является офертой. Точную смету с доставкой и сборкой подготовит менеджер.</p>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfiguratorModal;