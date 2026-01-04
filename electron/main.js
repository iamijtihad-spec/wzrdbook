const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');

let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#0a0a0a',
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        startServer().then((port) => {
            mainWindow.loadURL(`http://localhost:${port}`);
        }).catch(err => {
            console.error('Failed to start server:', err);
        });
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
        if (serverProcess) serverProcess.kill();
    });
}

function startServer() {
    return new Promise((resolve, reject) => {
        const port = 3000; // Use fixed port or find free one
        const script = path.join(__dirname, '../.next/standalone/server.js');

        serverProcess = fork(script, [], {
            env: { ...process.env, PORT: port, HOSTNAME: 'localhost' }
        });

        serverProcess.on('error', (err) => reject(err));

        // Wait for port to be ready
        const interval = setInterval(() => {
            http.get(`http://localhost:${port}`, (res) => {
                clearInterval(interval);
                resolve(port);
            }).on('error', () => { });
        }, 500);
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (serverProcess) serverProcess.kill();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
