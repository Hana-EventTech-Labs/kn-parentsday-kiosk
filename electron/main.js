const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 1920,
    kiosk: true,             // ✅ 키오스크 모드
    fullscreen: true,        // ✅ 전체화면
    frame: false,            // ✅ 상단 메뉴바 제거
    alwaysOnTop: true,       // ✅ 항상 위
    webPreferences: {
      contextIsolation: true,
    },
  })

  win.loadFile(path.join(__dirname, '../dist/index.html'))

  // win.webContents.openDevTools() // 개발자도구 off
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
