import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, SlidersHorizontal, ArrowLeft, Star, ArrowRight, Hammer, Settings, Plus, Loader2, Info, ArrowUpRight } from "lucide-react";
import { useConfigurator } from "../context/ConfiguratorContext";
import SidebarFilters from "../components/catalog/SidebarFilters";
import ProductCard from "../components/catalog/ProductCard";
import CategoryCard from "../components/catalog/CategoryCard";
import ConfiguratorModal from "../components/modals/ConfiguratorModal";
import ProductDetailsModal from "../components/modals/ProductDetailsModal";
import ReviewModal from "../components/modals/ReviewModal";
import ReviewsSection from "../components/catalog/ReviewsSection"; 
import CustomProjectModal from "../components/modals/CustomProjectModal";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8); 
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const loadMoreRef = useRef(null);
  
  // Состояния для модальных окон
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Модал для кастомного проекта / предзаказа
  // categoryName = null => "Индивидуальный проект", categoryName = "Бани" => предзаказ для Бань
  const [customProjectCategory, setCustomProjectCategory] = useState(null); // null = закрыт, string = открыт с именем категории
  
  const { openModal, products, categories, isLoading } = useConfigurator();

  const getInitialFilters = () => ({
    search: searchParams.get("search") || "",
    categories: searchParams.getAll("categories") || [],
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "popular",
  });

  const [filters, setFilters] = useState(getInitialFilters);
  
  const isCategoryView = filters.categories.length === 0 && !filters.search;
  const currentCategoryId = filters.categories.length === 1 ? filters.categories[0] : null;
  const isFlagship = currentCategoryId === 'tub';

  const getCategoryName = (id) => {
      const cat = categories.find(c => c.id === id);
      return cat ? cat.name : 'Проект';
  };

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.categories.length > 0) params.categories = filters.categories;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    let result = products ? [...products] : [];
    
    if (filters.search) result = result.filter((p) => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.categories.length > 0) result = result.filter((p) => filters.categories.includes(p.categoryId));
    if (filters.minPrice) result = result.filter((p) => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter((p) => p.price <= Number(filters.maxPrice));

    if (filters.sort === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price_desc") result.sort((a, b) => b.price - a.price);
    else if (filters.sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredProducts(result);
  }, [filters, products]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setVisibleCount((prev) => prev + 4);
      }, { threshold: 1.0 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => { if (loadMoreRef.current) observer.unobserve(loadMoreRef.current); };
  }, [filteredProducts]);

  const handleCategoryClick = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    // Если категория активна — открываем её каталог
    // Если нет (isActive: false) — открываем модал подачи проекта
    if (cat && !cat.isActive) {
      setCustomProjectCategory(cat.name);
      return;
    }
    setFilters({ ...filters, categories: [categoryId] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComingSoonClick = (category) => {
    // Все "скоро" категории → модал подачи проекта для этой категории
    setCustomProjectCategory(category.name);
  };

  const handleResetFilters = () => {
    setFilters({
      ...getInitialFilters(),
      categories: filters.categories.length === 1 ? filters.categories : [], // Сохраняем категорию, если она одна выбрана
      search: ""
    });
  };

  const handleBackToCategories = () => {
    setFilters({ ...getInitialFilters(), categories: [], search: "" });
  };

  const handleQuickOrder = (arg1, arg2, arg3) => { 
      if (typeof arg1 === 'object' && arg1 !== null) {
          if (arg1.id === 'custom_card') {
              openModal(arg1.category, null); 
              return;
          }
          openModal(arg1.categoryId, arg1);
          return;
      }
      const categoryId = arg1; 
      const product = arg3;
      openModal(categoryId, product);
  };

  const handleShowDetails = (product) => {
      if (product.id === 'custom_card') {
          openModal(product.category, null);
          return;
      }
      setSelectedProductForDetails(product);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F1E6]">
            <Loader2 className="animate-spin text-gold-500" size={48} />
        </div>
    );
  }

  const currentCategoryObj = categories.find(c => c.id === currentCategoryId);

  return (
    <div className="min-h-screen bg-[#F5F1E6] pt-28 md:pt-32 pb-20 text-royal-950">
      <div className="w-full px-4 md:px-8 mb-12">
        
        {/* HERO БЛОК */}
        <div className={`relative w-full rounded-[3rem] overflow-hidden transition-all duration-500 flex flex-col justify-center group
            ${isFlagship 
                ? 'min-h-[500px] shadow-[0_0_60px_-15px_rgba(184,142,47,0.4)] border border-[#B88E2F]/60' 
                : 'min-h-[350px] shadow-2xl border border-[#B88E2F]/20'
            }
        `}>
            <div className="absolute inset-0 bg-[#F5F1E6]" /> 
            <div className="absolute inset-0 bg-[#0A2A2A]/40 z-[1]" /> 
            
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[4s] group-hover:scale-105"
                style={{ 
                    backgroundImage: `url(${
                        !isCategoryView && currentCategoryObj 
                            ? currentCategoryObj.image 
                            : '/placeholder.jpg' 
                    })` 
                }}
            />

            <div className={`absolute inset-0 bg-gradient-to-r via-[#0A2A2A]/80 to-transparent transition-colors duration-500
                ${isFlagship ? 'from-[#0A2A2A]' : 'from-[#0A2A2A]/95'}
            `} />
            <div className="absolute inset-0 bg-[url('/placeholder.jpg')] opacity-20 mix-blend-overlay"></div>
            
            {isFlagship && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#B88E2F]/10 to-transparent mix-blend-overlay pointer-events-none"></div>
            )}

            <div className="relative z-10 px-8 md:px-16 py-12 max-w-4xl">
                
                {(isCategoryView || isFlagship) && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#B88E2F]/40 bg-[#0A2A2A]/40 backdrop-blur-md mb-6 shadow-lg">
                        <Star size={12} className="text-[#B88E2F] fill-[#B88E2F] animate-pulse" /> 
                        <span className="text-[#B88E2F] text-[10px] font-bold uppercase tracking-[0.25em]">
                            Флагманское направление
                        </span>
                    </div>
                )}
                
                <h1 className={`font-serif font-medium text-white mb-6 leading-tight drop-shadow-xl
                    ${isFlagship ? 'text-5xl md:text-7xl' : 'text-4xl md:text-6xl'}
                `}>
                    {isCategoryView ? (
                        "Сибирские Банные Чаны"
                    ) : (
                        <span>
                           {currentCategoryObj ? currentCategoryObj.name : 'Каталог проектов'}
                        </span>
                    )}
                </h1>
                
                <div className={`border-l-2 pl-8 transition-all duration-300
                    ${isFlagship ? 'border-[#B88E2F] bg-gradient-to-r from-[#B88E2F]/5 to-transparent' : 'border-[#B88E2F]/40'}
                `}>
                    <p className="text-gray-200 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-4">
                        {isCategoryView 
                            ? "Собственное производство. Цены указаны ориентировочно для базовых комплектаций." 
                            : (currentCategoryId === 'sauna' ? "Проектируем и строим бани по индивидуальным размерам. Цены на сайте — ориентировочные." :
                            currentCategoryId === 'gazebo' ? "Беседки и зоны отдыха под ваш ландшафт. Точную смету рассчитает менеджер." :
                            "Выберите модель для предварительного расчета бюджета. Не является офертой.")
                        }
                    </p>
                    <div className="flex items-center gap-2 text-[#B88E2F] text-xs font-medium uppercase tracking-wider opacity-80">
                        <Info size={14} /> Точный расчет — только через менеджера
                    </div>
                </div>
            </div>
        </div>

      </div>

      <div className="w-full px-4 md:px-8">
        
        {isCategoryView ? (
            // --- НОВАЯ СЕТКА КАТЕГОРИЙ (BENTO GRID) ---
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. ГЛАВНАЯ КАРТОЧКА (ЧАНЫ) */}
                <div 
                    onClick={() => handleCategoryClick('tub')}
                    className="col-span-1 md:col-span-2 lg:row-span-2 relative h-[500px] lg:h-auto rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-2xl border border-[#B88E2F]/20 hover:border-[#B88E2F] transition-all duration-500 isolate [transform:translateZ(0)]"
                >
                    {/* Фон с картинкой */}
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105" style={{ backgroundImage: `url('/images/chan.jpg')` }} />
                    
                    {/* Градиенты */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051F1F] via-[#051F1F]/20 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#051F1F]/80 to-transparent" />

                    {/* Контент */}
                    <div className="absolute inset-0 p-10 md:p-14 flex flex-col justify-end items-start z-10">
                        <div className="mb-auto">
                             <span className="bg-[#B88E2F] text-[#051F1F] text-xs font-bold px-4 py-1.5 uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 w-fit mb-4">
                                <Star size={12} fill="currentColor" /> Хит продаж
                            </span>
                        </div>

                        <h3 className="text-5xl md:text-7xl font-serif font-medium text-white mb-6 leading-none drop-shadow-lg group-hover:text-[#B88E2F] transition-colors">
                            Банные Чаны
                        </h3>
                        <p className="text-gray-300 text-lg mb-8 max-w-md font-light leading-relaxed">
                            Флагманское направление. Лиственница класса А (без сучков) и пищевая нержавеющая сталь.
                        </p>

                        <button className="px-10 py-5 bg-[#B88E2F] text-[#051F1F] font-bold rounded-2xl hover:bg-white transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 group-hover:pl-12 duration-300">
                            Выбрать комплектацию <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* 2. ОСТАЛЬНЫЕ КАРТОЧКИ */}
                {categories.filter(c => c.id !== 'tub').map(category => {
                    // Карточка "Индивидуальный проект" — без фото, особый стиль
                    if (category.id === 'custom') return (
                        <div
                            key={category.id}
                            onClick={() => setCustomProjectCategory('')}
                            className="group relative h-[320px] rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-[#0A2A2A] to-[#1a4040] shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(184,142,47,0.3)] border border-[#B88E2F]/30 hover:border-[#B88E2F] isolate [transform:translateZ(0)]"
                        >
                            <div className="absolute inset-0 bg-[url('/placeholder.jpg')] opacity-10 mix-blend-overlay" />
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#B88E2F]/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#B88E2F]/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
                                <h3 className="text-3xl font-serif font-medium text-white mb-2 leading-tight group-hover:text-[#B88E2F] transition-colors duration-300">
                                    {category.name}
                                </h3>
                                <div className="w-12 h-[2px] bg-[#B88E2F] mb-4 origin-left transition-all duration-300 group-hover:w-full opacity-70" />
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-gray-400 text-xs font-medium uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        Настроить под себя
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-[#B88E2F]/20 flex items-center justify-center text-[#B88E2F] group-hover:bg-[#B88E2F] group-hover:text-[#051F1F] transition-all duration-300">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                    return (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onClick={handleCategoryClick}
                            isComingSoon={!category.isActive}
                        />
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="hidden lg:block w-80 flex-shrink-0 sticky top-32 transition-all duration-300">
                    <SidebarFilters categories={categories} filters={filters} setFilters={setFilters} onReset={handleResetFilters} isOpen={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} />
                </div>
                
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-center mb-8">
                         <button 
                            onClick={handleBackToCategories} 
                            className="flex items-center gap-2 text-[#B88E2F] font-bold hover:text-[#0A2A2A] transition-all bg-white/50 px-4 py-2 rounded-xl border border-[#B88E2F]/20 shadow-sm"
                        >
                            <ArrowLeft size={20} /> К выбору категорий
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.slice(0, visibleCount).map((product) => (
                            <ProductCard key={product.id} product={product} onQuickOrder={handleQuickOrder} onShowDetails={handleShowDetails} />
                        ))}
                        
                        {currentCategoryId && (
                            <div 
                                onClick={() => handleQuickOrder({ id: 'custom_card', category: currentCategoryId })}
                                className="group relative bg-gradient-to-br from-[#0A2A2A] to-[#1a3a3a] rounded-[2rem] overflow-hidden cursor-pointer flex flex-col h-full min-h-[400px] md:min-h-[450px] items-center justify-center text-center p-6 md:p-8 border-2 border-[#B88E2F] hover:border-[#D4AF37] transition-all duration-500 shadow-[0_0_40px_rgba(184,142,47,0.2)] hover:shadow-[0_0_60px_rgba(184,142,47,0.4)] hover:-translate-y-2 isolate [transform:translateZ(0)]"
                            >
                                <div className="absolute inset-0 bg-[url('/placeholder.jpg')] opacity-20 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88E2F]/10 rounded-full blur-[100px] pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B88E2F]/10 rounded-full blur-[100px] pointer-events-none"></div>
                                
                                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#B88E2F] to-[#9A7624] flex items-center justify-center mb-8 shadow-[0_0_25px_rgba(184,142,47,0.6)] group-hover:scale-110 transition-transform duration-500">
                                    <Settings size={36} className="text-[#0A2A2A] drop-shadow-sm" strokeWidth={1.5} />
                                </div>
                                
                                <h3 className="relative z-10 text-2xl md:text-3xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-md">
                                    Индивидуальный <br/> 
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B88E2F] to-[#F5F1E6]">проект</span>
                                </h3>
                                
                                <p className="relative z-10 text-[#F5F1E6]/80 text-[10px] md:text-sm mb-8 md:mb-10 leading-relaxed max-w-[240px] font-light">
                                    Не нашли подходящего? Создайте уникальную конфигурацию {getCategoryName(currentCategoryId)} с нуля. Точный расчет сделает менеджер.
                                </p>
                                
                                <button className="relative z-10 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B88E2F] to-[#D4AF37] text-[#0A2A2A] font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(184,142,47,0.6)] hover:shadow-[0_15px_40px_-5px_rgba(184,142,47,0.8)] hover:scale-105 flex items-center gap-2">
                                    <Plus size={16} strokeWidth={3} /> Начать конфигурацию
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {filteredProducts.length === 0 && !currentCategoryId && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <Hammer className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-royal-900 mb-2">Товары не найдены</h3>
                        </div>
                    )}
                    
                    <div ref={loadMoreRef} className="h-20"></div>

                    {/* --- БЛОК ОТЗЫВОВ (Только если выбрана категория) --- */}
                    {currentCategoryId && (
                        <ReviewsSection 
                            categoryId={currentCategoryId} 
                            onLeaveReview={() => setIsReviewModalOpen(true)} // Передаем функцию открытия
                        />
                    )}

                </div>
            </div>
        )}
        
        {/* МОДАЛКИ */}
        <ConfiguratorModal />
        
        <ProductDetailsModal 
            isOpen={!!selectedProductForDetails} 
            onClose={() => setSelectedProductForDetails(null)} 
            product={selectedProductForDetails} 
            onOrder={handleQuickOrder} 
        />

        {/* НОВАЯ МОДАЛКА ОТЗЫВА */}
        <ReviewModal 
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
        />

        {/* ЕДИНЫЙ МОДАЛ: Индивидуальный проект / Предзаказ для категории */}
        {/* customProjectCategory = null → закрыт */}
        {/* customProjectCategory = 'Бани и сауны' → открыт с контекстом этой категории */}
        <CustomProjectModal
            isOpen={customProjectCategory !== null}
            onClose={() => setCustomProjectCategory(null)}
            categoryName={customProjectCategory}
        />
        
      </div>
    </div>
  );
};

export default Catalog;