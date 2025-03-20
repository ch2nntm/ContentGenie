'use client';

import setLanguageValue from '@/actions/set-language-actions';
import React, { useState, useEffect } from 'react';

const Topbar = () => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setLanguageValue(language);
  }, [language]);

  return (
    <div style={{ position: 'fixed', display: 'flex', justifyContent: 'space-between', padding: '10px', right: 0, zIndex: 1000, top: 10 }}>
      <select onChange={(e) => setLanguage(e.target.value)} value={language}>
        <option value="en">English</option>
        <option value="vi">VietNamese</option>
      </select>
    </div>
  );
}

export default Topbar;



