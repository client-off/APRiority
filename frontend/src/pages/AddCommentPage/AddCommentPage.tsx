import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { postEvent, on } from '@telegram-apps/bridge'

import './AddCommentPage.css'
import { FooterButton } from '@/components/FooterButton/FooterButton'

import defaultLike from './Reactions/default-like.svg'
import defaultDislike from './Reactions/default-dislike.svg'

import activeLike from './Reactions/active-like.svg'
import activeDislike from './Reactions/active-dislike.svg'
import { useLanguage } from '../LanguagePage/LanguageContext'

import { useTonAddress } from '@tonconnect/ui-react'

import { useInitData } from '@telegram-apps/sdk-react'

import { useTonWallet } from '@tonconnect/ui-react'

import axios from 'axios'

const addComment = async (
	address: string,
	commentData: {
		name: string
		user_address: string | undefined
		like: boolean
		text: string
	}
) => {
	try {
		const response = await axios.put(
			`http://127.0.0.1:5000/api/v1/collection/${address}/comments`,
			commentData,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)

		console.log('Комментарий успешно добавлен:', response.data)
	} catch (error) {
		console.error('Ошибка при добавлении комментария:', error)
	}
}

export const AddCommentPage: FC = () => {
	const initData = useInitData()
	const user = initData?.user
	const location = useLocation()
	const [liked, setLiked] = useState(false)
	const [disliked, setDisliked] = useState(false)
	const [commentText, setCommentText] = useState('') // Состояние для текста комментария

	const [ownership, setOwnership] = useState(false)

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false)

	const wallet = useTonWallet()

	const navigate = useNavigate()

	const { language } = useLanguage() // Получите текущий язык

	const address = location.state.address
	const user_address = useTonAddress()

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
		navigate('/comments', { state: { address: address } })
	})

	const isFormValid = commentText.trim() !== '' && (liked || disliked) // Проверяем, заполнен ли текст и выбрана ли реакция

	const handleLike = () => {
		setLiked(true)
		setDisliked(false)
	}

	const handleDislike = () => {
		setDisliked(true)
		setLiked(false)
	}

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCommentText(e.target.value) // Обновляем состояние текста комментария
	}

	const checkOwnership = async (address: string, wallet: string) => {
		try {
			const response = await axios.get<boolean>(
				`http://127.0.0.1:5000/api/v1/collection/${address}/ownership/${wallet}`
			)
			const data = response.data

			setOwnership(data)
		} catch (error) {
			setOwnership(false)
		}
	}

	const handleAddComment = (e: React.MouseEvent<HTMLDivElement>) => {
		const commentData = {
			name: `${user?.firstName} ${user?.lastName ? user.lastName : ''}`,
			user_address: user_address,
			like: liked,
			text: commentText,
		}

		checkOwnership(address, user_address)

		if (wallet) {
			console.log(wallet.account.address)
		} else {
			setIsModalOpen(true)
			return
		}

		if (ownership) {
			addComment(address, commentData)
			console.log(e)
			navigate(-1)
		} else {
			setIsOwnerModalOpen(true)
			return
		}
	}

	const [isDarkTheme, setIsDarkTheme] = useState(false)

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
		<form>
			<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
				<div className='container'>
					<div className='container-title'>
						<div className='container-title__start'>
							<div className='title'>
								{language === 'ru' ? 'Добавить комментарий' : 'Add comment'}
							</div>
						</div>
					</div>
					<div className='container-input'>
						<div className='container-input-header'>
							{language === 'ru' ? 'ВАШ ТЕКСТ' : 'YOUR TEXT'}
						</div>
						<div className='container-input-input'>
							<textarea
								placeholder={
									language === 'ru'
										? 'Введите ваш комментарий'
										: 'Enter your comment'
								}
								onChange={handleTextChange} // Обработчик изменения текста
							/>
						</div>
					</div>
					<div className='container-reaction'>
						<div
							className='container-reaction__dislike'
							onClick={handleDislike}
						>
							<img src={disliked ? activeDislike : defaultDislike} alt='' />
						</div>
						<div className='container-reaction__like' onClick={handleLike}>
							<img src={liked ? activeLike : defaultLike} alt='' />
						</div>
					</div>
				</div>
				<div onClick={handleAddComment}>
					<FooterButton
						buttonText={
							language === 'ru' ? 'Отправить комментарий' : 'Send comment'
						}
						active={isFormValid}
					/>
				</div>{' '}
				{/* Используем состояние для активности кнопки */}
			</div>
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
			{isOwnerModalOpen && (
				<div className='modal'>
					<div className='modal-content'>
						<span className='close' onClick={() => setIsOwnerModalOpen(false)}>
							&times;
						</span>
						<div className='modal-content__title'>
							{language === 'ru' ? 'Упс...' : 'Oops...'}
						</div>
						<div className='modal-content__address'>
							{language === 'ru'
								? 'Чтобы опубликовать ваш комментарий к коллекции на вашем кошельке должна быть нфт с неё!'
								: 'To publish your comment on a collection, you must have NFT from it in your wallet!'}
						</div>
						<div
							className='button'
							onClick={() => {
								setIsOwnerModalOpen(false)
							}}
						>
							{language === 'ru' ? 'Закрыть' : 'Close'}
						</div>
					</div>
				</div>
			)}
		</form>
	)
}
