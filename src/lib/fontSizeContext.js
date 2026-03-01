'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const FONT_SIZE_KEY = 'tapercommunity_font_size';
const FONT_SIZE_MAP = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
};

const FontSizeContext = createContext({
  fontSize: 'medium',
  setFontSize: () => {},
});

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSizeState] = useState('medium');

  useEffect(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    if (saved && FONT_SIZE_MAP[saved]) setFontSizeState(saved);
  }, []);

  const setFontSize = (size) => {
    setFontSizeState(size);
    document.documentElement.style.fontSize = FONT_SIZE_MAP[size] || '16px';
    localStorage.setItem(FONT_SIZE_KEY, size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeContext);
