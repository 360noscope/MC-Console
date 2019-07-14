const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1600,
        height: 900,
        center: true,
        resizable: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, '/assets/html/main.html'),
        protocol: 'file',
        slashes: true
    }))

    win.on('ready-to-show', () => {
        win.show();
        win.toggleDevTools();
    })
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})
