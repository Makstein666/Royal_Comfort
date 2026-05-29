import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen py-20 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#B88E2F]/10 text-[#B88E2F] rounded-full mb-6"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-[#0A2A2A] mb-6 leading-tight"
          >
            Политика <br />
            <span className="text-[#B88E2F]">конфиденциальности</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Мы ценим ваше доверие и серьезно относимся к защите ваших личных данных.
            В этом документе мы прозрачно описываем, как мы собираем, используем и защищаем вашу информацию.
          </motion.p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#B88E2F]/10">
          
          <div className="prose prose-lg prose-[#0A2A2A] max-w-none">
            
            <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-bold">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">1.</span> Общие положения
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Настоящая Политика конфиденциальности персональных данных (далее – Политика конфиденциальности) действует в отношении всей информации, которую интернет-магазин «Royal Comfort», расположенный на доменном имени royal-comfort.ru, может получить о Пользователе во время использования сайта интернет-магазина, программ и продуктов интернет-магазина.
            </p>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">2.</span> Сбор и использование информации
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Мы собираем следующие данные при оформлении заказа или заполнении форм обратной связи:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6 ml-4">
              <li>Фамилия, Имя, Отчество</li>
              <li>Контактный номер телефона</li>
              <li>Адрес электронной почты (e-mail)</li>
              <li>Адрес доставки Товара</li>
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
               <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <div className="bg-[#B88E2F]/10 p-3 rounded-xl text-[#B88E2F] shrink-0">
                     <Lock size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-[#0A2A2A] mb-2">Безопасность</h4>
                     <p className="text-sm text-gray-500">Ваши данные передаются по защищенному протоколу и хранятся на защищенных серверах.</p>
                  </div>
               </div>
               <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <div className="bg-[#B88E2F]/10 p-3 rounded-xl text-[#B88E2F] shrink-0">
                     <Eye size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-[#0A2A2A] mb-2">Никакого спама</h4>
                     <p className="text-sm text-gray-500">Мы не передаем ваши данные третьим лицам для рекламных рассылок.</p>
                  </div>
               </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">3.</span> Цели сбора персональной информации
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Персональные данные Пользователя Администрация сайта интернет-магазина может использовать в целях:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6 ml-4">
              <li>Идентификации Пользователя для оформления заказа и (или) заключения Договора купли-продажи.</li>
              <li>Установления с Пользователем обратной связи, включая направление уведомлений, запросов, касающихся использования Сайта.</li>
              <li>Определения места нахождения Пользователя для обеспечения безопасности, предотвращения мошенничества.</li>
              <li>Подтверждения достоверности и полноты персональных данных.</li>
              <li>Уведомления Пользователя Сайта о состоянии Заказа.</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">4.</span> Защита данных
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Администрация сайта принимает необходимые организационные и технические меры для защиты персональной информации Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий третьих лиц.
            </p>

            <div className="bg-[#0A2A2A] text-white p-8 rounded-2xl mt-12 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                    <Server size={180} />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3 relative z-10">Остались вопросы?</h3>
                <p className="text-gray-400 mb-6 relative z-10 max-w-lg">
                    Если у вас есть вопросы по поводу нашей политики конфиденциальности, пожалуйста, свяжитесь с нами.
                </p>
                <a href="mailto:mr.cristov@mail.ru" className="inline-block px-6 py-3 bg-[#B88E2F] hover:bg-white hover:text-[#0A2A2A] text-[#0A2A2A] font-bold rounded-xl transition-all relative z-10 shadow-lg">
                    Написать нам
                </a>
            </div>

          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
            <Link to="/" className="inline-flex items-center justify-center text-[#B88E2F] hover:text-[#0A2A2A] font-bold tracking-widest uppercase text-sm transition-colors group">
                <span className="border-b-2 border-transparent group-hover:border-[#B88E2F] pb-1 transition-all">
                    Вернуться на главную
                </span>
            </Link>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
