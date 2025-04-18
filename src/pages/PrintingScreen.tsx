import { useEffect, useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

const PrintingScreen = () => {
  const navigate = useNavigate()
  const [dots, setDots] = useState('...')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/complete')
    }, 5000)

    // 점(...)의 애니메이션 효과
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    // 진행 상태 업데이트
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 100))
    }, 250)

    return () => {
      clearTimeout(timer)
      clearInterval(dotsInterval)
      clearInterval(progressInterval)
    }
  }, [navigate])
  
  // 상단 로고 컨테이너
  const topLogoContainerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '48px',
    paddingBottom: '24px',
    minHeight: '220px',
  }

  // 중앙 메시지 영역
  const contentStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '350px',
    position: 'relative',
    zIndex: 1,
  }

  // 메인 텍스트 스타일
  const mainTextStyle: CSSProperties = {
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#e75480', // 카네이션 핑크색
    marginBottom: '30px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  }

  // 프로그래스 바 컨테이너
  const progressContainerStyle: CSSProperties = {
    width: '60%',
    height: '25px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  }

  // 프로그래스 바 내부 채우기
  const progressBarStyle: CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    background: 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)', // 초록색 그라데이션
    borderRadius: '12px',
    transition: 'width 0.3s ease',
  }

  // 인쇄 아이콘 컨테이너
  const iconContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative',
  }

  // 인쇄 아이콘 애니메이션
  const printerIconStyle: CSSProperties = {
    fontSize: '100px',
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',
  }

  // 카네이션 아이콘 스타일
  const carnationStyle: CSSProperties = {
    fontSize: '44px',
    position: 'absolute',
    zIndex: 2,
  }

  // 하단 로고 절대 위치 고정
  const bottomLogoContainerStyle: CSSProperties = {
    position: 'absolute',
    bottom: '30px',
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '20px',
    zIndex: 1,
  }

  // 전체 컨테이너
  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: '#ffffff', // 순수한 흰색 배경으로 변경
    overflow: 'hidden',
  }

  // 세로 장식 테두리 스타일 (좌우)
  const verticalDecorStyle: CSSProperties = {
    position: 'absolute',
    height: '80%',
    width: '10px',
    top: '10%',
    background: 'linear-gradient(to bottom, rgba(231, 84, 128, 0.1), rgba(76, 175, 80, 0.1))',
    borderRadius: '5px',
    zIndex: 0,
  }

  return (
    <div style={containerStyle} className="relative">
      {/* 애니메이션용 CSS */}
      <style>
        {`
          @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.03); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes gentle-float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(3deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          
          .printer-icon {
            animation: bounce 1.5s infinite alternate;
          }
          
          .message-text {
            animation: pulse 2.5s infinite;
          }
          
          .carnation {
            animation: gentle-float 3s infinite;
          }
          
          .decor-left {
            left: 30px;
            animation: pulse 4s infinite;
          }
          
          .decor-right {
            right: 30px;
            animation: pulse 4s infinite 1s;
          }
        `}
      </style>

      {/* 좌우 세로 장식 */}
      <div style={verticalDecorStyle} className="decor-left"></div>
      <div style={verticalDecorStyle} className="decor-right"></div>

      {/* 상단 로고 */}
      <div style={topLogoContainerStyle}>
        <img
          src="./festival_logo.png"
          alt="Festival Logo"
          className="max-h-[220px]"
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '80%',
          }}
        />
      </div>

      {/* 중앙 텍스트 및 애니메이션 */}
      <div style={contentStyle}>
        {/* 프린터 아이콘과 장식 */}
        <div style={iconContainerStyle}>
          <div style={printerIconStyle} className="printer-icon">
            <span role="img" aria-label="printer">🖨️</span>
          </div>
          <div style={{...carnationStyle, top: '-20px', left: '135px'}} className="carnation">
            <span role="img" aria-label="carnation">🌸</span>
          </div>
          <div style={{...carnationStyle, bottom: '-15px', right: '135px'}} className="carnation" >
            <span role="img" aria-label="carnation">🌸</span>
          </div>
        </div>
        
        {/* 인쇄 중 텍스트 */}
        <div style={mainTextStyle} className="message-text">
          인쇄 진행 중입니다{dots}
        </div>
        
        {/* 진행 상태 표시 */}
        <div style={progressContainerStyle}>
          <div style={progressBarStyle}></div>
        </div>
      </div>

      {/* 하단 로고 */}
      <div style={bottomLogoContainerStyle}>
        <img
          src="./logo.png"
          alt="Bottom Logo"
          className="w-1/3 max-w-[300px] object-contain"
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '40%',
          }}
        />
      </div>
    </div>
  )
}

export default PrintingScreen