const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev'); // 개발/배포 구분

function createWindow() {
  const win = new BrowserWindow({
    width: isDev ? 1280 : 1080,
    height: isDev ? 800 : 1920,
    kiosk: !isDev,               // 개발 환경에선 false
    fullscreen: !isDev,          // 개발 환경에선 false
    frame: isDev,                // 메뉴바 표시 (개발 중에는 true)
    alwaysOnTop: !isDev,
    resizable: isDev,            // 창 크기 조절 가능
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.resolve(__dirname, 'preload.js'),
    },
  });

  // 로컬 서버 vs 빌드된 파일
  win.loadURL(
    isDev
      ? 'http://localhost:5173' // Vite dev 서버 주소
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools(); // 개발자 도구 자동 오픈
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
