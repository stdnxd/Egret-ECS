'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const ipcMain = require('electron').ipcMain;
const fs = require('fs');

ipcMain.on('init-send',function (event,arg) {
	event.sender.send('console.log',arg+' named Jack!');
})

ipcMain.on('edit',function(event,arg1,arg2,arg3){
	event.sender.send('show',arg1,arg2,arg3);
});

ipcMain.on('path-got',function(event,args){
	// jumpTo('http://123.57.70.115/beta/egretpptdemo');
	jumpTo('file://' + __dirname + '/panel.html',function(){
		event.sender.send('path-init',args);
	});
	//jumpTo("file://" + __dirname + "/previewer/index.html");
	// event.sender.send('console.log',fs.readFileSync(arg,'utf-8'));
});

function jumpTo(jumpUrl,didFinishLoadCb){
	if(!mainWindow){
		mainWindow = new BrowserWindow({width:800,height:600});
	}
	mainWindow.loadURL(jumpUrl);
	mainWindow.webContents.openDevTools();
	if(didFinishLoadCb){
		mainWindow.webContents.once('did-finish-load',didFinishLoadCb);
	}
	mainWindow.on('closed',function () {
		mainWindow = null;
	})
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  // mainWindow.loadURL('file://' + __dirname + '/console.html');
  // mainWindow.loadURL('http://localhost:3000');
  mainWindow.loadURL('http://123.57.70.115/beta/egretpptdemo');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    //mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// app.on('ready', createWindow);
app.on('ready',function () {
	jumpTo('file://' + __dirname + '/main.html');
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    //createWindow();
     jumpTo('file://' + __dirname + '/main.html');
  }
});
