import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const MainScreen = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickAnywhere = () => {
      navigate('/upload')
    }

    window.addEventListener('click', handleClickAnywhere)
    window.addEventListener('touchstart', handleClickAnywhere)

    return () => {
      window.removeEventListener('click', handleClickAnywhere)
      window.removeEventListener('touchstart', handleClickAnywhere)
    }
  }, [navigate])

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div
        className="relative overflow-hidden"
        style={{
          width: '1080px',
          height: '1920px',
        }}
      >
        <img
          src="/main_bg.png"
          alt="이벤트 배경"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default MainScreen
