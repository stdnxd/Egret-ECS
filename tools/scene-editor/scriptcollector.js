'use strict'
var FileUtil = require("./utils/FileUtil");
global['ecs'] = {
    scripts:{}
}

global['ecs'].Class = function(id,name,obj){
    global['ecs'].scripts[name] = obj.properties;
}

function searchDir(path){
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