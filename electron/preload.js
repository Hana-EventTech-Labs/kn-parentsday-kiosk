const { contextBridge } = require('electron');
const path = require('path');
const koffi = require('koffi');
const fs = require('fs');

// DLL 경로 설정
const dllPath = path.join(__dirname, 'resources', 'SmartComm2.dll');
console.log('📂 DLL 경로:', dllPath);
console.log('📦 Koffi 버전:', koffi.version);
console.log('🧠 Electron arch:', process.arch);

// DLL 파일 존재 확인
if (!fs.existsSync(dllPath)) {
  console.error('❌ DLL 파일이 존재하지 않습니다:', dllPath);
  throw new Error(`DLL 파일을 찾을 수 없습니다: ${dllPath}`);
}
console.log('✅ DLL 파일 확인됨');

// DLL 로드
const smart = koffi.load(dllPath);
console.log('✅ DLL 로드 성공');

// 구조체 정의
const SMART_PRINTER_ITEM = koffi.struct('SMART_PRINTER_ITEM', {
  name: 'uint16[128]',
  id: 'uint16[64]',
  dev: 'uint16[64]',
  desc: 'uint16[256]',
  pid: 'int'
});

const SMART_PRINTER_LIST = koffi.struct('SMART_PRINTER_LIST', {
  n: 'int',
  item: koffi.array(SMART_PRINTER_ITEM, 32)
});

const DRAWTEXT2INFO = koffi.struct('DRAWTEXT2INFO', {
  x: 'int',
  y: 'int',
  cx: 'int',
  cy: 'int',
  rotate: 'int',
  align: 'int',
  fontHeight: 'int',
  fontWidth: 'int',
  style: 'int',
  color: 'uint32',
  option: 'int',
  szFaceName: 'uint16[32]'
});

// 함수 정의
const SmartComm_GetDeviceList2 = smart.stdcall('SmartComm_GetDeviceList2', 'int', ['void *']);
const SmartComm_OpenDevice2 = smart.stdcall('SmartComm_OpenDevice2', 'int', ['void **', 'void *', 'int']);
const SmartComm_DrawImage = smart.stdcall('SmartComm_DrawImage', 'int', ['void *', 'uint8', 'uint8', 'int', 'int', 'int', 'int', 'void *', 'void *']);
const SmartComm_DrawText2 = smart.stdcall('SmartComm_DrawText2', 'int', ['void *', 'uint8', 'uint8', 'void *', 'void *']);
const SmartComm_Print = smart.stdcall('SmartComm_Print', 'int', ['void *']);
const SmartComm_CloseDevice = smart.stdcall('SmartComm_CloseDevice', 'int', ['void *']);

let currentHandle = null;

// UTF-16LE 문자열 디코딩
const decodeWString = (uint16Array) => {
  return Buffer.from(uint16Array.buffer).toString('utf16le').replace(/\0/g, '');
};

contextBridge.exposeInMainWorld('printerApi', {
  getDeviceList: async () => {
    try {
      console.log('🔄 프린터 목록 조회 시작');
      
      const printerListSize = koffi.sizeof(SMART_PRINTER_LIST); // 👈 수정
      const printerListBuffer = Buffer.alloc(printerListSize);   // 👈 수정
  
      const result = SmartComm_GetDeviceList2(printerListBuffer);
      console.log('📊 SmartComm_GetDeviceList2 결과:', result);
  
      if (result !== 0) {
        return { success: false, error: `프린터 목록 조회 실패 (코드 ${result})` };
      }
  
      const parsed = koffi.decode(printerListBuffer, SMART_PRINTER_LIST);
      const devices = parsed.item.slice(0, parsed.n).map(device => ({
        name: decodeWString(device.name),
        id: decodeWString(device.id),
        dev: decodeWString(device.dev),
        desc: decodeWString(device.desc),
        pid: device.pid
      }));
  
      return { success: true, devices };
    } catch (err) {
      console.error('❌ 장치 목록 예외 발생:', err);
      return { success: false, error: err.message };
    }
  },
  

  openDevice: async (desc) => {
    try {
      console.log('🔌 장치 열기:', desc);
      const handlePtr = Buffer.alloc(koffi.sizeof('void *'));
      const descBuf = Buffer.alloc(512);
      descBuf.write(desc, 'utf16le');

      const result = SmartComm_OpenDevice2(handlePtr, descBuf, 2); // 2 = SMART_OPENDEVICE_BYDESC
      console.log('📟 openDevice2 결과:', result);

      if (result !== 0) {
        return { success: false, error: `장치 열기 실패 (코드 ${result})` };
      }

      currentHandle = koffi.decode(handlePtr, 'void *');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  drawImage: async ({ page = 0, panel = 1, x = 0, y = 0, width = 0, height = 0, imagePath }) => {
    try {
      console.log('🖼 이미지 경로:', imagePath);
      if (!fs.existsSync(imagePath)) {
        return { success: false, error: '이미지 파일 없음' };
      }

      // 구현 필요
      return { success: false, error: '미구현: 이미지 전송' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  drawText: async (params) => {
    try {
      console.log('📝 drawText 호출:', params);
      // 구현 필요
      return { success: false, error: '미구현: 텍스트 전송' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  print: async () => {
    try {
      console.log('🖨 인쇄 시작');
      if (!currentHandle) return { success: false, error: '연결된 장치 없음' };

      const result = SmartComm_Print(currentHandle);
      return result === 0
        ? { success: true }
        : { success: false, error: `인쇄 실패 (코드 ${result})` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  closeDevice: async () => {
    try {
      console.log('🔌 장치 닫기');
      if (!currentHandle) return { success: true };

      const result = SmartComm_CloseDevice(currentHandle);
      currentHandle = null;
      return result === 0
        ? { success: true }
        : { success: false, error: `장치 닫기 실패 (코드 ${result})` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getPreviewImage: async () => {
    return { success: false, error: '미구현' };
  }
});
