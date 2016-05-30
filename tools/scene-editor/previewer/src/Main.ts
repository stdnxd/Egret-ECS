class Main extends egret.DisplayObjectContainer {
    //常量
    constants:any = null;
    //客户端全局electron对象
    electron:any = null;
    groupCount:number = 0;
    domain:ecs.SceneDomain = null;//空间域
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.electron = parent['require']('electron');
        this.constants = this.electron.remote.getGlobal("ecs");
        const ROUTE = this.electron.remote.getGlobal("ROUTE");
        //节点属性编辑
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_NODE_EDIT_SHOW,(event,propName,val,node)=>{
            console.log(ROUTE.PREVIEW_EDIT_SHOW,propName,val,node);
            if(val.indexOf('.')!=-1){
                this.domain.reference[node.id][propName] = parseFloat(val);
            }else{
                this.domain.reference[node.id][propName] = parseInt(val);
            }
        });
        //节点选中状态
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_NODE_SELECT,(event,node,isSelect)=>{
            console.log('on_node_select',node,this.domain.reference[node.id],isSelect);
            if(isSelect){
                ecs.selectNode(this.domain.reference[node.id]);
            }else{
                ecs.cancelSelectNode(this.domain.reference[node.id]);
            }
        });
        //节点增删
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_NODE_ADD_REMOVE,(event,type,addArrayId,nodeWrapper)=>{
            if(type === "add"){
                let addArray:Array<any> = null;
                //step1.创建节点
                let tempNode:ecs.Node = new ecs.Node(nodeWrapper);
                //使用instantiate函数创建可视化的节点
                let newNode:ecs.Node = ecs.instantiate(tempNode);
                //step2.注册id
                this.domain.reference[nodeWrapper.id] = newNode;
                //step3.组装关系
                if(addArrayId<0){
                    //顶层节点编号
                    this.domain.topIds.push(nodeWrapper.id);
                    newNode.parent = null;
                    this.addChild(newNode._raw);
                }else{
                    let parentNode:ecs.Node = this.domain.reference[addArrayId];
                    parentNode.addChild(newNode);
                }
                //addArray.push(newNode);
                ////step4.可预览
                //newNode.visualable = false;
                console.log('raw',this.domain.reference[addArrayId]._raw);
            }else
            if(type === "remove"){
                let rNode:ecs.Node = this.domain.reference[nodeWrapper.id];
                //查找相关引用

            }
        });
        //组件增删
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_COMPONENT_ADD_REMOVE,(event,type,componentWrapper)=>{
            if(type === "add"){
                let addNode:ecs.Node = this.domain.reference[componentWrapper.node];
                //step1.创建组件
                let newComponent:ecs.Component = new ecs.Component(componentWrapper);
                //step2.添加组件
                addNode.addComponent(newComponent);
                //step3.注册id
                this.domain.reference[newComponent._wrap_obj.id] = newComponent;
                ecs.assembleSingleComponent(newComponent,addNode,this.domain.reference);
            }else
            if(type === "remove"){

            }
        });
        //组件属性编辑
        this.electron.ipcRenderer.on(ROUTE.PREVIEW_COMPONENT_EDIT_SHOW,(event,type,pname,valueType,component,arg1,arg2)=>{
            let targetComponent:ecs.Component = this.domain.reference[component.id];
            switch(type){
                case 'edit':
                    let value = arg1;
                    let subname = arg2;
                    if(valueType.isBasic){
                        if(arg2){
                            targetComponent[pname][subname] = value;
                        }else{
                            targetComponent[pname] = value;
                        }
                    }else{
                    //非基本类型为引用 在引用池中找
                        if(arg2){
                            targetComponent[pname][arg2] = this.domain.reference[value];
                        }else{
                            targetComponent[pname] = this.domain.reference[value];
                        }
                    }
                    break;
                case 'addsub':
                    let declaration = arg1;
                    if(valueType.isBasic){
                        //基本类型
                        targetComponent[pname].push(declaration[pname]);
                    }else{
                        //引用类型
                        targetComponent[pname].push(declaration[pname].default);
                    }
                    break;
                case 'delsub':
                    let index = arg1;
                    targetComponent[pname].splice(index,1);
                    break;
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
        console.log("preview scene",scene);
        ecs.MODE = ecs.MODE_PREVIEW;
        this.domain = ecs.parseScene(scene,null);
        //仅装入静态实例
        this.domain.topIds.forEach(topId=>{
            let topNode:ecs.Node = this.domain.reference[topId];
            this.addChild(topNode._raw);
        })
    }
}