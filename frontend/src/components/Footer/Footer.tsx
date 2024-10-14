import type { FC } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Link } from '@/components/Link/Link';
import './Footer.css';

import stateHome from './Images/State=on, Type=home.svg';
import stateListing from './Images/State=on, Type=listing.svg';
import stateCalculator from './Images/State=on, Type=support.svg';

import home from './Images/State=off, Type=home.svg';
import listing from './Images/State=off, Type=listing.svg';
import support from './Images/State=off, Type=support.svg';
import { useLanguage } from '../../pages/LanguagePage/LanguageContext';

interface FooterProps {
  isDarkTheme: boolean;
}

export const Footer: FC<FooterProps> = ({ isDarkTheme }) => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const isHome = location.pathname === '/';
  const isListing = location.pathname === '/listing' || location.pathname === '/listingrequest';
  const isCalculator = location.pathname === '/calculator';

  return (
    <div className={`footer ${isDarkTheme ? 'dark-theme' : ''}`}>
      <Link to={'/'}>
        <div className="footer-item">
          <div className="footer-image">
            <img src={isHome ? stateHome : home} alt="" />
          </div>
          <div className="footer-title" style={{ color: isHome ? '#007AFF' : '#797D8D' }}>
            {language === 'ru' ? 'Главная' : 'Home'}
          </div>
        </div>
      </Link>
      <Link to={'/listing'}>
        <div className="footer-item">
          <div className="footer-image">
            <img src={isListing ? stateListing : listing} alt="" />
          </div>
          <div className="footer-title" style={{ color: isListing ? '#007AFF' : '#797D8D' }}>
            {language === 'ru' ? 'Листинг' : 'Listing'}
          </div>
        </div>
      </Link>
      <Link to={'/calculator'}>
        <div className="footer-item">
          <div className="footer-image">
            <img src={isCalculator ? stateCalculator : support} alt="" />
          </div>
          <div className="footer-title" style={{ color: isCalculator ? '#007AFF' : '#797D8D' }}>
            {language === 'ru' ? 'Калькулятор' : 'Calculator'}
          </div>
        </div>
      </Link>
    </div>
  );
};
