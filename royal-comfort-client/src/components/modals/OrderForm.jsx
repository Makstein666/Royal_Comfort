import React, { useState } from 'react';
import { useConfigurator } from '../../context/ConfiguratorContext';
import { Check, ChevronLeft, X, Phone, User, Clock, MessageSquare } from 'lucide-react';

const OrderForm = ({ onBack, onClose }) => {
  const { configuration, totalPrice, configData } = useConfigurator();

  const [formData, setFormData] = useState({
    name: '',
    phone: '+7',
    comment: '',
    time: 'Как можно скорее'
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Форматирование телефона с автопрефиксом +7 ---
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
      setFormData({ ...formData, phone: '+7' });
      return;
    }
    setFormData({ ...formData, phone: formatPhone(raw) });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Валидация ---
  const validate = (data) => {
    const errs = {};
    if (!data.name || data.name.trim().length < 2) {
      errs.name = 'Введите ваше имя (минимум 2 символа)';
    }
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 11) {
      errs.phone = 'Введите полный номер телефона (+7 и 10 цифр)';
    }
    // Комментарий — необязательный, не валидируем
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          clientName: formData.name,
          clientPhone: formData.phone,
          preferredTime: formData.time,
          contactMethod: 'phone',
          productId: configData?.id || null,
          productName: configData?.name || 'Индивидуальный заказ',
          totalPrice: totalPrice,
          configuration: configuration,
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Заявка принята! Ваш номер заказа: ${result.orderId}`);
        if (onClose) onClose();
      } else {
        alert('Ошибка при отправке заявки. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Нет соединения с сервером.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedOptionName = (group) => {
    const selectedId = configuration[group.id];
    if (group.type === 'multiple') {
      if (!selectedId || selectedId.length === 0) return null;
      return selectedId.map(id => {
        const opt = group.options.find(o => o.id === id);
        return opt ? opt.name : null;
      }).filter(Boolean).join(', ');
    }
    const option = group.options.find(o => o.id === selectedId);
    return option ? option.name : 'Не выбрано';
  };

  const inputClass = (field) =>
    `w-full p-4 pl-11 bg-white border rounded-xl focus:outline-none focus:ring-1 transition-colors shadow-sm text-sm text-[#0A2A2A] placeholder:text-gray-300 ${
      touched && errors[field]
        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
        : 'border-gray-200 focus:border-[#B88E2F] focus:ring-[#B88E2F]'
    }`;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Шапка формы */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-royal-900">Оформление заявки</h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

        {/* Сводка конфигурации */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ваша комплектация</h3>
          <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
            <span className="text-gray-500">Базовая стоимость:</span>
            <span className="font-medium">{configData.basePrice.toLocaleString()} ₽</span>
          </div>
          <ul className="space-y-2 text-sm mb-4">
            {configData.groups && configData.groups.map(group => {
              const valueName = getSelectedOptionName(group);
              if (!valueName) return null;
              return (
                <li key={group.id} className="flex justify-between items-start">
                  <span className="text-gray-500 font-medium">{group.title}:</span>
                  <span className="text-royal-900 font-bold text-right max-w-[60%]">{valueName}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-lg font-bold text-royal-900">Итого к оплате:</span>
            <span className="text-2xl font-bold text-gold-600">{totalPrice.toLocaleString()} ₽</span>
          </div>
        </div>

        {/* Подпись об обязательных полях */}
        <p className="text-xs text-gray-400 mb-5">
          Поля, отмеченные <span className="text-red-500 font-bold">*</span>, обязательны для заполнения
        </p>

        {/* Форма */}
        <form id="order-form" onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Имя */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Ваше имя <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={16} />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Иван Иванов"
                className={inputClass('name')}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {touched && errors.name && (
              <p className="text-red-500 text-xs mt-1 pl-1">{errors.name}</p>
            )}
          </div>

          {/* Телефон */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Номер телефона <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={16} />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="+7 (___) ___-__-__"
                className={inputClass('phone')}
                value={formData.phone}
                onChange={handlePhoneChange}
              />
            </div>
            {touched && errors.phone && (
              <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone}</p>
            )}
          </div>

          {/* Время звонка */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Удобное время для звонка <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Clock size={16} />
              </div>
              <select
                name="time"
                className="w-full p-4 pl-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors shadow-sm appearance-none text-sm text-[#0A2A2A]"
                value={formData.time}
                onChange={handleChange}
              >
                <option>Как можно скорее</option>
                <option>Утром (9:00 - 12:00)</option>
                <option>Днем (12:00 - 17:00)</option>
                <option>Вечером (17:00 - 21:00)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1L5 5L9 1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Комментарий (необязательный) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Комментарий к заказу <span className="text-gray-300 font-normal normal-case">(необязательно)</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-4 text-gray-400">
                <MessageSquare size={16} />
              </div>
              <textarea
                name="comment"
                placeholder="Пожелания по размеру, материалам, доставке..."
                rows="3"
                className="w-full p-4 pl-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-colors resize-none shadow-sm text-sm text-[#0A2A2A] placeholder:text-gray-300"
                value={formData.comment}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Футер */}
      <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-20">
        <button
          type="submit"
          form="order-form"
          disabled={isSubmitting}
          className="w-full py-4 bg-royal-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-royal-900 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
        >
          <Check size={20} />
          {isSubmitting ? 'Отправка...' : 'Подтвердить заказ'}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-3">
          Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
        </p>
      </div>
    </div>
  );
};

export default OrderForm;