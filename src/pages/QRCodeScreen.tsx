import { useEffect, useRef, useState } from 'react'
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

  const handleNext = () => {
    navigate('/keyboard')
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

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div
        className="flex flex-col items-center justify-between"
        style={{ width: '1080px', height: '1600px' }}
      >
        {/* 상단 로고 */}
        <img
          src="./festival_logo.png"
          alt="Festival Logo"
          className="mt-10 w-2/3 max-w-[600px]"
        />

        {/* 중앙 QR 코드 또는 업로드 이미지 */}
        <div className="flex flex-col items-center justify-center gap-8">
          {uploadedImage ? (
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="max-w-[500px] max-h-[700px] object-contain rounded-xl shadow-xl"
              />
          ) : qrUrl ? (
            <QRCodeSVG value={qrUrl} size={500} level="H" includeMargin />
          ) : (
            <p className="text-xl text-gray-500">QR 코드를 불러오는 중...</p>
          )}

          {/* 버튼 */}
          <div className="flex gap-8 mt-8">
            <button
              onClick={handleReset}
              className="bg-gray-300 text-black px-10 py-6 rounded-xl text-2xl font-semibold"
            >
              처음으로
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white px-10 py-6 rounded-xl text-2xl font-semibold"
            >
              다음으로
            </button>
          </div>
        </div>

        {/* 하단 로고 */}
        <img
          src="./logo.png"
          alt="Bottom Logo"
          className="mb-10 w-1/3 max-w-[300px]"
        />
      </div>
    </div>
  )
}

export default QRCodeScreen
