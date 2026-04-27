import React, { useEffect } from 'react';
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

  return (
    <div className="w-full overflow-x-hidden bg-white">
      
      {/* 1. Главный экран */}
      <HeroSection />

      {/* 2. Этапы работы */}
      <CooperationSteps />

      {/* 3. ПРОМО БЛОК */}
      <PromoSection />

      {/* 4. Каталог продукции */}
      {/* Добавил id="catalog" для ссылки "Все товары" */}
      <div id="catalog">
        <CategorySection />
      </div>

      {/* 5. Преимущества (О Бренде) */}
      {/* Добавил id="about" для ссылки "О бренде" */}
      <div id="about">
        <BrandAdvantages />
      </div>

      {/* 6. Сервис и Качество (Доставка, Гарантия) */}
      {/* Добавил id="service" (сюда ведут "Доставка" и "Гарантия") */}
      <div id="delivery"> 
         {/* Можно добавить пустой div для якоря гарантии, если нужно точнее, 
             но обычно ведут на блок целиком */}
         <div id="warranty"></div> 
         <FeaturesGrid />
      </div>

      {/* 7. Призыв к действию */}
      <ConfiguratorCallout />

      <ConfiguratorModal />
      
    </div>
  );
};

export default Home;