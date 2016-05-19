'use strict'
var FileUtil = require("./utils/FileUtil");
global['ecs'] = {
    scripts:{},
    configObj:null,
    openObj:null,
    res_config:"",//资源配置文件
    res_dir:"",//资源文件根目录
    openPath:""//打开的文件地址
}

global['ecs'].Class = function(id,name,obj){
    global['ecs'].scripts[name] = obj.properties;
}

function searchDir(path) {
    var fileList = FileUtil.getDirectoryAllListing(path);
    //readFromExternalJs(fileList[6]);
    //readFromExternalJs(fileList[7]);
    //readFromExternalJs(fileList[8]);
    //return readFromExternalJs(fileList[9]);
    //readFromExternalJs(fileList[10]);
    //readFromExternalJs(fileList[11]);
    fileList.forEach(readFromExternalJs);
    return global['ecs'].scripts;
}

function listAvailableSceneFiles(dir){
    let ret = [];
    FileUtil.findFiles(dir,ret,'scene');
    return ret;
}

function readSceneFile(sceneFilePath){
    global['ecs'].openObj = JSON.parse(FileUtil.read(sceneFilePath));
    global['ecs'].openPath = sceneFilePath;
    return global['ecs'].openObj;
}

function readResConfig(resConfigPath){
    global['ecs'].configObj = JSON.parse(FileUtil.read(resConfigPath));
    return global['ecs'].configObj;
}

function readFromExternalJs(filePath){
    var jsText = FileUtil.read(filePath);
    var index = jsText.indexOf("ecs.Class");
    if(index != -1){
        //截取ecs.Class之后的代码
        jsText = jsText.substr(index);
        eval(jsText);
    }
}

exports.searchDir = searchDir;
exports.readResConfig = readResConfig;
exports.readSceneFile = readSceneFile;
exports.listAvailableSceneFiles = listAvailableSceneFiles;