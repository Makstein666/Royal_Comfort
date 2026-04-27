import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Send, MessageCircle, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { useConfigurator } from '../../context/ConfiguratorContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { openModal } = useConfigurator();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollLink = (e, targetId) => {
    if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  const contactInfo = {
    address: "Челябинская обл, Коркино, ул 1мая 64",
    phoneDisplay: "+7 (925) 520-40-53",
    phoneLink: "tel:+79255204053",
    email: "mr.cristov@mail.ru",
    telegramLink: "https://t.me/John_Kristov",
    telegramName: "@John_Kristov",
    whatsappLink: "https://wa.me/79255204053"
  };

  return (
    <footer id="contacts" className="bg-[#051F1F] text-white pt-16 pb-8 border-t border-[#B88E2F]/20 mt-auto">
      <div className="container mx-auto px-6 md:px-8">
        
        {/* ОСНОВНАЯ СЕТКА */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">

          {/* 1. ЛОГОТИП */}
          <div className="flex flex-col gap-6">
            <div className="scale-100 origin-left">
                <Logo /> 
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Создаем уют и комфорт премиум-класса. Индивидуальные решения для вашего загородного отдыха.
            </p>
            
            <div className="flex gap-4 mt-auto">
              <a href={contactInfo.telegramLink} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#B88E2F] hover:text-[#051F1F] transition-all group">
                <Send size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href={contactInfo.whatsappLink} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#B88E2F] hover:text-[#051F1F] transition-all group">
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* 2. КАТАЛОГ */}
          <div>
            <h4 className="text-[#B88E2F] font-bold tracking-widest uppercase mb-6 text-xs">Каталог</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors flex items-center gap-2">
                  Все товары
                </Link>
              </li>
              <li>
                {/* ИСПРАВЛЕНО ЗДЕСЬ: */}
                <button 
                  onClick={() => openModal()} // Вызываем строго без аргументов, чтобы открылся выбор категорий
                  className="hover:text-white transition-colors flex items-center gap-2 group text-[#B88E2F] font-medium text-left"
                >
                  Конфигуратор 
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </li>
            </ul>
          </div>

          {/* 3. ПОКУПАТЕЛЯМ */}
          <div>
            <h4 className="text-[#B88E2F] font-bold tracking-widest uppercase mb-6 text-xs">Покупателям</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li>
                  <Link to="/#about" onClick={(e) => handleScrollLink(e, 'about')} className="hover:text-white transition-colors">
                      О бренде
                  </Link>
              </li>
              <li>
                  <Link to="/#delivery" onClick={(e) => handleScrollLink(e, 'delivery')} className="hover:text-white transition-colors">
                      Доставка и установка
                  </Link>
              </li>
              <li>
                  <Link to="/#warranty" onClick={(e) => handleScrollLink(e, 'warranty')} className="hover:text-white transition-colors">
                      Гарантия качества
                  </Link>
              </li>
            </ul>
          </div>

          {/* 4. КОНТАКТЫ (Инфо) */}
          <div>
            <h4 className="text-[#B88E2F] font-bold tracking-widest uppercase mb-6 text-xs">Контакты</h4>
            <ul className="space-y-5 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#B88E2F] shrink-0 mt-0.5" size={18} />
                <span className="leading-tight">{contactInfo.address}</span>
              </li>
              
              <li className="flex items-center gap-3">
                <Phone className="text-[#B88E2F] shrink-0" size={18} />
                <a href={contactInfo.phoneLink} className="hover:text-white transition-colors font-medium">
                  {contactInfo.phoneDisplay}
                </a>
              </li>
              
              <li className="flex items-center gap-3">
                <Mail className="text-[#B88E2F] shrink-0" size={18} />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-white transition-colors">
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* НИЖНЯЯ ЧАСТЬ */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500 order-2 md:order-1">
            &copy; {currentYear} Royal Comfort. Все права защищены.
          </p>
          <div className="flex flex-wrap justify-center gap-6 order-1 md:order-2">
            <a href="#" className="text-sm text-gray-400 hover:text-[#B88E2F] hover:underline underline-offset-4 transition-all">
                Договор оферты
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-[#B88E2F] hover:underline underline-offset-4 transition-all">
                Политика конфиденциальности
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;