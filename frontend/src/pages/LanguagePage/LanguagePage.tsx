import type { FC } from 'react';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { postEvent, on } from '@telegram-apps/bridge';

import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import './LanguagePage.css';

import RU from './Images/RU.svg';
import en from './Images/ENG.svg';

import select from './Images/Icon.svg';

import { useLanguage } from './LanguageContext';

export const LanguagePage: FC = () => {

	const navigate = useNavigate();

	const [tonConnectUI] = useTonConnectUI();
	const userFriendlyAddress = useTonAddress();

	const [isDarkTheme, setIsDarkTheme] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { setLanguage, language } = useLanguage();

	const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('language') || 'en');

	postEvent('web_app_setup_back_button', {
		is_visible: true
	})

	on('back_button_pressed', () => {
		navigate('/settings');
	});

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

	const handleDisconnect = async () => {
		await tonConnectUI.disconnect();
	};

	const handleLanguageChange = (lang: string) => {
		setLanguage(lang); // Установите выбранный язык
		setSelectedLanguage(lang); // Обновите состояние выбранного языка
		localStorage.setItem('language', lang); // Сохраняем язык в localStorage
	};

	return (
		<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className="container">
				<div className="container-title">
					<div className="title">
						{language === 'ru' ? 'Выбор языка' : 'Language'}
					</div>
				</div>
				<div className="container-settings">
					<div className="container-settings-item" onClick={() => handleLanguageChange('ru')}>
						<div className="container-settings-item__start">
							<div className="container-settings-item__start-img">
								<img src={RU} alt="" />
							</div>
							<div className="container-settings-item__start-text">
								{language === 'ru' ? 'Русский' : 'Russian'}
							</div>
						</div>
						<div className="container-settings-item__end">
							<div className="container-settings-item__value">
							</div>
							<div className="container-settings-item__next">
								{selectedLanguage === 'ru' && <img src={select} alt="" />}
							</div>
						</div>
					</div>
					<div className="line"></div>
					<div className="container-settings-item" onClick={() => handleLanguageChange('en')}>
						<div className="container-settings-item__start">
							<div className="container-settings-item__start-img">
								<img src={en} alt="" />
							</div>
							<div className="container-settings-item__start-text">
								{language === 'ru' ? 'Английский' : 'English'}
							</div>
						</div>
						<div className="container-settings-item__end">
							<div className="container-settings-item__value">
							</div>
							<div className="container-settings-item__next">
								{selectedLanguage === 'en' && <img src={select} alt="" />}
							</div>
						</div>
					</div>
				</div>
			</div>
			{isModalOpen && (
				<div className="modal">
					<div className="modal-content">
						<span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
						<div className="modal-content__title">Disconnect wallet</div>
						<div className="modal-content__address">
						{userFriendlyAddress}
						</div>
						<div className="button" onClick={async () => { 
							await handleDisconnect(); // Вызываем функцию отключения
							setIsModalOpen(false); // Закрываем модальное окно
						}}>Disconnect</div>
					</div>
				</div>
			)}
		</div>
	);
};
