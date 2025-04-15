import { Routes, Route } from 'react-router-dom'
import MainScreen from './pages/MainScreen'
import KeyboardScreen from './pages/KeyboardScreen'
import QRCodeScreen from './pages/QRCodeScreen'
import PrintingScreen from './pages/PrintingScreen'
import CompleteScreen from './pages/CompleteScreen'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/keyboard" element={<KeyboardScreen />} />
      <Route path="/upload" element={<QRCodeScreen />} />
      <Route path="/printing" element={<PrintingScreen />} />
      <Route path="/complete" element={<CompleteScreen />} />
    </Routes>
  )
}

export default App
