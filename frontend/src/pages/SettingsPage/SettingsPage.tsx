import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postEvent, on } from '@telegram-apps/bridge'

import {
	useTonConnectUI,
	useTonWallet,
	useTonAddress,
} from '@tonconnect/ui-react'
import './SettingsPage.css'

import wallets from './Images/P2P.svg'
import languages from './Images/Language.svg'
import support from './Images/Support.svg'
import next from './Images/Icon.svg'
import { Link } from '@/components/Link/Link'
import { useLanguage } from '../LanguagePage/LanguageContext'

export const SettingsPage: FC = () => {
	const navigate = useNavigate()

	const { setLanguage, language } = useLanguage()
	const [, setSelectedLanguage] = useState(
		localStorage.getItem('language') || 'en'
	)

	const [tonConnectUI] = useTonConnectUI()
	const wallet = useTonWallet()
	const userFriendlyAddress = useTonAddress()

	const [isDarkTheme, setIsDarkTheme] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	postEvent('web_app_setup_back_button', {
		is_visible: true,
	})

	on('back_button_pressed', () => {
		navigate(-1)
	})

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		if (savedTheme === 'dark') {
			setIsDarkTheme(true)
		}
		const savedLanguage = localStorage.getItem('language')
		if (savedLanguage) {
			setLanguage(savedLanguage)
			setSelectedLanguage(savedLanguage)
		}
	}, [])

	const handleDisconnect = async () => {
		await tonConnectUI.disconnect()
	}

	const formatAddress = (address: string) => {
		if (!address) return ''
		return `${address.slice(0, 4)}...${address.slice(-4)}`
	}

	const handleOpenModal = () => {
		if (wallet) {
			setIsModalOpen(true)
		} else {
			tonConnectUI.openModal()
		}
	}

	return (
		<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className='container'>
				<div className='container-title'>
					<div className='container-title__start'>
						<div className='title'>
							{language === 'ru' ? 'Настройки' : 'Settings'}
						</div>
					</div>
				</div>
				<div className='container-settings'>
					<div className='container-settings-item' onClick={handleOpenModal}>
						<div className='container-settings-item__start'>
							<div className='container-settings-item__start-img'>
								<img src={wallets} alt='' />
							</div>
							<div className='container-settings-item__start-text'>
								{language === 'ru'
									? 'Подключенный кошелек'
									: 'Connected wallet'}
							</div>
						</div>
						<div className='container-settings-item__end'>
							<div className='container-settings-item__value'>
								{formatAddress(userFriendlyAddress)}
							</div>
							<div className='container-settings-item__next'>
								<img src={next} alt='' />
							</div>
						</div>
					</div>
					<div className='line'></div>
					<Link to={'/language'}>
						<div className='container-settings-item'>
							<div className='container-settings-item__start'>
								<div className='container-settings-item__start-img'>
									<img src={languages} alt='' />
								</div>
								<div className='container-settings-item__start-text'>
									{language === 'ru' ? 'Язык' : 'Language'}
								</div>
							</div>
							<div className='container-settings-item__end'>
								<div className='container-settings-item__value'>
									{language === 'ru' ? 'Русский' : 'English'}
								</div>
								<div className='container-settings-item__next'>
									<img src={next} alt='' />
								</div>
							</div>
						</div>
					</Link>
					<div className='line'></div>
					<div className='container-settings-item'>
						<div className='container-settings-item__start'>
							<div className='container-settings-item__start-img'>
								<img src={support} alt='' />
							</div>
							<div className='container-settings-item__start-text'>Support</div>
						</div>
						<div className='container-settings-item__end'>
							<div className='container-settings-item__next'>
								<img src={next} alt='' />
							</div>
						</div>
					</div>
				</div>
			</div>
			{isModalOpen && (
				<div className='modal'>
					<div className='modal-content'>
						<span className='close' onClick={() => setIsModalOpen(false)}>
							&times;
						</span>
						<div className='modal-content__title'>Disconnect wallet</div>
						<div className='modal-content__address'>{userFriendlyAddress}</div>
						<div
							className='button'
							onClick={async () => {
								await handleDisconnect()
								setIsModalOpen(false)
							}}
						>
							Disconnect
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
