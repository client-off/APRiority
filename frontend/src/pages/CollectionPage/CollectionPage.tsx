import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { postEvent, on } from '@telegram-apps/bridge'
import { useLanguage } from '../LanguagePage/LanguageContext'
import axios from 'axios'

import { Link } from '@/components/Link/Link'
import './CollectionPage.css'

import testPic from './Images/pic.svg'

import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

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

const fetchCollectionData = async (
	address: string
): Promise<CollectionData | null> => {
	try {
		const response = await axios.get(
			`http://127.0.0.1:5000/api/v1/collection/${address}`
		)
		return response.data as CollectionData // Приведение к типу CollectionData
	} catch (error) {
		console.error('Ошибка при получении данных коллекции:', error)
		return null
	}
}

// Функции для группировки данных
const groupByYear = (payments: Payment[]) => {
	const result: { [key: number | string]: any } = {}
	payments.forEach(payment => {
		const year = new Date(
			payment.date.split('.').reverse().join('-')
		).getFullYear()
		if (!result[year]) result[year] = 0
		result[year] += payment.amount
	})
	return result
}

const groupByMonth = (payments: Payment[]) => {
	const result: { [key: number | string]: any } = {}
	payments.forEach(payment => {
		const dateObj = new Date(payment.date.split('.').reverse().join('-'))
		const monthKey = dateObj.getFullYear() - dateObj.getMonth() + 1
		if (!result[monthKey]) result[monthKey] = 0
		result[monthKey] += payment.amount
	})
	return result
}

const groupByWeek = (payments: Payment[]) => {
	const result: { [key: number | string]: any } = {}
	payments.forEach(payment => {
		const dateObj = new Date(payment.date.split('.').reverse().join('-'))
		const weekKey = dateObj.getFullYear() - getWeekNumber(dateObj)
		if (!result[weekKey]) result[weekKey] = 0
		result[weekKey] += payment.amount
	})
	return result
}

// Вспомогательная функция для получения номера недели в году
function getWeekNumber(date: Date) {
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
	const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export const CollectionPage: FC = () => {
	const location = useLocation()
	const [selectedPeriod, setSelectedPeriod] = useState('weekly')
	const [chartData, setChartData] = useState({
		labels: [''], // Метки по оси X
		datasets: [
			{
				label: '', // Убираем надпись "Цена"
				data: [], // Данные для графика
				borderColor: 'blue', // Цвет линии
				backgroundColor: 'rgba(0, 122, 255, 0.2)', // Цвет фона
				pointBackgroundColor: 'blue', // Цвет точки
				pointBorderColor: 'white', // Цвет границы точки
				pointHoverBackgroundColor: 'blue', // Цвет точки при наведении
				pointHoverBorderColor: 'white', // Цвет границы точки при наведении
				pointRadius: 0, // Убираем точки
				pointHoverRadius: 0, // Убираем точки при наведении
				tension: 0.4, // Параметр для закругления линии
			},
		],
	})
	const navigate = useNavigate()
	const [isDarkTheme, setIsDarkTheme] = useState(false)
	const { setLanguage, language } = useLanguage()
	const [, setSelectedLanguage] = useState(
		localStorage.getItem('language') || 'en'
	)

	const [collectionData, setCollectionData] = useState<CollectionData | null>(
		null
	)
	const address = location.state.address

	const handlePeriodChange = (period: any) => {
		setSelectedPeriod(period)
	}

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

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		if (savedTheme === 'dark') {
			setIsDarkTheme(true)
			document.body.classList.add('dark-theme') // Добавляем класс на body
		} else {
			document.body.classList.remove('dark-theme') // Убираем класс с body
		}
		const savedLanguage = localStorage.getItem('language')
		if (savedLanguage) {
			setLanguage(savedLanguage)
			setSelectedLanguage(savedLanguage)
		}
		const getData = async () => {
			const data = await fetchCollectionData(address)
			if (data) {
				setCollectionData(data)
			}
		}

		getData()

		let yearlyData = {}
		let monthlyData = {}
		let weeklyData = {}

		if (collectionData?.paymentHistory) {
			yearlyData = groupByYear(collectionData?.paymentHistory)
			monthlyData = groupByMonth(collectionData?.paymentHistory)
			weeklyData = groupByWeek(collectionData?.paymentHistory)
		}

		let chart_data = {}

		switch (selectedPeriod) {
			case 'weekly':
				chart_data = weeklyData
				break
			case 'monthly':
				chart_data = monthlyData
				break
			case 'yearly':
				chart_data = yearlyData
		}

		setChartData({
			labels: Object.keys(chart_data), // Метки по оси X
			datasets: [
				{
					label: '', // Убираем надпись "Цена"
					data: Object.values(chart_data), // Данные для графика
					borderColor: 'blue', // Цвет линии
					backgroundColor: 'rgba(0, 122, 255, 0.2)', // Цвет фона
					pointBackgroundColor: 'blue', // Цвет точки
					pointBorderColor: 'white', // Цвет границы точки
					pointHoverBackgroundColor: 'blue', // Цвет точки при наведении
					pointHoverBorderColor: 'white', // Цвет границы точки при наведении
					pointRadius: 0, // Убираем точки
					pointHoverRadius: 0, // Убираем точки при наведении
					tension: 0.4, // Параметр для закругления линии
				},
			],
		})
	}, [address, collectionData, selectedPeriod])

	const formatLink = (link: string) => {
		// Если это Telegram, убираем 'https://' и сокращаем до '@username'
		if (link.includes('t.me/')) {
			const username = link.split('t.me/')[1]
			return `@${username}`
		}

		// Убираем 'https://' или 'http://'
		return link.replace(/^https?:\/\//, '')
	}

	return (
		<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className='container-c'>
				<div className='container-collection'>
					<div className='container-collection-image'>
						<img src={testPic} alt='' />
					</div>
					<div className='container-collection-title-c'>
						<div className='container-collection-title__text-c'>
							{collectionData?.collection.name}
						</div>
						<div className='container-collection-title__subtitle'>
							{address}
						</div>
					</div>
					<div className='container-collection-info'>
						<div
							className='container-collection-info__item-apr'
							style={{
								padding: '2px 8px',
								borderRadius: '14px',
								backgroundColor: 'rgba(0, 122, 255, 1)',
								color: 'rgba(255, 255, 255, 1)',
								fontWeight: 500,
								fontSize: '12px',
								lineHeight: '20px',
							}}
						>
							{`APR ${collectionData?.apr}%`}
						</div>
						{collectionData?.regular_payments && (
							<div
								className='container-collection-info__item-regularpayments'
								style={{
									padding: '2px 8px',
									borderRadius: '14px',
									backgroundColor: 'rgba(52, 199, 89, 1)',
									color: 'rgba(255, 255, 255, 1)',
									fontWeight: 500,
									fontSize: '12px',
									lineHeight: '20px',
								}}
							>
								{language === 'ru' ? 'Регулярные выплаты' : 'Regular payments'}
							</div>
						)}
						{collectionData?.unsafe && (
							<div
								className='container-collection-info__item-unsafe'
								style={{
									padding: '2px 8px',
									borderRadius: '14px',
									backgroundColor: 'rgba(235, 77, 61, 1)',
									color: 'rgba(255, 255, 255, 1)',
									fontWeight: 500,
									fontSize: '12px',
									lineHeight: '20px',
								}}
							>
								{language === 'ru' ? 'Небезопасно' : 'Unsafe'}
							</div>
						)}
						{collectionData?.collection.socialLinks.map((link, index) => (
							<div
								key={index}
								className='container-collection-info__item-default'
							>
								{/* Сокращенный текст без http/https */}
								<a
									href={link} // Полная ссылка
									style={{
										pointerEvents: 'none', // Отключаем кликабельность
										textDecoration: 'none', // Убираем подчеркивание
										color: 'inherit', // Цвет не меняем
									}}
								>
									{formatLink(link)} {/* Отображаем сокращенный формат */}
								</a>
							</div>
						))}
					</div>
					<div className='container-otherinfo'>
						<div className='container-otherinfo__item'>
							<div className='container-otherinfo__item-text'>
								{language === 'ru' ? 'Элементы:' : 'Items:'}
							</div>
							<div className='container-otherinfo__item-value'>
								{collectionData?.collection.approximateItemsCount}
							</div>
						</div>
						<div className='line'></div>
						<div className='container-otherinfo__item'>
							<div className='container-otherinfo__item-text'>
								{language === 'ru' ? 'Владельцы:' : 'Owners:'}
							</div>
							<div className='container-otherinfo__item-value'>
								{collectionData?.collection.approximateItemsCount}
							</div>
						</div>
						<div className='line'></div>
						<div className='container-otherinfo__item'>
							<div className='container-otherinfo__item-text'>
								{language === 'ru' ? 'Окупаемость:' : 'Payback time:'}
							</div>
							<div className='container-otherinfo__item-value'>
								{collectionData?.payback_period.days}{' '}
								{language === 'ru' ? 'д. ' : 'd. '}
								{collectionData?.payback_period.months}{' '}
								{language === 'ru' ? 'м. ' : 'm. '}
								{collectionData?.payback_period.years}{' '}
								{language === 'ru' ? 'г. ' : 'y. '}
							</div>
						</div>
					</div>
					<div className='container-profitability'>
						<div className='container-profitability__title'>
							{language === 'ru' ? 'Прибыльность' : 'Profitability'}
						</div>
						<div className='container-profitability__select'>
							{['weekly', 'monthly', 'yearly'].map(period => (
								<div
									key={period}
									className={`container-profitability__select-item ${
										selectedPeriod === period
											? 'container-profitability__select-item__active'
											: ''
									}`}
									onClick={() => handlePeriodChange(period)}
								>
									{language === 'ru'
										? period === 'weekly'
											? 'Еженедельно'
											: period === 'monthly'
											? 'Ежемесячно'
											: 'Ежегодно'
										: period.charAt(0).toUpperCase() + period.slice(1)}
								</div>
							))}
						</div>
						<div className='container-profiability__chart'>
							<Line data={chartData} options={options} />
						</div>
					</div>
					<div className='container-history'>
						<div className='container-history__title'>
							{language === 'ru' ? 'История платежей' : 'Payment history'}
						</div>
						<div className='container-otherinfo-history'>
							{collectionData?.paymentHistory.map((payment, index) => (
								<div>
									<div
										key={index}
										className='container-otherinfo__item-history'
									>
										<div className='container-otherinfo__item-text-history'>
											{payment.date}
										</div>
										<div className='container-otherinfo__item-value-history'>
											+{payment.amount}$
										</div>
									</div>
									<div className='line'></div>
								</div>
							))}
						</div>
					</div>
					<Link state={{ address: address }} to={'/comments'}>
						<div className='container-button-c'>
							<div className='graybutton'>
								{language === 'ru' ? 'Открыть комментарии' : 'Open comments'}
							</div>
						</div>
					</Link>
				</div>
			</div>
		</div>
	)
}

// Добавляем данные и опции для графика

const options: any = {
	scales: {
		y: {
			beginAtZero: true, // Начинать с нуля
		},
	},
	plugins: {
		tooltip: {
			mode: 'index', // Отображение подсказки по индексу
			intersect: false, // Подсказка будет отображаться при наведении на линию
			position: 'nearest', // Позиция подсказки
			backgroundColor: 'rgba(0, 122, 255, 1)', // Цвет фона подсказки
			borderColor: 'rgba(255, 255, 255, 1)', // Цвет границы подсказки
			borderWidth: 1, // Ширина границы подсказки
			borderRadius: 14, // Закругление углов подсказки
			callbacks: {
				label: function (context: any) {
					return `$${context.parsed.y}` // Теперь только цена
				},
				title: () => '', // Убираем заголовок подсказки
			},
			displayColors: false, // Убираем цветовые квадраты
		},
		legend: {
			display: false, // Убираем легенду
		},
	},
}
