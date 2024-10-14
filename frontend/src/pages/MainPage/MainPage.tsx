import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { on, postEvent } from '@telegram-apps/bridge'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../LanguagePage/LanguageContext'
import axios from 'axios'

import { Link } from '@/components/Link/Link'
import { Footer } from '@/components/Footer/Footer'

import { useTonWallet } from '@tonconnect/ui-react'

import './MainPage.css'

// Определяем интерфейсы для коллекций
interface Collection {
	address: string
	name: string
	image: { image: { baseUrl: string } }
	coverImage: { image: { baseUrl: string } }
	socialLinks: string[]
	description: string
	approximateHoldersCount: number
	approximateItemsCount: number
	floor: number
	isVerified: boolean
}

interface PaybackPeriod {
	days: number
	months: number
	years: number
}

interface Payment {
	date: string
	amount: number
}

interface CollectionData {
	regular_payments: boolean
	unsafe: boolean
	apr: number
	payback_period: PaybackPeriod
	paymentHistory: Payment[]
	collection: Collection
}

export const MainPage: FC = () => {
	const [isDarkTheme, setIsDarkTheme] = useState(false)
	const navigate = useNavigate()

	const { setLanguage, language } = useLanguage()
	const [, setSelectedLanguage] = useState(
		localStorage.getItem('language') || 'en'
	)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const wallet = useTonWallet()

	const [collections, setCollections] = useState<CollectionData[]>([])
	const [error, setError] = useState(null)

	postEvent('web_app_expand')

	postEvent('web_app_setup_back_button', {
		is_visible: false,
	})

	postEvent('web_app_setup_settings_button', {
		is_visible: true,
	})

	on('settings_button_pressed', () => {
		navigate('/settings')
	})

	const toggleTheme = () => {
		const newTheme = !isDarkTheme
		setIsDarkTheme(newTheme)
		localStorage.setItem('theme', newTheme ? 'dark' : 'light')
	}

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		if (savedTheme === 'dark') {
			setIsDarkTheme(true)
			document.body.classList.add('dark-theme')
		} else {
			document.body.classList.remove('dark-theme')
		}
		const savedLanguage = localStorage.getItem('language')
		if (savedLanguage) {
			setLanguage(savedLanguage)
			setSelectedLanguage(savedLanguage)
		}

		const fetchCollections = async () => {
			try {
				const response = await axios.get<CollectionData[]>(
					'http://127.0.0.1:5000/api/v1/collections'
				)
				alert(response.data)
				setCollections(response.data) // Сохраняем данные коллекций в состоянии
			} catch (error: any) {
				setError(error.message) // Обработка ошибок
			}
		}

		if (wallet) {
			console.log(wallet.account.address)
		} else {
			setIsModalOpen(true)
		}

		fetchCollections()
	}, [])

	if (error) {
		;<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className='container'>
				<div className='container-title'>
					<div className='container-title__start'>
						<div className='title' onClick={toggleTheme}>
							{language === 'ru' ? 'Коллекции' : 'Collections'}
						</div>
					</div>
				</div>
				{error}
			</div>
			<Footer isDarkTheme={isDarkTheme} />
		</div>
	}

	if (!collections?.length) {
		;<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className='container'>
				<div className='container-title'>
					<div className='container-title__start'>
						<div className='title' onClick={toggleTheme}>
							{language === 'ru' ? 'Коллекции' : 'Collections'}
						</div>
					</div>
				</div>
			</div>
			<Footer isDarkTheme={isDarkTheme} />
		</div>
	}

	return (
		<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className='container'>
				<div className='container-title'>
					<div className='container-title__start'>
						<div className='title' onClick={toggleTheme}>
							{language === 'ru' ? 'Коллекции' : 'Collections'}
						</div>
					</div>
				</div>
				{collections?.map((item: CollectionData, index) => (
					<Link
						key={index}
						state={{ address: item.collection.address }}
						to={'/collection'}
					>
						<div className='container-collection'>
							<div className='container-collection-image'>
								<img
									src={item.collection.image.image.baseUrl}
									alt={item.collection.name}
								/>
								<div className='container-collection-image__apr'>
									{`APR ${item.apr}%`}
								</div>
							</div>
							<div className='container-collection-title'>
								<div className='container-collection-title__avatar'>
									<img
										src={item.collection.image.image.baseUrl}
										alt={item.collection.name}
									/>
								</div>
								<div className='container-collection-title__text'>
									{item.collection.name}
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
			<Footer isDarkTheme={isDarkTheme} />
			{isModalOpen && (
				<div className='modal'>
					<div className='modal-content'>
						<span className='close' onClick={() => setIsModalOpen(false)}>
							&times;
						</span>
						<div className='modal-content__title'>
							{language === 'ru' ? 'Подключите кошелёк' : 'Connect a wallet'}
						</div>
						<div className='modal-content__address'>
							{language === 'ru'
								? 'Чтобы иметь полный доступ к функционалу вам нужно подключить кошелёк в настройках!'
								: 'To have full access to the functionality you need to connect the wallet in the settings!'}
						</div>
						<div
							className='button'
							onClick={() => {
								setIsModalOpen(false)
							}}
						>
							{language === 'ru' ? 'Закрыть' : 'Close'}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
