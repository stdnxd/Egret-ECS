'use strict'
var FileUtil = require("./utils/FileUtil");
global['ecs'] = {
    scripts:{
        "Sprite":{
            "texture":""
        },
        "Label":{
            "stroke":1,
            "strokeColor":1118481,
            "enableWrapText":true,
            "textAlign":"TOP",
            "text":"TEXT",
            "size":60
        },
        "Animation":{
            "defaultClip":""
        }
    },
    configObj:null,
    openObj:null,
    res_config:"",//资源配置文件
    res_dir:"",//资源文件根目录
    openPath:""//打开的文件地址
}

global['ecs'].Class = function(id,name,obj){
    global['ecs'].scripts[name] = obj.properties;
}

function initLoad(){

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

function saveSceneFile(sceneObjStr){
    //let gen = [];
    ////过滤掉__gui__属性
    //sceneObj.forEach(node=>{
    //    copyIncludeChildren(gen,node);
    //});
    //FileUtil.save(global['ecs'].openPath,JSON.stringify(gen,null,4));
    FileUtil.save(global['ecs'].openPath,sceneObjStr);
}

function copyIncludeChildren(putArray,node){
    let newNode = copyKeyValue(node);
    putArray.push(newNode);
    node.children.forEach(childNode=>{
        copyIncludeChildren(newNode.children,childNode);
    })
}

function copyKeyValue(obj){
    let ret = {};
    for(let p in obj){
        if(p === 'children'){
            ret[p] = [];
        }else
        if(p !== '__gui__'){
            ret[p] = obj[p];
        }
    }
    return ret;
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
exports.saveSceneFile = saveSceneFile;