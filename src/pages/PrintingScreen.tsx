import { useEffect, useState, CSSProperties, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { printerApi } from '../services/printerApi';

declare global {
  interface Window {
    envApi: {
      cwd: () => string;
    };
  }
}

declare global {
  interface Window {
    env: {
      cwd: () => string;
      downloadPath: () => string;
    };
  }
}

const PrintingScreen = () => {
  const navigate = useNavigate();
  const [dots, setDots] = useState('...');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('준비 중...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // 인쇄 진행 중 여부를 체크하는 ref 추가
  const printingInProgress = useRef(false);

  useEffect(() => {
    console.log('🖨️ PrintingScreen 컴포넌트 마운트');

    // 이미 인쇄 진행 중이면 중복 실행 방지
    if (printingInProgress.current) {
      console.log('🖨️ 인쇄가 이미 진행 중입니다. 중복 실행 방지');
      return;
    }

    if (!window.printerApi) {
      console.error('❌ printerApi가 정의되지 않았습니다!');
      setStatus('프린터 API를 찾을 수 없습니다.');
      setErrorDetails('Electron preload 스크립트에서 필요한 API가 노출되지 않았습니다.');
      return;
    }

    console.log('🖨️ printerApi 사용 가능:', window.printerApi);

    const printProcess = async () => {
      // 인쇄 시작 플래그 설정
      printingInProgress.current = true;
      
      try {
        setStatus('프린터 연결 중...');
        setProgress(10);

        console.log('📋 프린터 목록 요청 중...');
        const listResult = await printerApi.getDeviceList();
        console.log('📋 프린터 목록 응답:', listResult);

        if (!listResult.success) {
          console.error('❌ 프린터 목록 가져오기 실패:', listResult.error);
          setStatus('프린터 목록을 가져올 수 없습니다.');
          setErrorDetails(`상세 오류: ${listResult.error || '알 수 없는 오류'}`);
          return;
        }

        if (!listResult.devices || listResult.devices.length === 0) {
          console.error('❌ 프린터를 찾을 수 없습니다. 연결된 장치가 없습니다.');
          setStatus('프린터를 찾을 수 없습니다.');
          setErrorDetails('연결된 프린터가 없습니다. 프린터가 켜져 있고 USB로 연결되어 있는지 확인하세요.');
          return;
        }

        const selectedDevice = listResult.devices[0];
        console.log('🖨️ 선택된 프린터:', selectedDevice.name, '(DESC:', selectedDevice.description, ')');
        setProgress(20);

        setStatus('프린터 연결 중...');
        console.log('🔄 프린터 연결 시도 중...');
        const openResult = await printerApi.openDevice(selectedDevice.id);
        console.log('🔄 프린터 연결 결과:', openResult);

        if (!openResult.success) {
          console.error('❌ 프린터 연결 실패:', openResult.error);
          setStatus(`프린터 연결 실패`);
          setErrorDetails(`상세 오류: ${openResult.error || '알 수 없는 오류'}`);
          return;
        }

        setProgress(30);
        setStatus('카드 템플릿 불러오는 중...');

        let basePath = `${window.envApi.cwd()}/resources/1.jpg`;
        console.log('🖼️ 템플릿 이미지 경로 시도 1:', basePath);

        const fs = window.require ? window.require('fs') : null;

        setProgress(50);
        setStatus('사진 불러오는 중...');

        const photoPath = `${window.env.downloadPath()}/photo.png`;
        console.log('📸 사진 이미지 경로:', photoPath);

        if (fs && !fs.existsSync(photoPath)) {
          console.error('❌ 사진 파일이 존재하지 않습니다:', photoPath);
          setStatus('사진 파일을 찾을 수 없습니다.');
          setErrorDetails(`파일을 찾을 수 없습니다: ${photoPath}`);
          return;
        }

        const photoImgResult = await printerApi.drawImage({
          page: 0,
          panel: 1,
          x: 150,
          y: 150,
          width: 350,
          height: 300,
          imagePath: photoPath
        });
          

        console.log('📸 사진 이미지 그리기 결과:', photoImgResult);

        if (!photoImgResult.success) {
          console.error('❌ 사진 이미지 그리기 실패:', photoImgResult.error);
          setStatus(`사진 불러오기 실패`);
          setErrorDetails(`상세 오류: ${photoImgResult.error || '알 수 없는 오류'}`);
          return;
        }

        setProgress(70);
        setStatus('텍스트 출력 중...');

        const text = "부모님 감사합니다";
        console.log('📝 텍스트 그리기 시도:', text);

        setProgress(80);
        setStatus('인쇄 중...');
        console.log('🖨️ 인쇄 명령 전송 중...');
        const printResult = await printerApi.print();
        console.log('🖨️ 인쇄 명령 결과:', printResult);

        if (!printResult.success) {
          console.error('❌ 인쇄 실패:', printResult.error);
          setStatus(`인쇄 실패`);
          setErrorDetails(`상세 오류: ${printResult.error || '알 수 없는 오류'}`);
          return;
        }

        setProgress(100);
        setStatus('인쇄 완료!');

        console.log('🔄 프린터 연결 종료 중...');
        await printerApi.closeDevice();
        console.log('✅ 프린터 연결 종료됨');

        console.log('🔄 완료 페이지로 이동 예정...');
        setTimeout(() => {
          navigate('/complete');
        }, 1000);
      } catch (error) {
        console.error('❌ 인쇄 과정 오류:', error);
        setStatus(`오류 발생`);
        setErrorDetails(`예외 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      } finally {
        // 인쇄 완료 플래그 설정
        printingInProgress.current = false;
      }
    };

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (errorDetails) return prev;
        return Math.min(prev + 1, 95);
      });
    }, 250);

    printProcess();

    return () => {
      console.log('🖨️ PrintingScreen 컴포넌트 언마운트');
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      printerApi.closeDevice().catch(e => console.error('❌ 컴포넌트 언마운트 시 프린터 연결 해제 실패:', e));
    };
  }, [navigate]); // navigate만 의존성으로 유지

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

  // 오류 세부 정보 스타일
  const errorDetailsStyle: CSSProperties = {
    fontSize: '18px',
    color: '#555',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f8f8',
    borderRadius: '5px',
    maxWidth: '80%',
    textAlign: 'left',
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
    background: errorDetails
      ? 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)' // 에러 발생 시 빨간색
      : 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)', // 정상 진행 시 초록색
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

  // 재시도 버튼 스타일
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
  }

  const handleRetry = () => {
    // 페이지 새로고침
    window.location.reload();
  };

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
          <div style={{ ...carnationStyle, top: '-20px', left: '135px' }} className="carnation">
            <span role="img" aria-label="carnation">🌸</span>
          </div>
          <div style={{ ...carnationStyle, bottom: '-15px', right: '135px' }} className="carnation" >
            <span role="img" aria-label="carnation">🌸</span>
          </div>
        </div>

        {/* 인쇄 중 텍스트 */}
        <div style={mainTextStyle} className="message-text">
          {status}{dots}
        </div>

        {/* 오류 세부 정보 (오류가 있을 때만 표시) */}
        {errorDetails && (
          <div style={errorDetailsStyle}>
            {errorDetails}
          </div>
        )}

        {/* 재시도 버튼 (오류가 있을 때만 표시) */}
        {errorDetails && (
          <button
            style={retryButtonStyle}
            onClick={handleRetry}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#45a049';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#4CAF50';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            다시 시도하기
          </button>
        )}

        {/* 진행 상태 표시 */}
        <div style={progressContainerStyle}>
          <div style={{ ...progressBarStyle, width: `${progress}%` }}></div>
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
  );
};

export default PrintingScreen;