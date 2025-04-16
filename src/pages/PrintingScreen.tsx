import { useEffect, useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { printerApi } from '../services/printerApi';

const PrintingScreen = () => {
  const navigate = useNavigate();
  const [dots, setDots] = useState('...');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('준비 중...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    console.log('🖨️ PrintingScreen 컴포넌트 마운트');
    
    if (!window.printerApi) {
      console.error('❌ printerApi가 정의되지 않았습니다!');
      setStatus('프린터 API를 찾을 수 없습니다.');
      setErrorDetails('Electron preload 스크립트에서 필요한 API가 노출되지 않았습니다.');
      return;
    }
    
    console.log('🖨️ printerApi 사용 가능:', window.printerApi);

    const printProcess = async () => {
      try {
        // 상태 업데이트
        setStatus('프린터 연결 중...');
        setProgress(10);

        // 프린터 목록 조회
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

        // 첫 번째 프린터 선택
        const deviceId = listResult.devices[0].id;
        console.log('🖨️ 선택된 프린터:', listResult.devices[0].name, '(ID:', deviceId, ')');
        setProgress(20);

        // 프린터 연결
        setStatus('프린터 연결 중...');
        console.log('🔄 프린터 연결 시도 중...');
        const openResult = await printerApi.openDevice(deviceId);
        console.log('🔄 프린터 연결 결과:', openResult);
        
        if (!openResult.success) {
          console.error('❌ 프린터 연결 실패:', openResult.error);
          setStatus(`프린터 연결 실패`);
          setErrorDetails(`상세 오류: ${openResult.error || '알 수 없는 오류'}`);
          return;
        }
        
        setProgress(30);

        // 기본 이미지 그리기
        setStatus('카드 템플릿 불러오는 중...');
        
        // 이미지 경로 처리 개선
        let basePath = `${process.cwd()}/resources/1.jpg`;
        console.log('🖼️ 템플릿 이미지 경로 시도 1:', basePath);
        
        // 만약 첫 번째 경로가 실패하면 다른 경로 시도
        const fs = window.require ? window.require('fs') : null;
        const path = window.require ? window.require('path') : null;
        
        if (fs && !fs.existsSync(basePath) && path) {
          basePath = path.join(__dirname, 'resources', '1.jpg');
          console.log('🖼️ 템플릿 이미지 경로 시도 2:', basePath);
          
          if (!fs.existsSync(basePath)) {
            // 애플리케이션 루트 기준 경로 시도
            basePath = './resources/1.jpg';
            console.log('🖼️ 템플릿 이미지 경로 시도 3:', basePath);
          }
        }
        
        console.log('🖼️ 최종 선택된 템플릿 이미지 경로:', basePath);
        
        const baseImgResult = await printerApi.drawImage({
          page: 0,
          panel: 1,
          x: 0,
          y: 0,
          width: 638,
          height: 1011,
          imagePath: basePath
        });
        
        console.log('🖼️ 템플릿 이미지 그리기 결과:', baseImgResult);
        
        if (!baseImgResult.success) {
          console.error('❌ 템플릿 이미지 그리기 실패:', baseImgResult.error);
          setStatus(`카드 템플릿 불러오기 실패`);
          setErrorDetails(`상세 오류: ${baseImgResult.error || '알 수 없는 오류'}`);
          return;
        }
        
        setProgress(50);

        // 사진 이미지 그리기
        setStatus('사진 불러오는 중...');
        // 여기서는 로컬에 저장된 photo.png를 사용한다고 가정
        const photoPath = `${process.env.HOME || process.env.USERPROFILE}/Downloads/photo.png`;
        console.log('📸 사진 이미지 경로:', photoPath);
        
        // 사진 파일 존재 확인
        if (fs && !fs.existsSync(photoPath)) {
          console.error('❌ 사진 파일이 존재하지 않습니다:', photoPath);
          setStatus('사진 파일을 찾을 수 없습니다.');
          setErrorDetails(`파일을 찾을 수 없습니다: ${photoPath}`);
          return;
        }
        
        const photoImgResult = await printerApi.drawImage({
          page: 0,
          panel: 1,
          x: 56,
          y: 292,
          width: 545,
          height: 545,
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

        // 텍스트 출력 예시 (VirtualKeyboard에서 입력된 텍스트를 사용)
        setStatus('텍스트 출력 중...');
        // 실제로는 상태 관리를 통해 텍스트를 받아와야 함
        const text = "부모님 감사합니다"; 
        console.log('📝 텍스트 그리기 시도:', text);
        
        const textResult = await printerApi.drawText({
          page: 0,
          panel: 1,
          x: 0,
          y: 50,
          width: 400,
          height: 100,
          fontName: "LAB디지털",
          fontSize: 32,
          fontStyle: 1, // Bold
          color: 0x0000FF, // Red (BGR 형식)
          text
        });
        
        console.log('📝 텍스트 그리기 결과:', textResult);
        
        if (!textResult.success) {
          console.error('❌ 텍스트 그리기 실패:', textResult.error);
          setStatus(`텍스트 출력 실패`);
          setErrorDetails(`상세 오류: ${textResult.error || '알 수 없는 오류'}`);
          return;
        }
        
        setProgress(80);

        // 인쇄 명령 실행
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

        // 프린터 연결 해제
        console.log('🔄 프린터 연결 종료 중...');
        await printerApi.closeDevice();
        console.log('✅ 프린터 연결 종료됨');

        // 완료 페이지로 이동
        console.log('🔄 완료 페이지로 이동 예정...');
        setTimeout(() => {
          navigate('/complete');
        }, 1000);
      } catch (error) {
        console.error('❌ 인쇄 과정 오류:', error);
        setStatus(`오류 발생`);
        setErrorDetails(`예외 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    };

    // 점(...) 애니메이션 효과
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // 진행 상태 업데이트
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // 에러가 발생하면 진행 상태를 더 이상 업데이트하지 않음
        if (errorDetails) return prev;
        return Math.min(prev + 1, 95); // 최대 95%까지만 자동 증가 (실제 완료될 때 100%로 설정)
      });
    }, 250);

    // 인쇄 과정 시작
    printProcess();

    return () => {
      console.log('🖨️ PrintingScreen 컴포넌트 언마운트');
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      // 컴포넌트 언마운트 시 프린터 연결 해제 확보
      printerApi.closeDevice().catch(e => console.error('❌ 컴포넌트 언마운트 시 프린터 연결 해제 실패:', e));
    };
  }, [navigate]);
  
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
          <div style={{...carnationStyle, top: '-20px', left: '135px'}} className="carnation">
            <span role="img" aria-label="carnation">🌸</span>
          </div>
          <div style={{...carnationStyle, bottom: '-15px', right: '135px'}} className="carnation" >
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
          <div style={{...progressBarStyle, width: `${progress}%`}}></div>
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