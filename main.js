const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')

// Modules
const AppInit = require('./server.js')
require('./modules/config.js')
require('./modules/mainproc.js')

// require('electron-debug')({enabled: true})
// require('electron-dl')()
require('electron-context-menu')()

const appMenu = require('./mainmenu')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  // return
}
function handleSquirrelEvent (application) {
  if (process.argv.length === 1) {
    return false
  }

  const ChildProcess = require('child_process')
  const path = require('path')

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  const spawn = function (command, args) {
    let spawnedProcess, error

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      })
    } catch (error) {}

    return spawnedProcess
  }

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args)
  }

  const squirrelEvent = process.argv[1]
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
    // Optionally do things such as:
    // - Add your .exe to the PATH
    // - Write to the registry for things like file associations and
    //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName])

      setTimeout(application.quit, 1000)
      return true

    case '--squirrel-uninstall':
    // Undo anything you did in the --squirrel-install and
    // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName])

      setTimeout(application.quit, 1000)
      return true

    case '--squirrel-obsolete':
    // This is called on the outgoing version of your app before
    // we update to the new version - it's the opposite of
    // --squirrel-updated

      application.quit()
      return true
  }
}

let appInit = new AppInit()
function createWindow () {
  // // Create the Application's main menu
  // const { app, Menu } = require("electron")


  appInit.getPort()
    .then((port) => {
      startServer(port)
    })
}

function startServer (appPort) {
  appInit.startServer().then(res => {
    if (res) {
      let icon = path.join(__dirname, 'assets/icons/win/bigstream_logo.png')
      // console.log("appPort listening = ", appPort)
      // Create the browser window.
      win = new BrowserWindow({
        title: app.getName(),
        width: 1024,
        height: 600,
        webPreferences: {
          webSecurity: false
        },
        minHeight: 600,
        minWidth: 1024,
        autoHideMenuBar: false,
        icon: icon
      })
      // and load the index.html of the app.
      // win.loadURL("http://localhost:3000")
      win.loadURL('http://localhost:' + appPort)

      // Open the DevTools.
      // win.webContents.openDevTools()
      win.setMenuBarVisibility(true)
      // fortest disbale menu
      // Menu.setApplicationMenu(appMenu)

      // Emitted when the window is closed.
      win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        console.log('quite BigstreamConsole')
        win = null
      })
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

app.on('browser-window-created', function (e, window) {
  // window.setMenu(null)
  // console.log("on browser-window-created")
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
