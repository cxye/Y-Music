// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut } = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const GLOBAL_SHORTCUT = {
  'CommandOrControl+Alt+Right': 'nextMusic',
  'CommandOrControl+Alt+Left': 'prevMusic',
  'CommandOrControl+Alt+Up': 'volumeUp',
  'CommandOrControl+Alt+Down': 'volumeDown',
  'CommandOrControl+Alt+S': 'changePlayingStatus'
};

const template = [
  {
    label: '编辑',
    submenu: [
      {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: '查看',
    submenu: [
      {
        label: '重载',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            // 重载之后, 刷新并关闭所有的次要窗体
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach(function (win) {
                if (win.id > 1) {
                  win.close();
                }
              });
            }
            focusedWindow.reload();
          }
        }
      },
      {
        label: '切换全屏',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F';
          } else {
            return 'F11';
          }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      },
      {
        label: '切换开发者工具',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I';
          } else {
            return 'Ctrl+Shift+I';
          }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      }
    ]
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [
      {
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ]
  }
];

ipcMain.on('min', () => mainWindow.minimize());
ipcMain.on('max', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('show', () => {
  mainWindow.show();
  mainWindow.focus();
});



function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 700,
    minHeight:700,
    minWidth:1050,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false  // false 允许跨域
    },
    frame:false,  // 隐藏状态栏
    titleBarStyle: 'hidden'  //mac隐藏状态栏
  })

  // 关闭window时触发下列事件
  mainWindow.on('close',function (e){
    Object.keys(GLOBAL_SHORTCUT).forEach((key) => {
      globalShortcut.register(key, () => {
        mainWindow.webContents.send('store-data', GLOBAL_SHORTCUT[key]);
      });
    });
  })

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000/')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
  createWindow();
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
