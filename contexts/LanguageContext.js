import React, { createContext, useState, useContext } from 'react';
import { getTranslation } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // 'en', 'uk', or 'it'
  
  const t = getTranslation(language);
  
  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'en') return 'uk';
      if (prev === 'uk') return 'it';
      return 'en';
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
