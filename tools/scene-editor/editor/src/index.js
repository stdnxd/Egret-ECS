/**
 * Created by jackyanjiaqi on 16-4-5.
 */
import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import 'antd/lib/index.css';
import { Tree,Popover } from 'antd';
const TreeNode = Tree.TreeNode;
let electron = null;
let sceneNode = null;
let TOP_REFERENCE = null;
let SCRIPTS = null;

//ID分配器
let IDGen = {start:0};
IDGen.allocateId = function(){
    this.start ++;
    return this.start;
};
IDGen.setAllocated = function(id){
    if(id > IDGen.start){
        IDGen.start = id;
    }
}
let ROUTE = null;
try{
    electron = parent['require']('electron');
    console.log("electron",electron);
    console.log("electron.remote",electron.remote);
    ROUTE = electron.remote.getGlobal("ROUTE");
    electron.ipcRenderer.on(ROUTE.SCENE_OPEN,function(event,sceneFilePath){
        //args = args.split('.')[0]+'.json';
        //sceneNode = electron.remote['require'](args);
        sceneNode = readSceneFile(sceneFilePath);
        TOP_REFERENCE.setState({scene:sceneNode});
    });
    console.log("remote",electron.remote);
    console.log("ecs",electron.remote.getGlobal("ecs"));
    SCRIPTS= electron.remote.getGlobal("ecs").scripts;
}catch(err){
    console.log(err);
}
if(SCRIPTS == null){
    SCRIPTS =
    {
        test1:{
            a:1,
            b:true,
            c:"haha",
            d:{
                "default":null,
                type:"egret.TextField"
            }
        },test2:{
            links:[
                "http://baidu.com",
                "http://taobao.com",
                "http://123.57.70.115"
            ]
        },test3:{
            complicated:{
                "default":[],
                type:["ecs.Node"]
            }
        }
    }
}
console.log('scripts',SCRIPTS);
sceneNode = require('./testAnim.scene');

function readSceneFile(filePath){
    let fs = electron.remote['require']('fs');
    let fileStr = fs.readFileSync(filePath);
    console.log('scene file:',fileStr);
    return JSON.parse(fileStr);
}

const ParamInput = React.createClass({
    render(){
        return (
            <div>
                <p>内容</p>
                <input type="text" name="nothing"/>
            </div>
        );
    }
});

const NodeTree = React.createClass({
    getDefaultProps(){
        return {
            scene:sceneNode,
            onSelect: function (sceneNode) {
            }
        }
    },
    getInitialState(){
        return {
            scene:this.props.scene,
            ids:{},
            selected:null
        }
    },
    //用于选择脚本
    getScriptSelectOptions(){
        let scripts = [];
        scripts.push(<option value="">选择脚本</option>);
        for(let script in SCRIPTS){
            scripts.push(
                <option value={script}>{script}</option>
            )
        }
        return scripts;
    },
    //节点的关系
    parseTree(topSceneNodes){
        var ret = [];
        topSceneNodes.forEach(sceneNode=>{
            //创建用于编辑器的状态存储域
            if(sceneNode.__gui__ === undefined){
                sceneNode.__gui__ = {mode:'show',selectHidden:true,componentSelectHidden:true};
            }
            this.state.ids[sceneNode.id] = sceneNode;
            IDGen.setAllocated(sceneNode.id);
            sceneNode.components.forEach(component=>IDGen.setAllocated(component.id));

            //let scripts = [];
            //scripts.push(<option value="">选择脚本</option>);
            //for(let script in SCRIPTS){
            //    scripts.push(
            //        <option value={script}>{script}</option>
            //    )
            //}

            const customLabel = (
                <span className="cus-label">
                    <span>{sceneNode.name}</span>
                    <span style={{color: 'blue'}} onClick={e=>{e.stopPropagation();this.onNodeEdit(sceneNode)}}>(^edit)</span>&nbsp;
                    <span style={{color: 'green'}} onClick={e=>{
                        e.stopPropagation();
                        sceneNode.__gui__.selectHidden = false;
                        sceneNode.__gui__.select.hidden = sceneNode.__gui__.selectHidden;
                        sceneNode.__gui__.select.focus();
                    }}>(+add)</span>&nbsp;
                    <select ref={ref=>sceneNode.__gui__.select = ref} hidden={sceneNode.__gui__.selectHidden} onChange={e=>{
                            if(sceneNode.__gui__.select.value === 'Script'){
                                sceneNode.__gui__.selectScript.hidden = false;
                                sceneNode.__gui__.selectScript.focus();
                            }else{
                                sceneNode.__gui__.selectHidden = true;
                                sceneNode.__gui__.select.hidden = sceneNode.__gui__.selectHidden;
                                this.onNodeAdd(e.nativeEvent.target.value,sceneNode);
                                sceneNode.__gui__.select.selectedIndex = 0;//设置默认选中第一项
                            }
                        }}
                                onBlur={e=>{
                                console.log('onBlur',e);
                                if(sceneNode.__gui__.selectScript.hidden){
                                    sceneNode.__gui__.selectHidden = true;
                                    sceneNode.__gui__.select.hidden = sceneNode.__gui__.selectHidden;
                                    sceneNode.__gui__.select.selectedIndex = 0;//设置默认选中第一项
                                }
                            }
                        }>
                        <option value="">选择类型</option>
                        <option value="Blank">空节点</option>
                        <option value="Label">文本节点</option>
                        <option value="Sprite">图像节点</option>
                        <option value="Animation">动画节点</option>
                        <option value="Script">脚本节点</option>
                    </select>
                    <select ref={ref=>sceneNode.__gui__.selectScript = ref} hidden onChange={e=>{
                            sceneNode.__gui__.selectScript.hidden = true;
                            this.onNodeAdd('Script',sceneNode,e.nativeEvent.target.value);
                            sceneNode.__gui__.selectScript.selectedIndex = 0;

                            sceneNode.__gui__.selectHidden = true;
                            sceneNode.__gui__.select.hidden = sceneNode.__gui__.selectHidden;
                            sceneNode.__gui__.select.selectedIndex = 0;
                        }}
                        onBlur={e=>{
                            sceneNode.__gui__.selectScript.hidden = true;
                            sceneNode.__gui__.selectScript.selectedIndex = 0;

                            sceneNode.__gui__.selectHidden = true;
                            sceneNode.__gui__.select.hidden = sceneNode.__gui__.selectHidden;
                            sceneNode.__gui__.select.selectedIndex = 0;
                        }}>
                        {this.getScriptSelectOptions()}
                    </select>
                </span>
            );

            const editLabel = (
                <span className="cus-label">
                    <input type="text" ref={ref=>sceneNode.__gui__.editlabel = ref} defaultValue={sceneNode.name} onBlur={e=>{
                        e.stopPropagation();
                        sceneNode.name = sceneNode.__gui__.editlabel.value;
                        sceneNode.__gui__.mode = 'show';
                        this.refresh();
                    }}></input>
                    <span style={{color: 'green'}} onClick={e=>{
                        e.stopPropagation();
                        sceneNode.name = sceneNode.__gui__.editlabel.value;
                        sceneNode.__gui__.mode = 'show';
                        this.refresh();
                    }}>(ok)</span>&nbsp;
                    <span style={{color: 'red'}} onClick={e=>{e.stopPropagation();this.onNodeDel(sceneNode)}}>(del-)</span>
                </span>
            );

            const titleLabel = sceneNode.__gui__.mode === 'show'?customLabel:editLabel;
            if(sceneNode.children.length === 0){
                ret.push(<TreeNode title={titleLabel} key={sceneNode.id}/>);
            }else{
                ret.push(
                    <TreeNode title={titleLabel} key={sceneNode.id}>
                        {this.parseTree(sceneNode.children)}
                    </TreeNode>
                );
            }
        });
        return ret;
    },
    getEditablePropNode(mode,valueShow,propertyZone,propertyName){
        const customLabel = (
            <span className="cus-label">
                <span>{propertyZone}:{propertyZone[propertyName]}</span>
                <span style={{color: 'blue'}}>edit</span>&nbsp;
                <span style={{color: 'red'}}>del</span>
            </span>
        );
        return customLabel;
    },
    //显示节点的编辑属性
    //功能:
    // 1.编辑属性
    // 2.编辑
    parseNode(sceneNode){
        var ret = [];
        if(sceneNode){
            //添加节点基本属性
            const basic = [];
            for(let p in sceneNode.properties){
                const customLabel = (
                    <span className="cus-label">
                        <span>{p}:</span>&nbsp;
                        <input style={{width:40}} type="text" defaultValue={sceneNode.properties[p]} onChange={e=>this.onPropsEdit(p,e.nativeEvent.target.value,sceneNode)}></input>
                    </span>
                );
                //basic.push(<TreeNode title={this.getEditablePropNode(null,null,sceneNode.properties,p)} title1={p+":"+sceneNode.properties[p]} key={sceneNode.id+"_"+p}/>);
                basic.push(<TreeNode title={customLabel} title1={p+":"+sceneNode.properties[p]} key={sceneNode.id+"_"+p}/>);
                //basic.push(<TreeNode title={p+":"+sceneNode.properties[p]} key={sceneNode.id+"_"+p}/>);
            };
            //添加节点头
            ret.push(<TreeNode title={"node.properties"} key={"node.properties"} expanded={true}>{basic}</TreeNode>);
            //添加组件
            const components = [];
            sceneNode.components.forEach(component=>{
                //添加组件属性
                var comp_props = [];
                for(let p in component.properties){
                    if(p === 'clips' && component.properties[p] instanceof Array ){
                        let clipNodes = [];
                        //添加动画剪辑
                        let clips = component.properties[p];
                        const addClipPanel = (
                            <span>
                                <span>clips({clips.length})</span>&nbsp;
                                <span style={{color: 'green'}} onClick={e=>{e.stopPropagation();this.onClipAdd(component)}}>(+add)</span>
                            </span>
                        );
                        clips.forEach((clip,clipIndex)=>{
                            let keyframeNodes = [];
                            clip.keyframes.forEach((keyframe,keyframeIndex)=>{
                                let keyframeProps = [];
                                for(let p in keyframe){
                                    let editableKeyframePropPanel=(
                                        <span>
                                            <span>{p}:</span>
                                            <input type="text" defaultValue={keyframe[p]} onChange={e=>this.onKeyframePropsEdit(p,e.nativeEvent.target.value,keyframe,clipIndex,keyframeIndex)}></input>
                                        </span>
                                    );
                                    keyframeProps.push(
                                        <TreeNode title={editableKeyframePropPanel} key={component.id+"_"+p+"_clip"+clipIndex+"_keyframe"+keyframeIndex+"_p:"+p}/>
                                    );
                                }
                                keyframeNodes.push(
                                    <TreeNode title={keyframeIndex} key={component.id+"_"+p+"_clip"+clipIndex+"_keyframe"+keyframeIndex}>
                                        {keyframeProps}
                                    </TreeNode>
                                );
                            });
                            let addKeyframePanel = (
                                <span>
                                    <span>{clip.name+'('+clip.keyframes.length+')'}</span>
                                    <span style={{color:'green'}} onClick={e=>{e.stopPropagation();this.onKeyframeAdd(clip,component)}}>(+add)</span>
                                </span>
                            );
                            clipNodes.push(
                                <TreeNode title={addKeyframePanel} key={component.id+"_"+p+"_clip"+clipIndex}>
                                    {keyframeNodes}
                                </TreeNode>);
                        });
                        //动画剪辑属性可编辑
                        comp_props.push(
                            <TreeNode title={addClipPanel} key={component.id+"_"+p}>
                                {clipNodes}
                            </TreeNode>
                        );
                    }else{
                        comp_props.push(
                            <TreeNode title={p+":"+component.properties[p]} key={component.id+"_"+p}/>
                        );
                    }
                }
                const delComponentPanel = (
                    <span>
                        <span>{component.name}</span>&nbsp;
                        <span style={{color:'red'}} onClick={e=>{e.stopPropagation();this.onComponentDel(component)}}>(del-)</span>
                    </span>
                );
                components.push(<TreeNode title={delComponentPanel} key={component.id}>{comp_props}</TreeNode>);
            });
            const addNewComponentLabel = (
                <span className="cus-label">
                    <span style={{}}>node.components({components.length})</span>
                    <span style={{color: 'green'}} onClick={e=>{
                        e.stopPropagation();
                        sceneNode.__gui__.componentSelectHidden = false;
                        sceneNode.__gui__.componentSelect.hidden = sceneNode.__gui__.componentSelectHidden;
                        sceneNode.__gui__.componentSelect.focus();
                    }}>(+ADD)</span>&nbsp;
                    <select ref={ref=>sceneNode.__gui__.componentSelect = ref} hidden={sceneNode.__gui__.componentSelectHidden} onChange={e=>{
                            if(sceneNode.__gui__.componentSelect.value === 'Script'){
                                sceneNode.__gui__.componentSelectScript.hidden = false;
                                sceneNode.__gui__.componentSelectScript.focus();
                            }else{
                                sceneNode.__gui__.selectComponentHidden = true;
                                sceneNode.__gui__.componentSelect.hidden = sceneNode.__gui__.selectComponentHidden;
                                this.onComponentAdd(e.nativeEvent.target.value,sceneNode);
                                sceneNode.__gui__.componentSelect.selectedIndex = 0;//设置默认选中第一项
                            }
                        }} onBlur={e=>{
                            console.log('onBlur',e);
                            if(sceneNode.__gui__.componentSelectScript.hidden){
                                sceneNode.__gui__.selectComponentHidden = true;
                                sceneNode.__gui__.componentSelect.hidden = sceneNode.__gui__.selectComponentHidden;
                                sceneNode.__gui__.componentSelect.selectedIndex = 0;//设置默认选中第一项
                            }
                        }}>
                        <option value="">未选择</option>
                        <option value="Label">文本</option>
                        <option value="Sprite">图像</option>
                        <option value="Animation">动画</option>
                        <option value="Script">脚本</option>
                    </select>
                    <select ref={ref=>sceneNode.__gui__.componentSelectScript = ref} hidden onChange={e=>{
                            sceneNode.__gui__.componentSelectScript.hidden = true;
                            this.onComponentAdd('Script',sceneNode,e.nativeEvent.target.value);
                            sceneNode.__gui__.componentSelectScript.selectedIndex = 0;

                            sceneNode.__gui__.selectComponentHidden = true;
                            sceneNode.__gui__.componentSelect.hidden = sceneNode.__gui__.selectComponentHidden;
                            sceneNode.__gui__.componentSelect.selectedIndex = 0;
                        }}
                            onBlur={e=>{
                            sceneNode.__gui__.componentSelectScript.hidden = true;
                            sceneNode.__gui__.componentSelectScript.selectedIndex = 0;

                            sceneNode.__gui__.selectComponentHidden = true;
                            sceneNode.__gui__.componentSelect.hidden = sceneNode.__gui__.selectComponentHidden;
                            sceneNode.__gui__.componentSelect.selectedIndex = 0;
                        }}>
                        {this.getScriptSelectOptions()}
                    </select>
                </span>
            );
            ret.push(<TreeNode title={addNewComponentLabel} title1={"node.components("+components.length+")"} key={"node.components"} expanded={true}>{components}</TreeNode>);
        }
        return ret;
    },
    refresh(){
        this.setState({state:this.state.scene});
    },
    onKeyframePropsEdit(val,keyframe,clipIndex,keyframeIndex){
        console.log('onKeyframePropsEdit',val,keyframe,clipIndex,keyframeIndex);
    },
    onKeyframeAdd(keyframe,component){
        console.log('onKeyframeAdd',keyframe,component);
    },
    onClipAdd(component){
        console.log('onClipAdd',component);
    },
    onComponentDel(component){
        console.log('onComponentDel',component);
    },
    onComponentAdd(val,sceneNode,script){
        console.log('onComponentAdd',val,sceneNode,script);
        if(val !== ''){
            let template = require('./'+val+'Component.scene');
            let component = JSON.parse(JSON.stringify(template));
            component.id = IDGen.allocateId();
            component.node = sceneNode.id;
            if(script){
                component.name = script;
                //在此处给暴露的属性赋初始值
                component.properties = SCRIPTS[script];
            }
            sceneNode.components.push(component);
            console.log('onComponentAdd',val,sceneNode);
        }
        this.refresh();
    },
    onNodeEdit(node){
        console.log('onNodeEdit',node);
        node.__gui__.mode = 'edit';
        this.refresh();
    },
    onNodeAdd(nodeType,node,script){
        console.log('onNodeAdd',nodeType,node,script);
        if(nodeType !== ''){
            let template = require('./BlankNode.scene');
            let newNode = JSON.parse(JSON.stringify(template));
            newNode.id = IDGen.allocateId();
            newNode.parent = node.parent;
            if(newNode.parent === null){
                let index = this.state.scene.indexOf(node);
                this.state.scene.splice(index+1,0,newNode);
            }else{
                let index = this.state.ids[newNode.parent].children.indexOf(node);
                this.state.ids[newNode.parent].children.splice(index+1,0,newNode);
            }
            if(nodeType !== 'Blank'){
                if(nodeType === 'Script' && !script){
                    node.__gui__.selectScript.hidden = false;
                    node.__gui__.selectScript.focus();
                }else{
                    this.onComponentAdd(nodeType,newNode,script);
                }
            }else{
                this.refresh();
            }
        }
        //this.refresh();
    },
    onNodeDel(node){
        console.log('onNodeDel',node);
    },
    onPropsEdit(propsName,val,sceneNode){
        console.log('onPropsEdit',propsName,val,sceneNode);
        if(electron && ROUTE){
            electron.ipcRenderer.send(ROUTE.PREVIEW_EDIT_SHOW,propsName,val,sceneNode);
        }
    },
    onRightClick(event){
        console.log('onRightClick',event);
    },
    onDragEnter(event){
        console.log('onDragEnter',event)
    },
    onDragStart(event){
        console.log('onDragStart',event)
    },
    onDragOver(event){
        console.log('onDragOver',event)
    },
    onDragLeave(event){
        console.log('onDragLeave',event)
    },
    onDrop(event){
        console.log('onDrop',event);

    },
    onSelect(key){
        console.log('onSelect',key);
        //this.props.onSelect(this.state.ids[event])
        if(key){
            if(this.state.ids[key]){
                if(this.state.selected != null){
                    if(electron && ROUTE){
                        electron.ipcRenderer.send(ROUTE.PREVIEW_NODE_SELECT,this.state.selected,false);
                    }
                }
                //选中了节点
                this.setState({selected:this.state.ids[key]});
                if(electron && ROUTE){
                    electron.ipcRenderer.send(ROUTE.PREVIEW_NODE_SELECT,this.state.ids[key],true);
                }
            }else{
                //选中了非节点

                if(key === ''){
                    //取消选择
                }

            }
        }else{
            //取消选择(无法走到)
            if(electron && ROUTE){
                electron.ipcRenderer.send(ROUTE.PREVIEW_NODE_SELECT,this.state.selected,false);
            }
            this.setState({selected:null});
        }
    },
    onExpand(event){
        console.log('onExpand',event)
    },
    render(){
        return (
            <Tree draggable
                  defaultExpandedKeys={["node.properties"]}
                onRightClick={this.onRightClick}
                onDragStart={this.onDragStart}
                onDragEnter={this.onDragEnter}
                onDragOver={this.onDragOver}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}
                onSelect={this.onSelect}
                onExpand={this.onExpand}>
                {this.parseNode(this.state.selected)}
                {this.parseTree(this.state.scene)}
            </Tree>
        );
    }
});

const ComponentList = React.createClass({
    getDefaultProps(){
        return{
            scene:null
        }
    },
    parseNode(sceneNode){
        const customLabel = (
            <span className="cus-label">
                <span>operations: </span>
                <span style={{color: 'blue'}}>Edit</span>&nbsp;
                <span style={{color: 'red'}}>Delete</span>
            </span>);

        var ret = [];
        if(sceneNode){
            var basic = [];
            for(let p in sceneNode.properties){
                basic.push(<TreeNode title={customLabel} title1={p+":"+sceneNode.properties[p]} key={sceneNode.id+"_"+p}/>);
            };
            ret.push(<TreeNode title={"node.properties"} key={sceneNode.id}>{basic}</TreeNode>);

            sceneNode.components.forEach(component=>{
                var comp_props = [];
                for(let p in component.properties){
                    comp_props.push(<TreeNode title={p+":"+component.properties[p]} key={component.id+"_"+p}/>);
                }
                ret.push(<TreeNode title={component.name} key={component.id}>{comp_props}</TreeNode>);
            });
        }
        return ret;
    },
    onRightClick(event){
        console.log('onRightClick',event)
    },
    onDrop(event){
        console.log('onDrop',event)
    },
    onSelect(event){
        console.log('onSelect',event)
    },
    onExpand(event){
        console.log('onExpand',event)
    },
    render(){
        return(
            <Tree
                draggable
                  onRightClick={this.onRightClick}
                  onDrop={this.onDrop}
                  onSelect={this.onSelect}
                  onExpand={this.onExpand}>
                {this.parseNode(this.props.scene)}
            </Tree>
        );
    }
});

const Demo = React.createClass({
    getInitialState(){
        return {
            selected:null
        }
    },
    onSelect(sceneNode){
        this.setState({selected:sceneNode})
    },
    render(){
        return (
            <div>
                <NodeTree ref={thisRef=>this.nodeTree = thisRef} onSelect={this.onSelect}/>
                <ComponentList ref={thisRef=>this.componentList = thisRef} scene={this.state.selected}/>
            </div>
        );
    }
});
ReactDOM.render(<NodeTree ref={thisRef=>TOP_REFERENCE = thisRef}/>, document.getElementById('nodetree'));