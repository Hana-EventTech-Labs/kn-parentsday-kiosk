import { Routes, Route } from 'react-router-dom'
import MainScreen from './pages/MainScreen'
import KeyboardScreen from './pages/KeyboardScreen'
import QRCodeScreen from './pages/QRCodeScreen'
import PrintingScreen from './pages/PrintingScreen'
import CompleteScreen from './pages/CompleteScreen'

function App() {
  return (
    <div className="app-container" style={{
      position: 'relative',   // ✅ 필요
      overflow: 'auto',       // ✅ 스크롤이든 화면 넘김이든 허용
      width: '1080px',
      height: '1920px',
      maxWidth: '100%',
      maxHeight: '100%',
    }}>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/keyboard" element={<KeyboardScreen />} />
        <Route path="/upload" element={<QRCodeScreen />} />
        <Route path="/printing" element={<PrintingScreen />} />
        <Route path="/complete" element={<CompleteScreen />} />
      </Routes>
    </div>
  )
}

export default App
