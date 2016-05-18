class Main extends egret.DisplayObjectContainer {
    util:any = null;
    electron:any = null;
    groupCount:number = 0;
    domain:ecs.SceneDomain = null;
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.electron = parent['require']('electron');
        this.util = this.electron.remote.getGlobal("ecs");
        this.electron.ipcRenderer.on('show',(event,propName,val,node)=>{
            console.log('show',propName,val,node);
            this.domain.reference[node.id][propName] = parseInt(val);
        });
    }

    onAddToStage(){
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig(this.util.res_config,this.util.res_dir);
    }

    onConfigComplete(){
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete,this);
        this.util.configObj.groups.forEach(groupObj=>{
            console.log("group name:",groupObj.name);
            RES.loadGroup(groupObj.name);
        });
    }

    onGroupComplete(e:egret.Event){
        this.groupCount ++;
        console.log("group complete:",e['groupName']);
        if(this.groupCount === this.util.configObj.groups.length){
            this.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onGroupComplete,this);
            this.onPreviewStart();
        }
    }

    onPreviewStart(){
        //添加script到引用池
        this.addScripts();
        this.preview(this.util.openObj);
    }

    addScripts(){
        let i = -1;
        for(let scriptName in this.util.scripts){
            ecs.global_ref[scriptName] = i;
            ecs.global_ref[i] = {properties:this.util.scripts[scriptName]};
            i--;
        }
    }

    preview(scene){
        this.domain = ecs.parseScene(scene,null);
        //仅装入静态实例
        this.domain.topIds.forEach(topId=>{
            let topNode:ecs.Node = this.domain.reference[topId];
            if(topNode.visualable){
                this.addChild(topNode._raw);
            }
        })
    }
}