const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 1920,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 없어도 무방
    },
  })

  // build 디렉토리의 index.html 로드
  win.loadFile(path.join(__dirname, '../dist/index.html'))

  // 개발자 도구 열지 않기
  // win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
})
