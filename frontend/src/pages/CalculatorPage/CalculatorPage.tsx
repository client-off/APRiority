import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postEvent, on } from '@telegram-apps/bridge'

import axios from 'axios'

import './CalculatorPage.css'
import { Footer } from '@/components/Footer/Footer'
import { useLanguage } from '../LanguagePage/LanguageContext'

// Определяем интерфейсы для данных коллекции и истории выплат

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

interface CollectionData {
	apr: number
	payback_period: PaybackPeriod
	collection: Collection
}

async function calculateAPR(
	address: string,
	income: number,
	paymentIntervalDays: number
): Promise<CollectionData | undefined> {
	try {
		const response = await axios.post<CollectionData>(
			'http://127.0.0.1:5000/api/v1/calculator',
			{
				address: address,
				income: income,
				payment_interval_days: paymentIntervalDays,
			}
		)

		// Обработка успешного ответа
		const data = response.data

		return data
	} catch (error: any) {
		// Обработка ошибки 404 (коллекция не найдена)
		if (error.response && error.response.status === 404) {
			console.error('Collection not found!')
			alert('Коллекция не найдена. Пожалуйста, проверьте адрес.')
		} else {
			// Обработка остальных ошибок
			console.error('Error calculating APR:', error)
			alert(`Произошла ошибка при расчете APR. Попробуйте позже. ${error}`)
		}
		throw error // Пробрасываем ошибку, если нужно
	}
}

export const CalculatorPage: FC = () => {
	const [isDarkTheme, setIsDarkTheme] = useState(false)
	const navigate = useNavigate()
	const { language } = useLanguage() // Получите текущий язык

	const [isModalOpen, setIsModalOpen] = useState(false)

	const [address, setAddress] = useState('')
	const [income, setIncome] = useState(0)
	const [payment_interval_days, setPaymentIntervalDays] = useState(0)

	const [calculated_data, setCalculatedData] = useState<CollectionData>()

	postEvent('web_app_setup_settings_button', {
		is_visible: true,
	})

	on('settings_button_pressed', () => {
		navigate('/settings')
	})

	postEvent('web_app_setup_back_button', {
		is_visible: true,
	})

	on('back_button_pressed', () => {
		navigate('/')
	})

	const isFormValid =
		address.trim() !== '' && income > 0 && payment_interval_days > 0

	const handleTextAddresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAddress(e.target.value) // Обновляем состояние текста
	}

	const handleTextIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIncome(Number(e.target.value)) // Обновляем состояние текста
	}

	const handleTextDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPaymentIntervalDays(Number(e.target.value)) // Обновляем состояние текста
	}

	const handleCalculateButton = () => {
		calculateAPR(address, income, payment_interval_days)
			.then(data => {
				setCalculatedData(data)
				setIsModalOpen(true)
			})
			.catch(err => console.error('Failed to calculate APR:', err))
	}

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		if (savedTheme === 'dark') {
			setIsDarkTheme(true)
			document.body.classList.add('dark-theme') // Добавляем класс на body
		} else {
			document.body.classList.remove('dark-theme') // Убираем класс с body
		}
	}, [])

	return (
		<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className='container'>
				<div className='container-title'>
					<div className='container-title__start'>
						<div className='title'>
							{language === 'ru' ? 'Калькулятор' : 'Calculator'}
						</div>
					</div>
				</div>
				<div className='container-input'>
					<div className='container-input-header'>
						{language === 'ru'
							? 'ПЕРИОД ОПЛАТЫ В ДНЯХ'
							: 'PAYMENT PERIOD IN DAYS'}
					</div>
					<div className='container-input-input'>
						<input
							type='number'
							placeholder={
								language === 'ru'
									? 'Введите количество дней'
									: 'Enter number of days'
							}
							onChange={handleTextDaysChange}
						/>
					</div>
					<div className='container-input-footer'>
						{language === 'ru'
							? 'Введите интервал между выплатами в днях'
							: 'Enter the interval between payments in days'}
					</div>
				</div>
				<div className='container-input'>
					<div className='container-input-header'>
						{language === 'ru' ? 'АДРЕС КОЛЛЕКЦИИ' : 'COLLECTION ADDRESS'}
					</div>
					<div className='container-input-input'>
						<input
							type='text'
							placeholder={
								language === 'ru' ? 'Введите контракт' : 'Enter contract'
							}
							onChange={handleTextAddresChange}
						/>
					</div>
					<div className='container-input-footer'>
						{language === 'ru'
							? 'Введите адрес контракта NFT коллекции'
							: 'Enter the address of the collection contract'}
					</div>
				</div>
				<div className='container-input'>
					<div className='container-input-header'>
						{language === 'ru' ? 'СУММА ВОЗНАГРАЖДЕНИЯ' : 'REWARD AMOUNT'}
					</div>
					<div className='container-input-input'>
						<input
							type='number'
							placeholder='0.1 $TON'
							onChange={handleTextIncomeChange}
						/>
					</div>
					<div className='container-input-footer'>
						{language === 'ru'
							? 'Введите сумму выплат на 1 NFT в $TON'
							: 'Enter the payout amount for 1 NFT in $TON'}
					</div>
				</div>
				<div className='container-button'>
					{isFormValid && (
						<div className='button' onClick={handleCalculateButton}>
							{language === 'ru' ? 'Рассчитать' : 'Calculate'}
						</div>
					)}
				</div>
			</div>
			<Footer isDarkTheme={isDarkTheme} />
			{isModalOpen && (
				<div className='modal'>
					<div className='modal-content'>
						<span className='close' onClick={() => setIsModalOpen(false)}>
							&times;
						</span>
						<div className='modal-content__title'>
							{calculated_data?.collection.name}
						</div>
						<div className='modal-content__address'>
							Floor: {calculated_data?.collection.floor} $TON
						</div>
						<div className='modal-content__address'>
							APR: {calculated_data?.apr}%
						</div>
						<div className='modal-content__address'>
							{language === 'ru' ? 'Окупаемость:' : 'Payback time:'}
							{calculated_data?.payback_period.days}{' '}
							{language === 'ru' ? 'д. ' : 'd. '}
							{calculated_data?.payback_period.months}{' '}
							{language === 'ru' ? 'м. ' : 'm. '}
							{calculated_data?.payback_period.years}{' '}
							{language === 'ru' ? 'г. ' : 'y. '}
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
