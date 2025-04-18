import { useState, CSSProperties, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VirtualKeyboard from '../components/VirtualKeyboard';

const KeyboardScreen = () => {
  const [input, setInput] = useState('')
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();

  // input이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (input) {
      localStorage.setItem('userInputText', input);
    }
  }, [input]);

  const handlePrint = () => {
    if (isNavigating) return; // 중복 방지
    setIsNavigating(true);
  
    // DOM 업데이트 시간을 조금 주고 navigate
    setTimeout(() => {
      navigate('/printing');
    }, 100); // 100ms 정도 주면 충분
  };

  // 메인 컨테이너 스타일
  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#ffffff',
    position: 'relative', // 절대 위치 지정을 위해 상대 위치 설정
  };

  // 상단 로고 스타일
  const topLogoContainerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '48px',
    paddingBottom: '24px',
  };

  // 키보드 컨테이너 스타일
  const keyboardContainerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '0px', // 상단 로고와의 간격 조정
  };

  // 하단 로고 스타일 - 절대 위치로 고정
  const bottomLogoContainerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '30px', // 화면 하단에서 30px 위에 배치
    left: 0,
    paddingBottom: '20px',
  };

  return (
    <div style={containerStyle}>
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

      {/* 키보드 영역 */}
      <div style={keyboardContainerStyle}>
        <VirtualKeyboard onChange={setInput} onPrint={handlePrint} />
      </div>

      {/* 하단 로고 - 절대 위치로 고정 */}
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
  );
};

export default KeyboardScreen;