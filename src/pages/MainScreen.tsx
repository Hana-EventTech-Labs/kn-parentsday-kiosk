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
    <div
      className="flex items-center justify-center overflow-hidden bg-black"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: '1080px',
          height: '1920px',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <img
          src="./main_bg.png"
          alt="이벤트 배경"
          className="w-full h-full object-cover"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      </div>
    </div>
  )
}

export default MainScreen
