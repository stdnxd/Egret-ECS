/**
 * Created by jackyanjiaqi on 16/5/27.
 */
"use strict"

var FileUtil = require("./FileUtil");
const PATH = "../workspace.json";
let tConfig = null;

function readConfig(){
    tConfig = JSON.parse(FileUtil.read(FileUtil.joinPath(__dirname,PATH)));
    return tConfig;
}

function saveConfig(configObj){
    FileUtil.save(FileUtil.joinPath(__dirname,PATH),JSON.stringify(configObj,null,4));
}

function getProjectByName(projectName){
    let targetIndex = getProjectIndexByName(projectName);
    if(targetIndex !== -1){
        return tConfig.projects[targetIndex];
    }else{
        return null;
    }
}

function getProjectIndexByName(projectName){
    if(tConfig == null){
        readConfig();
    }
    let targetIndex = -1;
    for(let i=0;i<tConfig.projects.length;i++){
        if(projectName === tConfig.projects[i].name){
            return targetIndex = i;
        }
    }
    return targetIndex;
}

function saveProject(project){
    readConfig();
    let targetIndex = getProjectIndexByName(project.name);
    if(targetIndex !== -1){
        //替换
        tConfig.projects.splice(targetIndex,1,project);
        saveConfig(tConfig);
    }else{
        //新建
        tConfig.projects.push(project);
        saveConfig(tConfig);
    }
}

exports.readConfig = readConfig;
exports.saveConfig = saveConfig;
exports.saveProject = saveProject;
exports.getProjectByName = getProjectByName;
exports.getProjectIndexByName = getProjectIndexByName;