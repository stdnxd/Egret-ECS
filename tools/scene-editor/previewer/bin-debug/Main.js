var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = this;
        _super.call(this);
        this.util = null;
        this.electron = null;
        this.groupCount = 0;
        this.domain = null;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.electron = parent['require']('electron');
        this.util = this.electron.remote.getGlobal("ecs");
        this.electron.ipcRenderer.on('show', function (event, propName, val, node) {
            console.log('show', propName, val, node);
            _this.domain.reference[node.id][propName] = parseInt(val);
        });
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function () {
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig(this.util.res_config, this.util.res_dir);
    };
    p.onConfigComplete = function () {
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
        this.util.configObj.groups.forEach(function (groupObj) {
            console.log("group name:", groupObj.name);
            RES.loadGroup(groupObj.name);
        });
    };
    p.onGroupComplete = function (e) {
        this.groupCount++;
        console.log("group complete:", e['groupName']);
        if (this.groupCount === this.util.configObj.groups.length) {
            this.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
            this.onPreviewStart();
        }
    };
    p.onPreviewStart = function () {
        //添加script到引用池
        this.addScripts();
        this.preview(this.util.openObj);
    };
    p.addScripts = function () {
        var i = -1;
        for (var scriptName in this.util.scripts) {
            ecs.global_ref[scriptName] = i;
            ecs.global_ref[i] = { properties: this.util.scripts[scriptName] };
            i--;
        }
    };
    p.preview = function (scene) {
        var _this = this;
        this.domain = ecs.parseScene(scene, null);
        //仅装入静态实例
        this.domain.topIds.forEach(function (topId) {
            var topNode = _this.domain.reference[topId];
            if (topNode.visualable) {
                _this.addChild(topNode._raw);
            }
        });
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
