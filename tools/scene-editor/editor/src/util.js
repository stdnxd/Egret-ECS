/**
 * Created by jackyanjiaqi on 16/5/24.
 */
function setValueByPropDeclaration(pname,subname,propsDeclaration,setObject,value){
    let valueStyle = propsDeclaration[pname];
    if(valueStyle !== undefined){
        /**
         * 支持自定义存取器
         * {
         *      name:{
         *         set: function(val){
         *              this._name = val;
         *         },
         *         get: function(){
         *              return this._name;
         *         }
         *      }
         * }
         */
        if(typeof valueStyle === "object" &&
            ('set' in valueStyle || 'get' in valueStyle)){
            //赋值之前确保进行了存取器定义
            if(!(pname in setObject)){
                Object.defineProperty(setObject,pname,valueStyle);
            }
            setObject[pname] = value;
            return typeof setObject[pname];
        }
        /**
         * 基本类型
         * {
         *      basicNumber : 10,
         *      basicString : "I am string",
         *      basicBoolean : true
         * }
         */
        if(typeof valueStyle === 'number' ||
            typeof valueStyle === 'string' ||
            typeof valueStyle === 'boolean'){
            //直接赋值
            if(typeof valueStyle === typeof value){
                setObject[pname] = value;
                return typeof valueStyle;
            }
        }else{
            /**
             * 引用类型和数组(必须有type字段)
             * {
             *      reference1:{
             *          default:null,
             *          type:ecs.Node
             *      }
             *      reference2:{
             *          default:null,
             *          type:ecs.Component
             *      }
             *      reference3:{
             *          default:null,
             *          type:"Sprite"
             *      }
             *      reference4:{
             *          default:null,
             *          type:"ecs.Component"
             *      }
             *      array1:{
             *          default:null,
             *          type:[]
             *      }
             *      array2:{
             *          default:0,
             *          type:['number']
             *      }
             *      array3:{
             *          default:false,
             *          type:['boolean']
             *      }
             *      array4:{
             *          default:'',
             *          type:['number']
             *      }
             *      array5:{
             *          default:null,
             *          type:['ecs.Node']
             *      }
             *      array6:{
             *          default:null,
             *          type:['myscript']
             *      }
             *      array7:{
             *          default:null,
             *          type:[ecs.Component]
             *      }
             * }
             *
             */
            if(valueStyle.type !== undefined){
                let className = null;
                //引用类型
                if(typeof valueStyle.type === 'string' || typeof valueStyle.type === 'function'){
                    //获得目标类型
                    if(typeof valueStyle.type === 'function'){
                        /**
                         * reference1,reference2
                         * @type {string}
                         */
                        className = valueStyle.type.prototype.constructor.name;
                    }else
                    if(typeof valueStyle.type === 'string'){
                        /**
                         * reference3,reference4
                         * @type {string}
                         */
                        const index = valueStyle.type.lastIndexOf('.');
                        if(index != -1){
                            className = valueStyle.type.substring(index+1);
                        }else{
                            className = valueStyle.type;
                        }
                    }
                }else
                //数组类型(必须带下标)
                if(subname !== null){
                    //没有指定数组内的类型
                    if(valueStyle.type.length === 0){
                        /**
                         * array1
                         * @type {null}
                         */
                        className = null;//任意类型(需要根据设定值返回类型)
                    } else {
                        var innerType = valueStyle.type[0];
                        switch(innerType){
                            /**
                             * array2,array3,array4
                             */
                            case 'string':
                            case 'number':
                            case 'boolean':
                                //数组内容为基本类型
                                setObject[pname][subname] = value;
                                return innerType;
                                break;
                            /**
                             * array5,array6,array7
                             */
                            default:
                                //指定了数组内容为引用类型
                                //获得目标类型
                                if(typeof innerType === 'function'){
                                    className = innerType.prototype.constructor.name;
                                }else
                                if(typeof innerType === 'string'){
                                    const index = innerType.lastIndexOf('.');
                                    if(index != -1){
                                        className = innerType.substring(index+1);
                                    }else{
                                        className = innerType;
                                    }
                                }
                                break;
                        }
                    }
                }
                //类型任意或类型符合
                if(className === null || value.prototype.constructor.name === className){
                    if(className === null){
                        if(typeof value === 'string'||
                            typeof value === 'number' ||
                            typeof value === 'boolean'){
                            className = typeof value;
                        }else{
                            className = value.prototype.constructor.name;
                        }
                    }
                    subname === null?
                        setObject[pname] = value :
                        setObject[pname][subname] = value;
                    return className;
                }else
                //类型不符需要查找
                if(value.prototype.constructor.name === 'Node'){
                    //类型是Component直接取数组
                    if(className === 'Component' && value.components.length>0){
                        subname === null?
                            setObject[pname] = value.components[0] :
                            setObject[pname][subname] = value.components[0];
                        return className;
                    }else{
                        //其他类型需要使用查找函数
                        let ret = value.getComponent(className);
                        if(ret !== null){
                            subname === null?
                                setObject[pname] = ret :
                                setObject[pname][subname] = ret;
                            return className;
                        }
                    }
                }
            }
        }
    }
}

function getValueTypeByPropDeclaration(pname,propsDeclaration){
    let valueStyle = propsDeclaration[pname];
    if(valueStyle !== undefined){
        /**
         * 支持自定义存取器
         * {
         *      name:{
         *         set: function(val){
         *              this._name = val;
         *         },
         *         get: function(){
         *              return this._name;
         *         }
         *      }
         * }
         */
        if(typeof valueStyle === "object" &&
            ('set' in valueStyle || 'get' in valueStyle)){
            return {isBasic:true,isArray:false,valueType:null};
        }
        /**
         * 基本类型
         * {
         *      basicNumber : 10,
         *      basicString : "I am string",
         *      basicBoolean : true
         * }
         */
        if(typeof valueStyle === 'number' ||
            typeof valueStyle === 'string' ||
            typeof valueStyle === 'boolean'){
            //直接赋值
            return {isBasic:true,isArray:false,valueType:typeof valueStyle};
        }else{
            /**
             * 引用类型和数组(必须有type字段)
             * {
             *      reference1:{
             *          default:null,
             *          type:ecs.Node
             *      }
             *      reference2:{
             *          default:null,
             *          type:ecs.Component
             *      }
             *      reference3:{
             *          default:null,
             *          type:"Sprite"
             *      }
             *      reference4:{
             *          default:null,
             *          type:"ecs.Component"
             *      }
             *      array1:{
             *          default:null,
             *          type:[]
             *      }
             *      array2:{
             *          default:0,
             *          type:['number']
             *      }
             *      array3:{
             *          default:false,
             *          type:['boolean']
             *      }
             *      array4:{
             *          default:'',
             *          type:['number']
             *      }
             *      array5:{
             *          default:null,
             *          type:['ecs.Node']
             *      }
             *      array6:{
             *          default:null,
             *          type:['myscript']
             *      }
             *      array7:{
             *          default:null,
             *          type:[ecs.Component]
             *      }
             * }
             *
             */
            if(valueStyle.type !== undefined){
                let className = null;
                //引用类型
                if(typeof valueStyle.type === 'string' || typeof valueStyle.type === 'function'){
                    //获得目标类型
                    if(typeof valueStyle.type === 'function'){
                        className = valueStyle.type.prototype.constructor.name;
                    }else
                    if(typeof valueStyle.type === 'string'){
                        const index = valueStyle.type.lastIndexOf('.');
                        if(index != -1){
                            className = valueStyle.type.substring(index+1);
                        }else{
                            className = valueStyle.type;
                        }
                    }
                    return{isBasic:false,isArray:false,valueType:className};
                }else
                //数组类型(必须带下标)
                //if(valueStyle.type instanceof Array){
                    //没有指定数组内的类型
                    if(valueStyle.type.length === 0){
                        className = null;//任意类型(需要根据设定值返回类型)
                        return{isBasic:false,isArray:true,valueType:className};
                    } else {
                        var innerType = valueStyle.type[0];
                        switch(innerType){
                            case 'string':
                            case 'number':
                            case 'boolean':
                                //数组内容为基本类型
                                return{isBasic:true,isArray:true,valueType:innerType};
                                break;
                            default:
                                //指定了数组内容为引用类型
                                //获得目标类型
                                if(typeof innerType === 'function'){
                                    className = innerType.prototype.constructor.name;
                                }else
                                if(typeof innerType === 'string'){
                                    const index = innerType.lastIndexOf('.');
                                    if(index != -1){
                                        className = innerType.substring(index+1);
                                    }else{
                                        className = innerType;
                                    }
                                }
                                return{isBasic:false,isArray:true,valueType:className};
                                break;
                        }
                    }
                //}
            }
        }
    }
}
exports.setValueByPropDeclaration = setValueByPropDeclaration;
exports.getValueTypeByPropDeclaration = getValueTypeByPropDeclaration;