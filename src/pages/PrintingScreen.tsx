import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PrintingScreen = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/complete')
    }, 5000) // 5초 후 이동

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div
        className="flex flex-col items-center justify-between animate-fadeIn"
        style={{
          width: '1080px',
          height: '1600px',
        }}
      >
        <img
          src="./festival_logo.png"
          alt="Festival Logo"
          className="mt-10 w-2/3 max-w-[600px]"
        />

        <div className="text-6xl font-bold text-center text-gray-800 animate-pulse">
          인쇄 진행 중입니다
        </div>

        <img
          src="./logo.png"
          alt="Bottom Logo"
          className="mb-10 w-1/3 max-w-[300px]"
        />
      </div>
    </div>
  )
}

export default PrintingScreen
