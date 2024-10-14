import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postEvent, on } from '@telegram-apps/bridge'

import { Link } from '@/components/Link/Link';
import { Footer } from '@/components/Footer/Footer';

import './ListingPage.css';
import { useLanguage } from '../LanguagePage/LanguageContext';

export const ListingPage: FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const navigate = useNavigate();

  const { setLanguage, language } = useLanguage();
  const [, setSelectedLanguage] = useState(localStorage.getItem('language') || 'en');

  postEvent('web_app_setup_settings_button', {
    is_visible: true
  });

  on('settings_button_pressed', () => {
    navigate('/settings');
  });

  postEvent('web_app_setup_back_button', {
    is_visible: true
  });

  on('back_button_pressed', () => {
    navigate('/');
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme'); 
    }
		const savedLanguage = localStorage.getItem('language');
		if (savedLanguage) {
			setLanguage(savedLanguage); 
			setSelectedLanguage(savedLanguage);
		}
  }, []);

  return (
    <div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className="container">
        <div className="container-title">
          <div className="container-title__start">
            <div className="title">
              {language === 'ru' ? 'Листинг' : 'Listing'}
            </div>
          </div>
        </div>
        <div className="container-list">
          <div className="container-list-item">
            <div className="container-list-item__number">1</div>
            <div className="container-list-item__text">
              {language === 'ru' ? 'Условие' : 'Condition'}
            </div>
          </div>
          <div className="container-list-item">
            <div className="container-list-item__number">1</div>
            <div className="container-list-item__text">
              {language === 'ru' ? 'Условие' : 'Condition'}
            </div>
          </div>
          <div className="container-list-item">
            <div className="container-list-item__number">1</div>
            <div className="container-list-item__text">
              {language === 'ru' ? 'Условие' : 'Condition'}
            </div>
          </div>
          <div className="container-list-item">
            <div className="container-list-item__number">1</div>
            <div className="container-list-item__text">
              {language === 'ru' ? 'Условие' : 'Condition'}
            </div>
          </div>
          <div className="container-list-item">
            <div className="container-list-item__number">1</div>
            <div className="container-list-item__text">
              {language === 'ru' ? 'Условие' : 'Condition'}
            </div>
          </div>
          <div className="container-list-item">
            <div className="container-list-item__number">1</div>
            <div className="container-list-item__text">
              {language === 'ru' ? 'Условие' : 'Condition'}
            </div>
          </div>
        </div>
        <Link to={'/listingrequest'}>
          <div className="container-button">
            <div className="button">
              {language === 'ru' ? 'Запрос на листинг' : 'Listing request'}
            </div>
          </div>
        </Link>
      </div>
      <Footer isDarkTheme={isDarkTheme} />
    </div>
  );
};
