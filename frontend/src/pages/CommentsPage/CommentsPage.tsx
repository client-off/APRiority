import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { postEvent, on } from '@telegram-apps/bridge'

import './CommentsPage.css'
import { FooterButton } from '@/components/FooterButton/FooterButton'

import like from './Reactions/thumbs-up.svg'
import dislike from './Reactions/thumbs-down.svg'

import testAvatar from './TestAvatar/Jared.svg'
import { Link } from '@/components/Link/Link'
import { useLanguage } from '../LanguagePage/LanguageContext' // Импортируйте контекст
import axios from 'axios'

interface Comment {
	collection: string
	name: string
	time: string
	like: boolean
	text: string
}

const fetchComments = async (address: string): Promise<Comment[] | []> => {
	try {
		const response = await axios.get(
			`http://127.0.0.1:5000/api/v1/collection/${address}`
		)
		return response.data as Comment[] // Приведение к типу CollectionData
	} catch (error) {
		console.error(error)
		return []
	}
}

export const CommentsPage: FC = () => {
	const location = useLocation()
	const [isDarkTheme, setIsDarkTheme] = useState(false)
	const navigate = useNavigate()
	const { language } = useLanguage() // Получите текущий язык

	const [comments, setComments] = useState<Comment[] | []>([])

	const address = location.state.address

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
		navigate('/collection', { state: { address: address } })
	})

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		if (savedTheme === 'dark') {
			setIsDarkTheme(true)
			document.body.classList.add('dark-theme') // Добавляем класс на body
		} else {
			document.body.classList.remove('dark-theme') // Убираем класс с body
		}

		const getData = async () => {
			const data = await fetchComments(address)
			if (data) {
				setComments(data)
			}
		}

		getData()
	}, [address])

	return (
		<div className={`wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
			<div className='container'>
				<div className='container-title'>
					<div className='container-title__start'>
						<div className='title'>
							{language === 'ru' ? 'Комментарии' : 'Comments'}
						</div>
					</div>
				</div>
				<div className='container-comments'>
					{comments.map((comment, index) => (
						<div key={index} className='container-comment'>
							<div className='container-comment-up'>
								<div className='container-comment-up__text'>{comment.text}</div>
								<div className='container-comment-up__reaction'>
									<img src={comment.like ? like : dislike} alt='' />
								</div>
							</div>
							<div className='line'></div>
							<div className='container-comment-down'>
								<div className='container-comment-down__user'>
									<div className='container-comment-down__user-avatar'>
										<img src={testAvatar} alt='' />
									</div>
									<div className='container-comment-down__user-name'>
										{comment.name}
									</div>
								</div>
								<div className='container-comment-down__date'>
									{comment.time}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<Link state={{ address: address }} to={'/addcomment'}>
				<FooterButton
					buttonText={
						language === 'ru' ? 'Добавить комментарий' : 'Add comment'
					}
					active={true}
				/>
			</Link>
		</div>
	)
}
