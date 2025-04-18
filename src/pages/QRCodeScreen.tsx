import { useEffect, useRef, useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

const QRCodeScreen = () => {
  const navigate = useNavigate()
  const socketRef = useRef<WebSocket | null>(null)

  const [eventId, setEventId] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch(
          'https://port-0-kiosk-builder-m47pn82w3295ead8.sel4.cloudtype.app/api/events/register?event_name=parents_day',
          {
            method: 'POST',
          }
        )
        const data = await res.json()
        setEventId(data.event_id)
        setQrUrl(data.qr_url)

        // WebSocket 연결
        const ws = new WebSocket(
          `wss://port-0-kiosk-builder-m47pn82w3295ead8.sel4.cloudtype.app/ws/kiosk/${data.event_id}`
        )
        socketRef.current = ws

        ws.onopen = () => console.log('📡 WebSocket 연결됨')
        ws.onclose = () => console.log('❌ WebSocket 종료됨')
        ws.onerror = (e) => console.error('WebSocket 오류:', e)
        ws.onmessage = (msg) => {
          const data = JSON.parse(msg.data)
          console.log('📥 WebSocket 메시지:', data)

          if (data.type === 'image_uploaded') {
            const imageUrl = `https://port-0-kiosk-builder-m47pn82w3295ead8.sel4.cloudtype.app${data.image_url}`
            setUploadedImage(imageUrl)
          }
        }
      } catch (err) {
        console.error('세션 생성 실패:', err)
      }
    }

    createSession()

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close()
      }
    }
  }, [])

  // 이미지를 로컬에 저장하는 함수를 수정합니다 (Electron의 fs 모듈 사용)
  const saveImageToLocal = async (url: string, filename = 'photo.png') => {
    try {
      console.log('이미지 저장 시작', url);
      
      // fileApi가 있는지 확인 (Electron 환경)
      if (window.fileApi) {
        console.log('Electron fileApi 사용');
        const result = await window.fileApi.saveImageFromUrl(url, filename);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        console.log('이미지 저장 성공:', result.filePath);
        return result.filePath;
      } else {
        // 일반 브라우저 환경에서는 다운로드 대화상자 사용
        console.log('일반 브라우저 다운로드 사용');
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(objectUrl);
        console.log('다운로드 다이얼로그 표시됨');
      }
    } catch (err) {
      console.error('이미지 저장 실패:', err);
    }
  };

  const handleNext = async () => {
    // 이미지가 있으면 먼저 로컬에 저장
    if (uploadedImage) {
      await saveImageToLocal(uploadedImage);
    }
  
    // 기존처럼 WebSocket 정리 & 서버 삭제 요청
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
  
    if (eventId) {
      try {
        await fetch(
          `https://port-0-kiosk-builder-m47pn82w3295ead8.sel4.cloudtype.app/api/events/${eventId}`,
          {
            method: 'DELETE',
          }
        );
      } catch (err) {
        console.error('세션 삭제 실패:', err);
      }
    }
  
    navigate('/keyboard');
  }

  const handleReset = async () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close()
    }

    if (eventId) {
      try {
        await fetch(
          `https://port-0-kiosk-builder-m47pn82w3295ead8.sel4.cloudtype.app/api/events/${eventId}`,
          {
            method: 'DELETE',
          }
        )
      } catch (err) {
        console.error('세션 삭제 실패:', err)
      }
    }

    navigate('/')
  }

  // 컨테이너 스타일 추가
  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative', // 절대 위치 지정을 위한 상대 위치 설정
    backgroundColor: '#ffffff',
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

  // 중앙 컨텐츠 스타일
  const contentContainerStyle: CSSProperties = {
    flex: '1',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '150px', // 하단 로고를 위한 공간 확보
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

      {/* 중앙 QR 코드 + 버튼 */}
      <div style={contentContainerStyle}>
        <div className="w-full max-w-[600px] flex flex-col items-center gap-12">
          {/* QR 코드 or 이미지 */}
          <div className="flex justify-center items-center w-full">
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Uploaded"
                style={{
                  width: '500px',
                  height: '500px',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            ) : qrUrl ? (
              <QRCodeSVG
                value={qrUrl}
                size={600}
                level="H"
                includeMargin
                style={{
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            ) : (
              <p className="text-xl text-gray-500">QR 코드를 불러오는 중...</p>
            )}
          </div>

          {/* 버튼 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              marginTop: '68px',
              marginBottom: '800px',
            }}
          >
            <button
              onClick={handleReset}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                padding: '24px 48px',
                borderRadius: '16px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '3px solid #d1d5db',
                minWidth: '200px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
              }}
            >
              처음으로
            </button>
            <button
              onClick={handleNext}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '24px 48px',
                borderRadius: '16px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '3px solid #ef4444',
                minWidth: '200px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
              }}
            >
              다음으로
            </button>
          </div>
        </div>
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
  )
}

export default QRCodeScreen