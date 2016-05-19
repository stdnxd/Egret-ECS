'use strict';

const electron = require('electron');

//设成全局变量 便于IPC访问
global['ROUTE'] = require('./route');
global['SCRIPTOR'] = require('./scriptcollector');

const FileUtil = require('./utils/FileUtil');
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
});

ipcMain.on(ROUTE.PREVIEW_EDIT_SHOW,function(event,arg1,arg2,arg3){
	event.sender.send(ROUTE.PREVIEW_EDIT_SHOW,arg1,arg2,arg3);
});

ipcMain.on(ROUTE.SCENE_OPEN,function(event,scenePath){
	// jumpTo('http://123.57.70.115/beta/egretpptdemo');
	jumpTo('file://' + __dirname + '/panels/editor_container.html',function(){
		event.sender.send(ROUTE.SCENE_OPEN,scenePath);
	});
	//jumpTo("file://" + __dirname + "/previewer/index.html");
	// event.sender.send('console.log',fs.readFileSync(arg,'utf-8'));
});

ipcMain.on(ROUTE.WORKSPACE_EDIT,function(event,configObj){
	jumpTo('file://'+ __dirname + '/panels/ws_edit.html',function(){
		event.sender.send(ROUTE.WORKSPACE_EDIT,configObj);
	})
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


function upload(jumpUrl){
	jumpTo()
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
	let workspace_config = JSON.parse(FileUtil.read(FileUtil.joinPath(__dirname,"workspace.json")));
	jumpTo('file://' + __dirname + '/panels/ws_select.html',function(){
		mainWindow.webContents.send(ROUTE.WORKSPACE_INIT,workspace_config);
	});
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
	  let workspace_config = JSON.parse(FileUtil.read(FileUtil.joinPath(__dirname,"workspace.json")));
	  jumpTo('file://' + __dirname + '/panels/ws_select.html',function(){
		  mainWindow.webContents.send(ROUTE.WORKSPACE_INIT,workspace_config);
	  });
  }
});
