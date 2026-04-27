import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfiguratorContext = createContext();
export const useConfigurator = () => useContext(ConfiguratorContext);

const API_BASE = 'http://localhost:5000/api';

export const ConfiguratorProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [configuration, setConfiguration] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Данные из БД
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [configDataMap, setConfigDataMap] = useState({}); // categoryId -> {basePrice, groups}
  const [isLoading, setIsLoading] = useState(true);

  // Подарки
  const [activeGift, setActiveGift] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const [giftOptions, setGiftOptions] = useState({
    tub: { name: 'Набор премиальных масел', price: 0, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=200' },
    sauna: { name: 'Банный халат Royal', price: 0, image: 'https://images.unsplash.com/photo-1595345763945-3f33878e474d?q=80&w=200' },
    default: { name: 'Секретный бонус', price: 0, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=200' }
  });

  // --- Загрузка активных категорий и товаров из API ---
  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      try {
        const [catsRes, prodsRes, promoRes] = await Promise.all([
            fetch(`${API_BASE}/catalog/categories`),
            fetch(`${API_BASE}/catalog/products`),
            fetch(`${API_BASE}/catalog/promo`)
        ]);
        
        if (!catsRes.ok) throw new Error('Ошибка загрузки категорий');
        const cats = await catsRes.json();
        setCategories(cats);

        if (prodsRes.ok) {
            const prods = await prodsRes.json();
            setProducts(prods);
        }

        if (promoRes.ok) {
            const promos = await promoRes.json();
            if (promos.length > 0) {
                const newGifts = { ...giftOptions };
                promos.forEach(p => {
                    newGifts[p.categoryId] = { name: p.giftName, price: 0, image: p.giftImage };
                });
                setGiftOptions(newGifts);
            }
        }
      } catch (err) {
        console.error('Не удалось загрузить каталог из API:', err);
        setCategories([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // --- Загрузка конфигуратора для конкретной категории ---
  const loadConfigForCategory = async (categoryId) => {
    if (configDataMap[categoryId]) return configDataMap[categoryId]; // Кэш
    try {
      const res = await fetch(`${API_BASE}/catalog/categories/${categoryId}`);
      if (!res.ok) return null;
      const data = await res.json();
      const config = { basePrice: data.basePrice, groups: data.groups || [] };
      setConfigDataMap(prev => ({ ...prev, [categoryId]: config }));
      return config;
    } catch (err) {
      console.error('Ошибка загрузки конфигуратора:', err);
      return null;
    }
  };

  const activateGift = () => {
    setActiveGift(giftOptions['default']);
    setIsGiftModalOpen(true);
    setTimeout(() => setIsGiftModalOpen(false), 3000);
  };

  useEffect(() => {
    if (activeGift && activeCategory) {
      const specificGift = giftOptions[activeCategory] || giftOptions['default'];
      setActiveGift(specificGift);
    }
  }, [activeCategory]);

  // --- Открытие конфигуратора ---
  const openModal = async (categoryId, product = null) => {
    setActiveCategory(categoryId);
    setCurrentProduct(product);
    setIsOpen(true);

    const config = await loadConfigForCategory(categoryId);
    if (config && config.groups.length > 0) {
      const initialConfig = {};
      config.groups.forEach(group => {
        initialConfig[group.id] = group.options[0]?.id || null;
      });
      if (product && product.defaultConfig) {
        Object.assign(initialConfig, product.defaultConfig);
      }
      setConfiguration(initialConfig);
    } else {
      setConfiguration({});
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setActiveCategory(null);
    setCurrentProduct(null);
  };

  const updateOption = (groupId, optionId) => {
    setConfiguration(prev => ({ ...prev, [groupId]: optionId }));
  };

  // --- Расчёт цены ---
  useEffect(() => {
    if (!activeCategory) { setTotalPrice(0); return; }
    const config = configDataMap[activeCategory];
    if (!config) { setTotalPrice(0); return; }

    let price = config.basePrice || 0;
    config.groups.forEach(group => {
      const selectedId = configuration[group.id];
      const selectedOpt = group.options.find(o => o.id === selectedId);
      if (selectedOpt) price += selectedOpt.price;
    });

    // Применяем скидку категории если есть
    const cat = categories.find(c => c.id === activeCategory);
    if (cat && cat.discountPercent > 0) {
      price = Math.round(price * (1 - cat.discountPercent / 100));
    }

    setTotalPrice(price);
  }, [configuration, activeCategory, configDataMap, categories]);

  const checkCompatibility = () => null;

  // configData для текущей активной категории (совместимость)
  const configData = activeCategory && configDataMap[activeCategory]
    ? { ...configDataMap[activeCategory], id: activeCategory }
    : null;

  return (
    <ConfiguratorContext.Provider value={{
      isOpen, openModal, closeModal,
      activeCategory, configuration, updateOption, totalPrice,
      configData,
      categories, products,
      currentProduct, isLoading,
      checkCompatibility,
      activeGift, activateGift, isGiftModalOpen
    }}>
      {children}
    </ConfiguratorContext.Provider>
  );
};