var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = this;
        _super.call(this);
        //常量
        this.constants = null;
        //客户端全局electron对象
        this.electron = null;
        this.groupCount = 0;
        this.domain = null; //空间域
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.electron = parent['require']('electron');
        this.constants = this.electron.remote.getGlobal("ecs");
        var ROUTE = this.electron.remote.getGlobal("ROUTE");
        //节点属性编辑
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_EDIT_SHOW, function (event, propName, val, node) {
            console.log(ROUTE.PREVIEW_EDIT_SHOW, propName, val, node);
            if (val.indexOf('.') != -1) {
                _this.domain.reference[node.id][propName] = parseFloat(val);
            }
            else {
                _this.domain.reference[node.id][propName] = parseInt(val);
            }
        });
        //节点选中状态
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_NODE_SELECT, function (event, node, isSelect) {
            console.log('on_node_select', node, _this.domain.reference[node.id], isSelect);
            if (isSelect) {
                ecs.selectNode(_this.domain.reference[node.id]);
            }
            else {
                ecs.cancelSelectNode(_this.domain.reference[node.id]);
            }
        });
        //节点增删
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_NODE_ADD_REMOVE, function (event, type, addArrayId, nodeWrapper) {
            if (type === "add") {
                var addArray = null;
                //step1.创建节点
                var tempNode = new ecs.Node(nodeWrapper);
                //使用instantiate函数创建可视化的节点
                var newNode = ecs.instantiate(tempNode);
                //step2.注册id
                _this.domain.reference[nodeWrapper.id] = newNode;
                //step3.组装关系
                if (addArrayId < 0) {
                    //顶层节点编号
                    _this.domain.topIds.push(nodeWrapper.id);
                    newNode.parent = null;
                    _this.addChild(newNode._raw);
                }
                else {
                    var parentNode = _this.domain.reference[addArrayId];
                    parentNode.addChild(newNode);
                }
                //addArray.push(newNode);
                ////step4.可预览
                //newNode.visualable = false;
                console.log('raw', _this.domain.reference[addArrayId]._raw);
            }
            else if (type === "remove") {
                var rNode = _this.domain.reference[nodeWrapper.id];
            }
        });
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function () {
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig(this.constants.res_config, this.constants.res_dir);
    };
    p.onConfigComplete = function () {
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
        this.constants.configObj.groups.forEach(function (groupObj) {
            console.log("group name:", groupObj.name);
            RES.loadGroup(groupObj.name);
        });
    };
    p.onGroupComplete = function (e) {
        this.groupCount++;
        console.log("group complete:", e['groupName']);
        if (this.groupCount === this.constants.configObj.groups.length) {
            this.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
            this.onPreviewStart();
        }
    };
    p.onPreviewStart = function () {
        //添加script到引用池
        this.addScripts();
        this.preview(this.constants.openObj);
    };
    p.addScripts = function () {
        var i = -1;
        for (var scriptName in this.constants.scripts) {
            ecs.global_ref[scriptName] = i;
            ecs.global_ref[i] = { properties: this.constants.scripts[scriptName] };
            i--;
        }
    };
    p.preview = function (scene) {
        var _this = this;
        ecs.MODE = ecs.MODE_PREVIEW;
        this.domain = ecs.parseScene(scene, null);
        //仅装入静态实例
        this.domain.topIds.forEach(function (topId) {
            var topNode = _this.domain.reference[topId];
            _this.addChild(topNode._raw);
        });
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
