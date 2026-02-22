'use client';

import { useState, useRef, useEffect } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search threads...', className = '' }) {
  const [value, setValue] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setValue(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(q);
    }, 300);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
        fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="input w-full pl-10 pr-8"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
