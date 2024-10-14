import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postEvent, on } from '@telegram-apps/bridge';

import './ListingRequestPage.css';
import { FooterButton } from '@/components/FooterButton/FooterButton';
import { useLanguage } from '../LanguagePage/LanguageContext';

import testAvatar from './Images/Ellipse 7.svg';

export const ListingRequestPage: FC = () => {
  const [formData, setFormData] = useState({
    nftLink: '',
    paymentPeriod: '',
    tokenAddress: '',
    rewardAmount: ''
  });

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
    navigate('/listing');
  });

  const isFormValid = Object.values(formData).every(field => field.trim() !== '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const [tokens, setTokens] = useState([{ tokenAddress: '', rewardAmount: '' }]); // Добавлено состояние для токенов

  const addToken = () => {
    setTokens(prevTokens => [...prevTokens, { tokenAddress: '', rewardAmount: '' }]); // Функция для добавления токена
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
    }
    const savedLanguage = localStorage.getItem('language');
		if (savedLanguage) {
			setLanguage(savedLanguage); 
			setSelectedLanguage(savedLanguage);
		}
  }, []);

  return (
    <form>
      <div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
        <div className="container">
          <div className="container-title">
            <div className="container-title__start">
              <div className="title">
                {language === 'ru' ? 'Запрос на листинг' : 'Listing Request'}
              </div>
            </div>
          </div>
          <div className="container-input">
            <div className="container-input-header">
              {language === 'ru' ? 'Ссылка на коллекцию NFT' : 'LINK TO NFT COLLECTION'}
            </div>
            <div className="container-input-input">
              <input 
                type='text' 
                name='nftLink' 
                placeholder={language === 'ru' ? 'Введите ссылку' : 'Enter link'} 
                onChange={handleChange}
              />
            </div>
            <div className="container-input-footer">
              {language === 'ru' ? 'Введите адрес контракта NFT' : 'Enter the address of the NFT contract'}
            </div>
            <div className="line"></div>
            <div className="container-avatar">
              <div className="container-avatar__img">
                <img src={testAvatar} alt="" />
              </div>
              <div className="container-avatar__text">
              {language === 'ru' ? 'Заголовок коллекции' : 'Title collection'}
              </div>
            </div>
            <div className="line"></div>
          </div>
          <div className="container-input">
            <div className="container-input-header">
              {language === 'ru' ? 'Период оплаты в днях' : 'PAYMENT PERIOD IN DAYS'}
            </div>
            <div className="container-input-input">
              <input 
                type='text' 
                name='paymentPeriod' 
                placeholder={language === 'ru' ? 'Введите количество дней' : 'Enter number of days'} 
                onChange={handleChange}
              />
            </div>
          </div>
          {tokens.map((token, index) => ( // Изменено: добавлен параметр token
            <div className="container-input" key={token.tokenAddress}>
              <div className="container-input-header">
                {language === 'ru' ? 'Адрес токена' : 'TOKEN ADDRESS'}
              </div>
              <div className="container-input-input">
                <input 
                  type='text' 
                  name={`tokenAddress_${index}`} 
                  placeholder={language === 'ru' ? 'Введите контракт' : 'Enter contract'} 
                  onChange={handleChange}
                />
              </div>
              <div className="container-input-footer">
                {language === 'ru' ? 'Введите адрес контракта токена, в котором планируется выплата вознаграждений' : 'Enter the address of the token contract in which the rewards are planned to be paid out'}
              </div>
              <div className="line"></div>
              <div className="container-avatar">
                <div className="container-avatar__img">
                  <img src={testAvatar} alt="" />
                </div>
                <div className="container-avatar__text">
                  {language === 'ru' ? 'Заголовок токена' : 'Title token'}
                </div>
              </div>
              <div className="line"></div>
            </div>
          ))}
          <div className="graybutton" onClick={addToken}>
            Add another token
          </div>
          <div className="container-input">
            <div className="container-input-header">
              {language === 'ru' ? 'Сумма вознаграждения' : 'REWARD AMOUNT'}
            </div>
            <div className="container-input-input">
              <input 
                type='text' 
                name='rewardAmount' 
                placeholder={language === 'ru' ? 'Введите сумму' : 'Enter amount'} 
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <FooterButton buttonText={language === 'ru' ? 'Подать заявку на листинг' : 'Apply for a listing'} active={isFormValid} /> 
      </div>
    </form>
  );
};
