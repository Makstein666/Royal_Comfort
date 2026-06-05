import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Package, CheckCircle2, Clock, Truck, Hammer, ClipboardCheck, 
    ArrowRight, HelpCircle, Phone, History, User, Paintbrush, XCircle 
} from 'lucide-react';
import TrackingSearchModal from '../components/modals/TrackingSearchModal'; 

// --- КОМПОНЕНТ ОТОБРАЖЕНИЯ ШАГА (ПЕРЕНЕСЕН НАВЕРХ) ---
const Step = ({ index, status, icon, title, date, desc }) => {
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    const isError = status === 'error';
    const isPending = status === 'pending';

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex gap-6 items-start ${isPending ? 'opacity-40 grayscale' : 'opacity-100'}`}
        >
            <div className={`
                w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 border-4
                ${isError ? 'bg-red-500 text-white border-red-100 scale-110 shadow-lg' :
                  isCurrent ? 'bg-[#B88E2F] text-white border-[#F5F1E6] scale-110 shadow-lg' : 
                  isCompleted ? 'bg-[#0A2A2A] text-[#B88E2F] border-[#F5F1E6]' : 'bg-white text-gray-300 border-gray-100'}
            `}>
                {React.cloneElement(icon, { size: (isCurrent || isError) ? 22 : 18 })}
            </div>
            <div className="pt-1.5">
                <h4 className={`font-bold leading-none mb-1 ${isError ? 'text-xl text-red-500' : isCurrent ? 'text-xl text-[#0A2A2A]' : 'text-lg text-gray-700'}`}>
                    {title}
                </h4>
                {date && <span className={`text-xs font-bold uppercase tracking-wider ${isError ? 'text-red-400' : 'text-[#B88E2F]'}`}>{date}</span>}
                {desc && !isPending && <p className="text-sm text-gray-500 mt-1 max-w-xs">{desc}</p>}
            </div>
        </motion.div>
    );
};

// --- КОНСТАНТЫ И ХЕЛПЕРЫ ---
const FULL_STEPS_FLOW = [
    { title: "Обработка", statusKey: 'Обработка', icon: <CheckCircle2/>, desc: "Заявка принята в работу." },
    { title: "Обсуждение деталей", statusKey: 'Уточнение деталей', icon: <User/>, desc: "Уточняем параметры проекта." },
    { title: "Утверждение", statusKey: 'Утверждение', icon: <ClipboardCheck/>, desc: "Проект согласован с клиентом." },
    { title: "Производство", statusKey: 'Производство', icon: <Hammer/>, desc: "Изготовление заказа." },
    { title: "Доставка", statusKey: 'Доставка', icon: <Truck/>, desc: "Груз передан в логистику." },
    { title: "Установка", statusKey: 'Установка', icon: <Paintbrush/>, desc: "Монтаж и передача клиенту." }
];

const getStepIndex = (status) => {
    if (!status) return 0;
    const map = {
        'Новый': 0, 'Обработка': 0,
        'Уточнение деталей': 1,
        'Утверждение': 2,
        'Производство': 3,
        'Доставка': 4,
        'Установка': 5,
        'Завершен': 6
    };
    return map[status] !== undefined ? map[status] : 0;
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
const Tracking = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState(null); // Теперь массив!
  const [error, setError] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Состояние для списка активных заявок
  const [recentOrders, setRecentOrders] = useState([]);

  // Загружаем активные заявки при открытии страницы
  useEffect(() => {
      fetch('/api/orders/active')
          .then(res => {
              if (!res.ok) throw new Error('Ошибка сети');
              return res.json();
          })
          .then(data => {
              // Если пришел массив, сохраняем. Если ошибка - пустой массив.
              if (Array.isArray(data)) setRecentOrders(data);
          })
          .catch(err => console.error("Не удалось загрузить активные заявки:", err));
  }, []);

  const handleCheck = async (e, idOverride) => {
    if (e) e.preventDefault();
    const idToCheck = idOverride || orderId;

    if (!idToCheck || idToCheck.length < 3) {
        setError('Введите корректный номер заказа');
        return;
    }
    
    setError('');
    setLoading(true);
    setStatuses(null);
    setOrderId(idToCheck); 

    try {
        const response = await fetch(`/api/orders/${idToCheck}`);
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Заказ не найден');
        }

        const dataArray = await response.json(); // Теперь получаем массив
        
        const mappedStatuses = dataArray.map(data => {
            const isCancelled = data.status === 'Отменен';
            const isCompleted = data.status === 'Завершен';
            const currentIndex = getStepIndex(data.status);

            const uiHistory = FULL_STEPS_FLOW.map((step, index) => {
                let stepStatus = 'pending';
                let stepDate = null;

                if (index < currentIndex || isCompleted) stepStatus = 'completed';
                else if (index === currentIndex && !isCompleted && !isCancelled) stepStatus = 'current';

                if (data.history && Array.isArray(data.history)) {
                     const historyItem = data.history.find(h => h.title === step.statusKey || h.title === step.title);
                     if (historyItem) stepDate = historyItem.date;
                }
                if (index === 0 && data.date) {
                     stepDate = new Date(data.date).toLocaleDateString('ru-RU');
                }

                return { ...step, status: stepStatus, date: stepDate };
            });

            const totalSteps = FULL_STEPS_FLOW.length - 1;
            const progressPercent = isCompleted ? 100 : (totalSteps > 0 ? Math.round((currentIndex / totalSteps) * 100) : 0);

            return {
                id: data.id,
                product: data.product,
                manager: data.manager || 'Отдел заботы',
                phone: '+7 (925) 520-40-53',
                estimatedDate: isCancelled ? 'Отменен' : isCompleted ? 'Успешно завершен' : data.status,
                isCancelled: isCancelled,
                isCompleted: isCompleted,
                history: uiHistory,
                progressPercent: isCancelled ? 0 : progressPercent
            };
        });

        setStatuses(mappedStatuses);

    } catch (err) {
        console.error(err);
        setError(err.message || 'Заказ с таким номером не найден. Проверьте ввод.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E6] pt-28 md:pt-32 pb-12 px-4 md:px-8 flex flex-col md:flex-row gap-8 items-start relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B88E2F]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      {/* ЛЕВАЯ КОЛОНКА */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 space-y-6">
          
          {/* БЛОК АКТИВНЫХ ЗАЯВОК */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#B88E2F]/10">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0A2A2A] rounded-full flex items-center justify-center text-[#B88E2F]">
                      <History size={20} />
                  </div>
                  <div>
                      <h3 className="font-serif font-bold text-[#0A2A2A] leading-tight">Активные заявки</h3>
                      <p className="text-xs text-gray-400">Последние обновления</p>
                  </div>
              </div>
              
              <div className="space-y-3">
                  {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                          <div 
                              key={order.id}
                              onClick={(e) => handleCheck(e, order.id)}
                              className="group p-4 rounded-2xl bg-[#FDFBF7] border border-gray-100 hover:border-[#B88E2F] cursor-pointer transition-all hover:shadow-md relative overflow-hidden"
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold bg-white px-2 py-1 rounded border border-gray-100 text-gray-500">{order.id}</span>
                                  <span className="text-[10px] text-gray-400">{order.date}</span>
                              </div>
                              <h4 className="font-bold text-[#0A2A2A] text-sm mb-1 group-hover:text-[#B88E2F] transition-colors">{order.product}</h4>
                              <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                  <span className="text-xs font-medium text-green-600">{order.status}</span>
                              </div>
                              <ArrowRight size={16} className="absolute right-4 bottom-4 text-gray-300 group-hover:text-[#B88E2F] transform group-hover:translate-x-1 transition-all" />
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                          Нет активных заказов в работе.
                      </div>
                  )}
              </div>
          </div>

          {/* БЛОК "ЗАБЫЛИ НОМЕР?" */}
          <div className="bg-[#0A2A2A] p-6 rounded-3xl shadow-xl relative overflow-hidden text-center text-white">
              <div className="relative z-10">
                  <HelpCircle size={32} className="mx-auto mb-4 text-[#B88E2F]" />
                  <h3 className="font-serif font-bold text-lg mb-2">Забыли номер?</h3>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                      Не проблема. Найдем ваш заказ по номеру телефона.
                  </p>
                  <button 
                      onClick={() => setIsSearchModalOpen(true)}
                      className="w-full py-3 bg-[#B88E2F] text-[#0A2A2A] font-bold rounded-xl hover:bg-white transition-all shadow-lg text-sm cursor-pointer relative z-20"
                  >
                      Найти заказ
                  </button>
              </div>
          </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА (ПОИСК И РЕЗУЛЬТАТЫ) */}
      <div className="flex-1 w-full">
          <div className="mb-8 md:mb-12 md:text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0A2A2A] mb-4">
                  Отслеживание <span className="text-[#B88E2F]">статуса</span>
              </h1>
              <p className="text-gray-500 max-w-xl md:mx-auto">
                  Введите уникальный номер заказа, который вы получили при оформлении.
              </p>
          </div>

          <form onSubmit={(e) => handleCheck(e)} className="relative w-full max-w-4xl mx-auto mb-12 group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className={`transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#B88E2F]'}`} size={24} />
              </div>
              <input 
                  type="text" 
                  placeholder="Например: RC-2505-XXXX"
                  className={`w-full py-5 md:py-6 pl-14 md:pl-16 pr-16 md:pr-36 rounded-[2rem] bg-white border-2 shadow-xl text-base md:text-lg font-bold text-[#0A2A2A] placeholder:text-gray-300 placeholder:font-normal outline-none transition-all
                      ${error ? 'border-red-100 focus:border-red-400' : 'border-white focus:border-[#B88E2F]'}
                  `}
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
              />
              <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-2 md:right-3 top-2 md:top-3 bottom-2 md:bottom-3 aspect-square md:aspect-auto md:px-8 bg-[#0A2A2A] text-[#B88E2F] font-bold rounded-full md:rounded-[1.5rem] hover:bg-[#B88E2F] hover:text-[#0A2A2A] transition-all disabled:opacity-80 disabled:cursor-wait flex items-center justify-center shadow-lg"
              >
                  {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 
                  <>
                    <Search size={20} className="md:hidden" />
                    <span className="hidden md:inline">Проверить</span>
                  </>}
              </button>
              {error && <p className="absolute -bottom-6 left-8 text-red-500 text-xs font-bold animate-pulse">{error}</p>}
          </form>

          {/* РЕЗУЛЬТАТ ПОИСКА */}
          <AnimatePresence mode="wait">
            {statuses && statuses.length > 0 && (
                <div className="space-y-8">
                    {statuses.length > 1 && (
                        <h3 className="text-xl font-bold text-[#0A2A2A] mb-4">Найдено заказов: {statuses.length}</h3>
                    )}
                    {statuses.map((statusItem, idx) => (
                        <motion.div 
                            key={`status-card-${statusItem.id}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl border border-[#B88E2F]/10 overflow-hidden"
                        >
                            <div className={`${statusItem.isCancelled ? 'bg-red-900' : statusItem.isCompleted ? 'bg-green-900' : 'bg-[#0A2A2A]'} p-8 md:p-10 text-white relative overflow-hidden transition-colors duration-500`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-xs font-bold tracking-widest uppercase mb-4 border border-white/5">
                                            <Package size={14} className={statusItem.isCancelled ? "text-red-300" : "text-[#B88E2F]"}/> Заказ #{statusItem.id}
                                        </div>
                                        <h2 className="text-3xl font-serif font-bold mb-2">{statusItem.product}</h2>
                                        <p className="text-white/60 text-sm">Ваш менеджер: <span className="text-white">{statusItem.manager}</span></p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${statusItem.isCancelled ? 'text-red-300' : 'text-[#B88E2F]'}`}>
                                            {statusItem.isCancelled || statusItem.isCompleted ? 'Статус' : 'Текущий этап'}
                                        </p>
                                        <div className="text-2xl font-bold">{statusItem.estimatedDate}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                {statusItem.isCancelled ? (
                                     <div className="text-center py-10">
                                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-gray-800">Заказ аннулирован</h3>
                                        <p className="text-gray-500 mt-2">Если это ошибка, свяжитесь с менеджером.</p>
                                     </div>
                                ) : (
                                    <div className="relative pl-4 md:pl-6 space-y-10">
                                        <div className="absolute left-[23px] md:left-[31px] top-4 bottom-4 w-0.5 bg-gray-100">
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${statusItem.progressPercent}%` }}
                                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                                className={`w-full ${statusItem.isCompleted ? 'bg-green-500' : 'bg-[#B88E2F]'} origin-top`}
                                            />
                                        </div>

                                        {statusItem.history.map((step, index) => (
                                            <Step 
                                                key={index} 
                                                index={index} 
                                                status={step.status}
                                                icon={step.icon} 
                                                title={step.title} 
                                                desc={step.desc}
                                                date={step.date}
                                            />
                                        ))}
                                    </div>
                                )}

                                {!statusItem.isCancelled && !statusItem.isCompleted && (
                                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                                        <div className="hidden md:block text-xs text-gray-400">
                                            Есть вопросы по заказу?
                                        </div>
                                        <a href={`tel:${statusItem.phone}`} className="flex items-center gap-3 px-6 py-3 bg-[#FDFBF7] text-[#0A2A2A] font-bold rounded-xl hover:bg-[#B88E2F] hover:text-white transition-all group">
                                            <Phone size={18} className="text-[#B88E2F] group-hover:text-white transition-colors"/>
                                            Связаться с менеджером
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
          </AnimatePresence>
      </div>

      <TrackingSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
};

export default Tracking;