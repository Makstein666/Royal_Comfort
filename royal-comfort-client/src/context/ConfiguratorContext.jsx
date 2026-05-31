import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfiguratorContext = createContext();
export const useConfigurator = () => useContext(ConfiguratorContext);

const API_BASE = '/api';

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
  const [hasUsedGift, setHasUsedGift] = useState(() => localStorage.getItem('hasUsedGift') === 'true');

  const [giftOptions, setGiftOptions] = useState({});

  // Реферальная система
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [appliedReferralCode, setAppliedReferralCode] = useState(() => localStorage.getItem('appliedReferralCode') || null);

  useEffect(() => {
    if (appliedReferralCode) {
      localStorage.setItem('appliedReferralCode', appliedReferralCode);
    } else {
      localStorage.removeItem('appliedReferralCode');
    }
  }, [appliedReferralCode]);

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
    if (hasUsedGift) {
      alert('Вы уже получали комплимент к своему первому заказу!');
      return;
    }
    const defaultGift = giftOptions['default'] || { name: 'Комплект премиальных масел', price: 0, image: '/images/maslo.png' };
    setActiveGift(defaultGift);
    setIsGiftModalOpen(true);
    setTimeout(() => setIsGiftModalOpen(false), 3000);
  };

  useEffect(() => {
    if (activeGift && activeCategory) {
      const specificGift = giftOptions[activeCategory] || giftOptions['default'] || { name: 'Комплект премиальных масел', price: 0, image: '/images/maslo.png' };
      if (activeGift.name !== specificGift.name) {
          setActiveGift(specificGift);
      }
    }
  }, [activeCategory, activeGift, giftOptions]);

  // --- Открытие конфигуратора ---
  const openModal = async (categoryId, product = null) => {
    setActiveCategory(categoryId || null);
    setCurrentProduct(product);
    setIsOpen(true);

    if (categoryId) {
        const config = await loadConfigForCategory(categoryId);
        if (config && config.groups.length > 0) {
          const initialConfig = {};
          config.groups.forEach(group => {
            const isMultiple = group.type === 'multiple' || group.id.endsWith('extras');
            const defaultOpt = group.options[0]?.id || null;
            initialConfig[group.id] = isMultiple ? (defaultOpt ? [defaultOpt] : []) : defaultOpt;
          });
          if (product && product.defaultConfig) {
            Object.keys(product.defaultConfig).forEach(key => {
              const val = product.defaultConfig[key];
              const isMultiple = key.endsWith('extras') || (config.groups.find(g => g.id === key)?.type === 'multiple');
              if (isMultiple) {
                initialConfig[key] = Array.isArray(val) ? val : (val ? [val] : []);
              } else {
                initialConfig[key] = val;
              }
            });
          }
          setConfiguration(initialConfig);
        } else {
          setConfiguration({});
        }
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
    setConfiguration(prev => {
      const config = configDataMap[activeCategory];
      const group = config?.groups.find(g => g.id === groupId);
      const isMultiple = group?.type === 'multiple' || groupId.endsWith('extras');
      
      if (!isMultiple) {
        return { ...prev, [groupId]: optionId };
      }
      
      const currentSelection = prev[groupId];
      let newSelection = Array.isArray(currentSelection) ? [...currentSelection] : [];
      
      // Если выбран сброс/ничего (id оканчивается на _none или равен 'none'/'ext_none')
      if (optionId.endsWith('_none') || optionId === 'none' || optionId === 'ext_none') {
        return { ...prev, [groupId]: [optionId] };
      }
      
      // Иначе убираем опцию сброса, если она была в списке
      newSelection = newSelection.filter(id => !id.endsWith('_none') && id !== 'none' && id !== 'ext_none');
      
      if (newSelection.includes(optionId)) {
        newSelection = newSelection.filter(id => id !== optionId);
        // Если ничего не осталось, возвращаем опцию "Ничего"
        if (newSelection.length === 0) {
          const noneOpt = group?.options.find(o => o.id.endsWith('_none') || o.id === 'none' || o.id === 'ext_none');
          if (noneOpt) {
            newSelection = [noneOpt.id];
          }
        }
      } else {
        newSelection.push(optionId);
      }
      
      return { ...prev, [groupId]: newSelection };
    });
  };

  // --- Расчёт цены ---
  useEffect(() => {
    if (!activeCategory) { setTotalPrice(0); return; }
    const config = configDataMap[activeCategory];
    if (!config) { setTotalPrice(0); return; }

    let price = config.basePrice || 0;
    config.groups.forEach(group => {
      const selectedVal = configuration[group.id];
      if (Array.isArray(selectedVal)) {
        selectedVal.forEach(id => {
          const opt = group.options.find(o => o.id === id);
          if (opt) price += opt.price;
        });
      } else {
        const opt = group.options.find(o => o.id === selectedVal);
        if (opt) price += opt.price;
      }
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
      activeGift, activateGift, isGiftModalOpen, hasUsedGift, setHasUsedGift,
      isReferralModalOpen, setIsReferralModalOpen,
      appliedReferralCode, setAppliedReferralCode
    }}>
      {children}
    </ConfiguratorContext.Provider>
  );
};