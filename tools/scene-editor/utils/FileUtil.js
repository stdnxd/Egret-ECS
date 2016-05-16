'use strict'

var FS = require("fs");
var Path = require("path");
var charset = "utf-8";
function save(path, data) {
    if (exists(path)) {
        remove(path);
    }
    path = escapePath(path);
    textTemp[path] = data;
    createDirectory(Path.dirname(path));
    FS.writeFileSync(path, data, charset);
}
exports.save = save;
function createDirectory(path, mode, made) {
    path = escapePath(path);
    if (mode === undefined) {
        mode = 511 & (~process.umask());
    }
    if (!made)
        made = null;
    if (typeof mode === 'string')
        mode = parseInt(mode, 8);
    path = Path.resolve(path);
    try {
        FS.mkdirSync(path, mode);
        made = made || path;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT':
                made = createDirectory(Path.dirname(path), mode, made);
                createDirectory(path, mode, made);
                break;
            default:
                var stat;
                try {
                    stat = FS.statSync(path);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory())
                    throw err0;
                break;
        }
    }
    return made;
}
exports.createDirectory = createDirectory;
var textTemp = {};
function read(path, ignoreCache) {
    if (ignoreCache === void 0) { ignoreCache = false; }
    path = escapePath(path);
    var text = textTemp[path];
    if (text && !ignoreCache) {
        return text;
    }
    try {
        text = FS.readFileSync(path, charset);
        text = text.replace(/^\uFEFF/, '');
    }
    catch (err0) {
        console.error(err0);
        return "";
    }
    if (text) {
        var ext = getExtension(path).toLowerCase();
        if (ext == "ts" || ext == "exml") {
            textTemp[path] = text;
        }
    }
    return text;
}
exports.read = read;
function readBinary(path) {
    path = escapePath(path);
    try {
        var binary = FS.readFileSync(path);
    }
    catch (e) {
        return null;
    }
    return binary;
}
exports.readBinary = readBinary;
function copy(source, dest) {
    source = escapePath(source);
    dest = escapePath(dest);
    var stat = FS.lstatSync(source);
    if (stat.isDirectory()) {
        _copy_dir(source, dest);
    }
    else {
        _copy_file(source, dest);
    }
}
exports.copy = copy;
function isDirectory(path) {
    path = escapePath(path);
    try {
        var stat = FS.statSync(path);
    }
    catch (e) {
        return false;
    }
    return stat.isDirectory();
}
exports.isDirectory = isDirectory;
function isSymbolicLink(path) {
    path = escapePath(path);
    try {
        var stat = FS.statSync(path);
    }
    catch (e) {
        return false;
    }
    return stat.isSymbolicLink();
}
exports.isSymbolicLink = isSymbolicLink;
function isFile(path) {
    path = escapePath(path);
    try {
        var stat = FS.statSync(path);
    }
    catch (e) {
        return false;
    }
    return stat.isFile();
}
exports.isFile = isFile;
function _copy_file(source_file, output_file) {
    createDirectory(Path.dirname(output_file));
    var byteArray = FS.readFileSync(source_file);
    FS.writeFileSync(output_file, byteArray);
}
function _copy_dir(sourceDir, outputDir) {
    createDirectory(outputDir);
    var list = FS.readdirSync(sourceDir);
    list.forEach(function (fileName) {
        copy(Path.join(sourceDir, fileName), Path.join(outputDir, fileName));
    });
}
function remove(path) {
    path = escapePath(path);
    try {
        FS.lstatSync(path).isDirectory()
            ? rmdir(path)
            : FS.unlinkSync(path);
        getDirectoryListing(path);
    }
    catch (e) {
    }
}
exports.remove = remove;
function rmdir(path) {
    var files = [];
    if (FS.existsSync(path)) {
        files = FS.readdirSync(path);
        files.forEach(function (file) {
            var curPath = path + "/" + file;
            if (FS.statSync(curPath).isDirectory()) {
                rmdir(curPath);
            }
            else {
                FS.unlinkSync(curPath);
            }
        });
        FS.rmdirSync(path);
    }
}
function rename(oldPath, newPath) {
    if (isDirectory(oldPath)) {
        FS.renameSync(oldPath, newPath);
    }
}
exports.rename = rename;
function getDirectory(path) {
    path = escapePath(path);
    return Path.dirname(path) + "/";
}
exports.getDirectory = getDirectory;
function getExtension(path) {
    path = escapePath(path);
    var index = path.lastIndexOf(".");
    if (index == -1)
        return "";
    var i = path.lastIndexOf("/");
    if (i > index)
        return "";
    return path.substring(index + 1);
}
exports.getExtension = getExtension;
function getFileName(path) {
    if (!path)
        return "";
    path = escapePath(path);
    var startIndex = path.lastIndexOf("/");
    var endIndex;
    if (startIndex > 0 && startIndex == path.length - 1) {
        path = path.substring(0, path.length - 1);
        startIndex = path.lastIndexOf("/");
        endIndex = path.length;
        return path.substring(startIndex + 1, endIndex);
    }
    endIndex = path.lastIndexOf(".");
    if (endIndex == -1 || isDirectory(path))
        endIndex = path.length;
    return path.substring(startIndex + 1, endIndex);
}
exports.getFileName = getFileName;
function getDirectoryListing(path, relative) {
    if (relative === void 0) { relative = false; }
    path = escapePath(path);
    try {
        var list = FS.readdirSync(path);
    }
    catch (e) {
        return [];
    }
    var length = list.length;
    if (!relative) {
        for (var i = length - 1; i >= 0; i--) {
            if (list[i].charAt(0) == ".") {
                list.splice(i, 1);
            }
            else {
                list[i] = joinPath(path, list[i]);
            }
        }
    }
    else {
        for (i = length - 1; i >= 0; i--) {
            if (list[i].charAt(0) == ".") {
                list.splice(i, 1);
            }
        }
    }
    return list;
}
exports.getDirectoryListing = getDirectoryListing;
function getDirectoryAllListing(path) {
    var list = [];
    if (isDirectory(path)) {
        var fileList = getDirectoryListing(path);
        for (var key in fileList) {
            list = list.concat(getDirectoryAllListing(fileList[key]));
        }
        return list;
    }
    return [path];
}
exports.getDirectoryAllListing = getDirectoryAllListing;
function search(dir, extension) {
    var list = [];
    try {
        var stat = FS.statSync(dir);
    }
    catch (e) {
        return list;
    }
    if (stat.isDirectory()) {
        findFiles(dir, list, extension, null);
    }
    return list;
}
exports.search = search;
function searchByFunction(dir, filterFunc, checkDir) {
    var list = [];
    try {
        var stat = FS.statSync(dir);
    }
    catch (e) {
        return list;
    }
    if (stat.isDirectory()) {
        findFiles(dir, list, "", filterFunc, checkDir);
    }
    return list;
}
exports.searchByFunction = searchByFunction;
function findFiles(filePath, list, extension, filterFunc, checkDir) {
    var files = FS.readdirSync(filePath);
    var length = files.length;
    for (var i = 0; i < length; i++) {
        if (files[i].charAt(0) == ".") {
            continue;
        }
        var path = joinPath(filePath, files[i]);
        var stat = FS.statSync(path);
        if (stat.isDirectory()) {
            if (checkDir) {
                if (!filterFunc(path)) {
                    continue;
                }
            }
            findFiles(path, list, extension, filterFunc);
        }
        else if (filterFunc != null) {
            if (filterFunc(path)) {
                list.push(path);
            }
        }
        else if (extension) {
            var len = extension.length;
            if (path.charAt(path.length - len - 1) == "." &&
                path.substr(path.length - len, len).toLowerCase() == extension) {
                list.push(path);
            }
        }
        else {
            list.push(path);
        }
    }
}
function exists(path) {
    path = escapePath(path);
    return FS.existsSync(path);
}
exports.exists = exists;
function escapePath(path) {
    if (!path)
        return "";
    return path.split("\\").join("/");
}
exports.escapePath = escapePath;
function joinPath(dir) {
    var filename = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        filename[_i - 1] = arguments[_i];
    }
    var path = Path.join.apply(null, arguments);
    path = escapePath(path);
    return path;
}
exports.joinPath = joinPath;
function getRelativePath(dir, filename) {
    var relative = Path.relative(dir, filename);
    return escapePath(relative);
    ;
}
exports.getRelativePath = getRelativePath;
function basename(p, ext) {
    var path = Path.basename.apply(null, arguments);
    path = escapePath(path);
    return path;
}
exports.basename = basename;
function relative(from, to) {
    var path = Path.relative.apply(null, arguments);
    path = escapePath(path);
    return path;
}
exports.relative = relative;
