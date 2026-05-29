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
            Политика в отношении <br />
            <span className="text-[#B88E2F]">обработки персональных данных</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных».
          </motion.p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#B88E2F]/10">
          
          <div className="prose prose-lg prose-[#0A2A2A] max-w-none text-gray-600">
            
            <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-bold">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">1.</span> Общие положения
            </h2>
            <p className="leading-relaxed mb-6">
              1.1. Настоящая политика обработки персональных данных определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных ИП Кристова Галина Дмитриевна (далее – Оператор).<br/>
              1.2. Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.<br/>
              1.3. Настоящая политика Оператора применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта <strong>https://royal-comfort-store.ru</strong>.
            </p>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">2.</span> Обрабатываемые данные
            </h2>
            <p className="leading-relaxed mb-4">
              Оператор может обрабатывать следующие персональные данные Пользователя:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>Фамилия, имя, отчество;</li>
              <li>Электронный адрес;</li>
              <li>Номера телефонов;</li>
              <li>Сообщения, направленные Пользователем через формы обратной связи для оформления заказа, уточнения деталей или получения консультаций по продукции;</li>
              <li>Обезличенные данные о посетителях (в т.ч. файлы «cookie») с помощью сервисов интернет-статистики (Яндекс Метрика, Google Analytics и др.).</li>
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
               <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <div className="bg-[#B88E2F]/10 p-3 rounded-xl text-[#B88E2F] shrink-0">
                     <Lock size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-[#0A2A2A] mb-2">Надежность</h4>
                     <p className="text-sm text-gray-500">Мы обеспечиваем сохранность данных и исключаем к ним доступ неуполномоченных лиц.</p>
                  </div>
               </div>
               <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <div className="bg-[#B88E2F]/10 p-3 rounded-xl text-[#B88E2F] shrink-0">
                     <Eye size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-[#0A2A2A] mb-2">Конфиденциальность</h4>
                     <p className="text-sm text-gray-500">Данные никогда не передаются третьим лицам, за исключением случаев, предусмотренных законом.</p>
                  </div>
               </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">3.</span> Цели обработки персональных данных
            </h2>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>Информирование Пользователя посредством телефонных звонков и электронных писем;</li>
              <li>Заключение, исполнение и прекращение гражданско-правовых договоров;</li>
              <li>Предоставление доступа Пользователю к сервисам, информации и материалам, содержащимся на веб-сайте, а также уточнение деталей заказа;</li>
              <li>Улучшение качества веб-сайта и его содержания (на основе обезличенных данных).</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">4.</span> Правовые основания обработки
            </h2>
            <p className="leading-relaxed mb-6">
              Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы на сайте. Заполняя формы, Пользователь выражает свое согласие с данной Политикой.
            </p>

            <h2 className="text-2xl font-serif font-bold text-[#0A2A2A] mt-10 mb-4 flex items-center gap-3">
              <span className="text-[#B88E2F]">5.</span> Заключительные положения
            </h2>
            <p className="leading-relaxed mb-6">
              5.1. Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору с помощью электронной почты <strong>mr.cristov@mail.ru</strong> или по телефону <strong>8 (925) 520-40-53</strong>.<br/>
              5.2. Ответственным лицом за организацию обработки персональных данных является <strong>Кристов Иван Иванович</strong>.<br/>
              5.3. Актуальная версия Политики в свободном доступе расположена в сети Интернет по адресу <strong>https://royal-comfort-store.ru/privacy</strong>.
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
