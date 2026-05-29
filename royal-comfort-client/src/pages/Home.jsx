import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Импорт компонентов
import HeroSection from './Home/components/HeroSection';
import CooperationSteps from './Home/components/CooperationSteps'; 
import PromoSection from './Home/components/PromoSection'; 
import CategorySection from './Home/components/CategorySection';
import BrandAdvantages from './Home/components/BrandAdvantages';
import ConfiguratorCallout from './Home/components/ConfiguratorCallout';
import FeaturesGrid from './Home/components/FeaturesGrid';

import ConfiguratorModal from '../components/modals/ConfiguratorModal';
import CustomProjectModal from '../components/modals/CustomProjectModal';
import ReferralModal from '../components/modals/ReferralModal';

const Home = () => {
  const { hash } = useLocation();

  // Логика плавного скролла при переходе по ссылке с #
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  // Модал для консультации по неактивным категориям
  // null = закрыт, string = имя категории
  const [consultCategoryName, setConsultCategoryName] = useState(null);

  const handleCategoryClick = (category) => {
    // CategorySection передаёт category объект для неактивных категорий
    setConsultCategoryName(category.name);
  };

  return (
    <div className="w-full overflow-x-hidden bg-white">
      
      {/* 1. Главный экран */}
      <HeroSection />

      {/* 2. Этапы работы */}
      <CooperationSteps />

      {/* 3. ПРОМО БЛОК */}
      <PromoSection />

      {/* 4. Каталог продукции */}
      <div id="catalog">
        <CategorySection onCategoryClick={handleCategoryClick} />
      </div>

      {/* 5. Преимущества (О Бренде) */}
      <div id="about">
        <BrandAdvantages />
      </div>

      {/* 6. Сервис и Качество (Доставка, Гарантия) */}
      <div id="delivery"> 
         <div id="warranty"></div> 
         <FeaturesGrid />
      </div>

      {/* 7. Призыв к действию */}
      <ConfiguratorCallout />

      {/* МОДАЛЫ — рендерятся на уровне страницы, вне любых stacking context */}
      <ConfiguratorModal />
      <ReferralModal />

      {/* Модал консультации для неактивных категорий */}
      <CustomProjectModal
        isOpen={consultCategoryName !== null}
        onClose={() => setConsultCategoryName(null)}
        categoryName={consultCategoryName}
      />
      
    </div>
  );
};

export default Home;