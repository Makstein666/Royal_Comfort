import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export const useFontSize = () => useContext(FontSizeContext);

export const FontSizeProvider = ({ children }) => {
  // 1 = 100% (стандарт), 1.1 = 110%, 1.25 = 125%
  const [fontScale, setFontScale] = useState(() => {
    const saved = localStorage.getItem('fontScale');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('fontScale', fontScale);
    
    // ГЛАВНОЕ ИЗМЕНЕНИЕ:
    // Мы меняем размер шрифта у всего HTML документа.
    // Tailwind (rem) отталкивается от этого значения.
    // 100% = 16px (стандарт браузера), 110% = 17.6px и т.д.
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
    
  }, [fontScale]);

  const toggleFontSize = () => {
    setFontScale(prev => {
        if (prev === 1) return 1.1;
        if (prev === 1.1) return 1.25;
        return 1;
    });
  };

  return (
    <FontSizeContext.Provider value={{ fontScale, toggleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};