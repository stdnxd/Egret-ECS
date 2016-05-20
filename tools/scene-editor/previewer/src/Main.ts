class Main extends egret.DisplayObjectContainer {
    //常量
    constants:any = null;
    //客户端全局electron对象
    electron:any = null;
    groupCount:number = 0;
    domain:ecs.SceneDomain = null;
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.electron = parent['require']('electron');
        this.constants = this.electron.remote.getGlobal("ecs");
        const ROUTE = this.electron.remote.getGlobal("ROUTE");
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_EDIT_SHOW,(event,propName,val,node)=>{
            console.log(ROUTE.PREVIEW_EDIT_SHOW,propName,val,node);
            this.domain.reference[node.id][propName] = parseInt(val);
        });
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_NODE_SELECT,(event,node,isSelect)=>{
            console.log('on_node_select',node,this.domain.reference[node.id],isSelect);
            if(isSelect){
                ecs.selectNode(this.domain.reference[node.id]);
            }else{
                ecs.cancelSelectNode(this.domain.reference[node.id]);
            }
        });
    }

    onAddToStage(){
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig(this.constants.res_config,this.constants.res_dir);
    }

    onConfigComplete(){
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete,this);
        this.constants.configObj.groups.forEach(groupObj=>{
            console.log("group name:",groupObj.name);
            RES.loadGroup(groupObj.name);
        });
    }

    onGroupComplete(e:egret.Event){
        this.groupCount ++;
        console.log("group complete:",e['groupName']);
        if(this.groupCount === this.constants.configObj.groups.length){
            this.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onGroupComplete,this);
            this.onPreviewStart();
        }
    }

    onPreviewStart(){
        //添加script到引用池
        this.addScripts();
        this.preview(this.constants.openObj);
    }

    addScripts(){
        let i = -1;
        for(let scriptName in this.constants.scripts){
            ecs.global_ref[scriptName] = i;
            ecs.global_ref[i] = {properties:this.constants.scripts[scriptName]};
            i--;
        }
    }

    preview(scene){
        ecs.MODE = ecs.MODE_PREVIEW;
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