const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const url = require('url');
const path = require('path');

let win;

app.on('ready', () => {
    win = new BrowserWindow({backgroundColor: '#e0e0e0', width:800, height:600, show: true,webPreferences: {
        webSecurity: false
    }});
    win.loadURL('https://serp.pzfresh.com');

    win.once('ready-to-show', () => {
        win.show();
        win.setMovable(true);
        // win.webContents.openDevTools();
    });

    win.on('closed', () => {
        app.quit();
        win = null;
    });
});