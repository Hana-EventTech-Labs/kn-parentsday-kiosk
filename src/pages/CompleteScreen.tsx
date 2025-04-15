import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CompleteScreen = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 3000) // 3초 후 메인으로

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

        <div className="text-6xl font-bold text-center text-blue-600">
          인쇄 완료되었습니다
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

export default CompleteScreen
