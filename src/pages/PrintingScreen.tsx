import { useEffect, useState, useRef, CSSProperties } from 'react';
// import { useNavigate } from 'react-router-dom';
import { printerApi } from '../services/printerApi';

declare global {
  interface Window {
    envApi: {
      cwd: () => string;
    };
    env: {
      cwd: () => string;
      downloadPath: () => string;
    };
  }
}

const PrintingScreen = () => {
  // const navigate = useNavigate();
  const [dots, setDots] = useState('...');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('준비 중...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    console.log('[PrintingScreen] 렌더 완료됨 — 인쇄 대기 중');

    queueMicrotask(() => {
      console.log('[queueMicrotask] doPrint 실행');
      doPrint();
    });

    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 95));
    }, 250);

    return () => {
      // clearTimeout(timeoutId);
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      printerApi.closeDevice().catch(console.error);
    };
  }, []);

  const doPrint = async () => {
    try {
      setStatus('프린터 연결 중...');
      setProgress(10);

      // 잠깐 렌더링 시간 주기
      await new Promise(resolve => setTimeout(resolve, 100));

      const listResult = await printerApi.getDeviceList();
      if (!listResult.success || !listResult.devices || listResult.devices.length === 0) {
        throw new Error('연결된 프린터가 없습니다.');
      }

      const selectedDevice = listResult.devices[0];
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 100)); // 렌더 시간 주기

      const openResult = await printerApi.openDevice(selectedDevice.id);
      if (!openResult.success) {
        throw new Error('프린터 연결에 실패했습니다.');
      }

      setProgress(50);
      setStatus('사진 불러오는 중...');
      await new Promise(resolve => setTimeout(resolve, 100));

      const photoPath = `${window.env.downloadPath()}/photo.png`;
      const photoImgResult = await printerApi.drawImage({
        page: 0,
        panel: 1,
        x: 67,
        y: 100,
        width: 460,
        height: 370,
        imagePath: photoPath,
      });

      if (!photoImgResult.success) {
        throw new Error('사진 이미지 그리기에 실패했습니다.');
      }

      setProgress(70);
      setStatus('텍스트 출력 중...');

      // localStorage에서 사용자가 입력한 텍스트 가져오기
      const text = localStorage.getItem('userInputText') || "텍스트를 입력하세요";
      const textResult = await printerApi.drawText({
        page: 0,
        panel: 1,
        text: text,
        x: 60,
        y: 565,
        fontName: "KCC-은영체",  // 폰트명
        fontSize: 10,
        fontStyle: 0x01 // Bold적용
      });

      if (!textResult.success) {
        throw new Error('텍스트 출력에 실패했습니다.');
      }

      setProgress(80);
      setStatus('인쇄 중...');
      await new Promise(resolve => setTimeout(resolve, 100));

      const printResult = await printerApi.print();
      if (!printResult.success) {
        throw new Error('인쇄에 실패했습니다.');
      }

      setProgress(100);
      setStatus('인쇄 완료!');
      await printerApi.closeDevice();

      setTimeout(() => {
        window.location.hash = '#/complete'; // navigate도 가능
      }, 1000);

    } catch (error) {
      console.error('❌ 인쇄 과정 오류:', error);
      setStatus('오류 발생');
      setErrorDetails(error instanceof Error ? error.message : '알 수 없는 오류');
    }
  };



  // 스타일은 그대로 유지
  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  };

  const topLogoContainerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '48px',
    paddingBottom: '24px',
    minHeight: '220px',
  };

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
  };

  const mainTextStyle: CSSProperties = {
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#e75480',
    marginBottom: '30px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const errorDetailsStyle: CSSProperties = {
    fontSize: '18px',
    color: '#555',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f8f8',
    borderRadius: '5px',
    maxWidth: '80%',
    textAlign: 'left',
  };

  const progressContainerStyle: CSSProperties = {
    width: '60%',
    height: '25px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  };

  const progressBarStyle: CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    background: errorDetails
      ? 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)'
      : 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)',
    borderRadius: '12px',
    transition: 'width 0.3s ease',
  };

  const iconContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative',
  };

  const printerIconStyle: CSSProperties = {
    fontSize: '100px',
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',
  };

  const carnationStyle: CSSProperties = {
    fontSize: '44px',
    position: 'absolute',
    zIndex: 2,
  };

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
  };

  const verticalDecorStyle: CSSProperties = {
    position: 'absolute',
    height: '80%',
    width: '10px',
    top: '10%',
    background: 'linear-gradient(to bottom, rgba(231, 84, 128, 0.1), rgba(76, 175, 80, 0.1))',
    borderRadius: '5px',
    zIndex: 0,
  };

  const retryButtonStyle: CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div style={containerStyle} className="relative">
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
          .printer-icon { animation: bounce 1.5s infinite alternate; }
          .message-text { animation: pulse 2.5s infinite; }
          .carnation { animation: gentle-float 3s infinite; }
          .decor-left { left: 30px; animation: pulse 4s infinite; }
          .decor-right { right: 30px; animation: pulse 4s infinite 1s; }
        `}
      </style>

      <div style={verticalDecorStyle} className="decor-left"></div>
      <div style={verticalDecorStyle} className="decor-right"></div>

      <div style={topLogoContainerStyle}>
        <img
          src="./festival_logo.png"
          alt="Festival Logo"
          className="max-h-[220px]"
          style={{ display: 'block', margin: '0 auto', maxWidth: '80%' }}
        />
      </div>

      <div style={contentStyle}>
        <div style={iconContainerStyle}>
          <div style={printerIconStyle} className="printer-icon">
            <span role="img" aria-label="printer">🖨️</span>
          </div>
          <div style={{ ...carnationStyle, top: '-20px', left: '135px' }} className="carnation">
            <span role="img" aria-label="carnation">🌸</span>
          </div>
          <div style={{ ...carnationStyle, bottom: '-15px', right: '135px' }} className="carnation">
            <span role="img" aria-label="carnation">🌸</span>
          </div>
        </div>

        <div style={mainTextStyle} className="message-text">
          {status}{dots}
        </div>

        {errorDetails && <div style={errorDetailsStyle}>{errorDetails}</div>}

        {errorDetails && (
          <button
            style={retryButtonStyle}
            onClick={handleRetry}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#45a049';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#4CAF50';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            다시 시도하기
          </button>
        )}

        <div style={progressContainerStyle}>
          <div style={progressBarStyle}></div>
        </div>
      </div>

      <div style={bottomLogoContainerStyle}>
        <img
          src="./logo.png"
          alt="Bottom Logo"
          className="w-1/3 max-w-[300px] object-contain"
          style={{ display: 'block', margin: '0 auto', maxWidth: '40%' }}
        />
      </div>
    </div>
  );
};

export default PrintingScreen;