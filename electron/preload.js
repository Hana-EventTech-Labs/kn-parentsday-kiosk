try {
  const { contextBridge } = require('electron');
  const path = require('path');
  const koffi = require('koffi');
  const fs = require('fs');

  const dllPath = path.join(__dirname, 'resources', 'SmartComm2.dll');
  console.log('📂 DLL 경로:', dllPath);
  console.log('📦 Koffi 버전:', koffi.version);
  console.log('🧠 Electron arch:', process.arch);
  
  // DLL 파일 존재 확인
  if (!fs.existsSync(dllPath)) {
    console.error('❌ DLL 파일이 존재하지 않습니다:', dllPath);
    throw new Error(`DLL 파일을 찾을 수 없습니다: ${dllPath}`);
  } else {
    console.log('✅ DLL 파일 확인됨:', dllPath);
  }

  let currentHandle = null;

  // DLL 로드
  console.log('🔄 DLL 로드 시도 중...');
  const smart = koffi.load(dllPath);
  console.log('✅ DLL 로드 성공');

  // Struct 정의
  console.log('🔄 구조체 정의 시도 중...');
  
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

  console.log('✅ 구조체 정의 성공');
  console.log('🔄 함수 정의 시도 중...');
  
  try {
    // 기본 방식으로 DLL 함수 가져오기
    const SmartComm_GetDeviceList2 = smart.stdcall('SmartComm_GetDeviceList2', 'int', ['void *']);
    const SmartComm_OpenDevice2 = smart.stdcall('SmartComm_OpenDevice2', 'int', ['void **', 'void *', 'int']);
    const SmartComm_DrawImage = smart.stdcall('SmartComm_DrawImage', 'int', ['void *', 'uint8', 'uint8', 'int', 'int', 'int', 'int', 'void *', 'void *']);
    const SmartComm_DrawText2 = smart.stdcall('SmartComm_DrawText2', 'int', ['void *', 'uint8', 'uint8', 'void *', 'void *']);
    const SmartComm_Print = smart.stdcall('SmartComm_Print', 'int', ['void *']);
    const SmartComm_CloseDevice = smart.stdcall('SmartComm_CloseDevice', 'int', ['void *']);
    
    console.log('✅ 함수 정의 성공');

    // API 노출
    contextBridge.exposeInMainWorld('printerApi', {
      getDeviceList: async () => {
        try {
          console.log('🔄 장치 목록 가져오기 시작...');
          
          // 메모리 할당 및 리스트 초기화
          let printerList = {};
          printerList.n = 0;
          printerList.item = [];
          
          // SMART_PRINTER_LIST 버퍼로 변환
          const printerListPtr = Buffer.from(SMART_PRINTER_LIST.size);
          
          console.log('✅ SMART_PRINTER_LIST 메모리 할당됨, 크기:', SMART_PRINTER_LIST.size);
          console.log('🔄 SmartComm_GetDeviceList2 함수 호출...');
          
          const result = SmartComm_GetDeviceList2(printerListPtr);
          console.log('📊 SmartComm_GetDeviceList2 결과:', result);

          if (result !== 0) {
            console.error('❌ 장치 목록 가져오기 실패, 결과 코드:', result);
            return { success: false, error: `장치 검색 실패 (코드: ${result})` };
          }

          // 결과 처리 (임시로 빈 배열 반환)
          console.log('📋 임시로 빈 프린터 목록 반환'); 
          return { 
            success: true, 
            devices: [{
              name: "테스트 프린터",
              id: "test_printer_id",
              device: "TestDevice",
              description: "테스트 용도의 가상 프린터",
              pid: 1
            }] 
          };
        } catch (err) {
          console.error('❌ 장치 목록 가져오기 예외 발생:', err);
          return { success: false, error: `예외 발생: ${err.message}` };
        }
      },

      openDevice: async (deviceId) => {
        try {
          console.log('🔄 장치 연결 시도:', deviceId);
          
          // 테스트를 위해 성공으로 처리
          console.log('✅ 테스트용 장치 연결 성공 처리');
          currentHandle = {};  // 임시 핸들
          
          return { success: true };
        } catch (e) {
          console.error('❌ 장치 연결 예외 발생:', e);
          return { success: false, error: e.message };
        }
      },

      drawImage: async ({ page = 0, panel = 1, x = 0, y = 0, width = 0, height = 0, imagePath }) => {
        try {
          console.log('🔄 이미지 그리기 시도:', imagePath);
          
          // 이미지 파일 존재 확인
          if (!fs.existsSync(imagePath)) {
            console.error('❌ 이미지 파일이 존재하지 않습니다:', imagePath);
            return { success: false, error: `이미지 파일을 찾을 수 없습니다: ${imagePath}` };
          }
          
          // 테스트를 위해 성공으로 처리
          console.log('✅ 테스트용 이미지 그리기 성공 처리');
          
          return { success: true };
        } catch (e) {
          console.error('❌ 이미지 그리기 예외 발생:', e);
          return { success: false, error: e.message };
        }
      },

      drawText: async ({ page = 0, panel = 1, text, x, y, width, height, fontName, fontSize, fontStyle, color }) => {
        try {
          console.log('🔄 텍스트 그리기 시도:', text);
          
          // 테스트를 위해 성공으로 처리
          console.log('✅ 테스트용 텍스트 그리기 성공 처리');
          
          return { success: true };
        } catch (e) {
          console.error('❌ 텍스트 그리기 예외 발생:', e);
          return { success: false, error: e.message };
        }
      },

      print: async () => {
        try {
          console.log('🔄 인쇄 시도...');
          
          // 테스트를 위해 성공으로 처리
          console.log('✅ 테스트용 인쇄 성공 처리');
          
          return { success: true };
        } catch (e) {
          console.error('❌ 인쇄 예외 발생:', e);
          return { success: false, error: e.message };
        }
      },

      closeDevice: async () => {
        try {
          console.log('🔄 장치 연결 종료 시도...');
          
          // 테스트를 위해 성공으로 처리
          console.log('✅ 테스트용 장치 연결 종료 성공 처리');
          currentHandle = null;
          
          return { success: true };
        } catch (e) {
          console.error('❌ 장치 연결 종료 예외 발생:', e);
          return { success: false, error: e.message };
        }
      },

      getPreviewImage: async () => {
        return { success: false, error: '미구현' };
      }
    });
  } catch (e) {
    console.error('❌ 함수 정의 오류:', e.message);
    throw e;
  }

} catch (e) {
  console.error('❌ preload.js 에러 발생:', e.message);
  console.error(e);
}