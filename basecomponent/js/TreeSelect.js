/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 树形下拉控件（同步加载的数据，支持数据回填，异步加载的数据，不支持数据回填，因为每次要展开节点才能加载数据）
 * @linc: MIT
 *
 */
define(function (require) {
    var Common = require("../js/Common.js");
    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOptions = {
        height:300, //下拉框高度
        width:0,  //下拉框宽度，默认给0，如果不配置，则以input的宽度为准，
        type:"radio", //默认是单选，checkbox
        url:"", //url如果是字符串，标记是要在数据库中去加载，如果是数组，直接使用
        splitStr:",", //分割符
        isExpandAll:true, //是否全部展开
        filterParent:false, //是否过滤过滤父节点
        cbFn:function(){}, //回调函数
        settings:{
            async:{
                enable:false //默认是非异步
            },
            data:{
                simpleData:{
                    enable: true,
                    idKey: "id",
                    pIdKey: "pId"
                },
                key:{
                    name:"name"
                }
            }
        }  //对ztree做的其他配置，默认不传
    };

    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function TreeSelect(elem,options){
        this.id = Common.cid("TreeSelect");
        this.ztreeId = Common.cid("ztree");
        this.opts = $.extend(true,{},defaultOptions,options);
        this.$elem = $(elem);
        this.elem = elem;
        this.$hiddenInput = $("#" +  this.opts.hiddenName);
        this.hiddenInputVal = [];
        //获取隐藏域中的值
        if(this.$hiddenInput.length){
            this.hiddenInputVal = (this.$hiddenInput.val() || "").split(this.opts.splitStr);
        }
        this.ztreeObj = null;
        this.checkedNodes = []; //默认选中的节点
        this.data =[]; //数据
        this.isShow = false;

        this.init();
    }

    /**
     * 初始化方法
     */
    TreeSelect.prototype.init = function(){
        //初始化容器
        this.$container = $('<div class="vetech-treeSelect"></div>');
        this.$treeContainer = $('<div class="ztree" id="'+this.ztreeId+'"></div>');

        var iContainerWidth = this.opts.width ?  this.opts.width : this.$elem.outerWidth();
        this.$container.css({"width":iContainerWidth,"height":this.opts.height});
        this.$container.append(this.$treeContainer);
        $(document.body).append(this.$container);

        //配置
        var tempSettings = {
            check:{
                enable: this.opts.type !== "radio"
            },
            callback:{
                onNodeCreated: $.proxy(this.nodeCreatedHandler,this)
            }
        };
        this.settings = $.extend(true,{},tempSettings,this.opts.settings);

        //如果是单选的，直接监听节点点击事件即可
        if(this.opts.type === "radio"){
            var onClick = this.settings.callback.onClick;
            if($.type(onClick) === "function"){
                this.settings.callback.onClick = $.proxy(onClick,this);
            }else{
                this.settings.callback.onClick  = $.proxy(this.itemClickHandler,this);
            }
        }else if(this.opts.type === "checkbox"){
            this.settings.callback.onCheck = $.proxy(this.itemCheckedHandler,this);
        }
    };

    /**
     * 加载数据
     * @param callback
     */
    TreeSelect.prototype.load = function(callback){
        var _this = this;
        //异步
        if(this.settings.async.enable){
            this.settings.async.url = this.opts.url;
            callback.call(_this);
        }else{
            var url = this.opts.url;
            if($.type(url) === "array"){ //数组
                this.data = url;
                callback.call(_this,_this.data);
            }else{
                $.ajax({
                    url:url,
                    dataType:"json",
                    type:"get",
                    data:this.opts.qDatas,
                    success:function(data){
                        _this.data = data;
                        callback.call(_this,_this.data);
                    },
                    error:function(msg){
                        Common.error(msg);
                    }
                });
            }
        }
    };

    TreeSelect.prototype.render = function(){
        this.ztreeObj = $.fn.zTree.init(this.$treeContainer,this.settings,this.data);

        var isAsync = this.settings.async.enable;

        if(!isAsync && this.opts.isExpandAll){
            this.ztreeObj.expandAll(true);
        }
        //如果是同步树，则在500毫秒以后，执行回调函数
        if(!isAsync){
            setTimeout($.proxy(this.writeValue,this),500);
        }
        this.bindEvent();
    };

    /**
     * 节点创建后事件，用于同步数据回填
     * @param event
     * @param treeId
     * @param treeNode
     */
    TreeSelect.prototype.nodeCreatedHandler = function(event,treeId,treeNode){
        if($.inArray(treeNode[this.opts.settings.data.simpleData.idKey],this.hiddenInputVal) > -1) this.checkedNodes.push(treeNode);
    };


    /**
     * 同步树数据回填
     */
    TreeSelect.prototype.writeValue = function(){
        for(var i = 0 ,len = this.checkedNodes.length; i< len;i++){
            this.ztreeObj.checkNode(this.checkedNodes[i],true,false);
        }
        this.setValue();
    };

    /**
     * 设置位置
     */
    TreeSelect.prototype.setPos = function(){
        var pointer = this.$elem.offset();
        var InputHeihgt = this.$elem.outerHeight(); //input的高度
        this.$container.css({"left":pointer.left,"top":pointer.top + InputHeihgt});
    };

    /**
     * 显示
     */
    TreeSelect.prototype.show = function(){
        if(this.isShow) return;
        this.setPos();
        this.$container.css("visibility","visible");
        this.isShow = true;
    };
    /**
     * 隐藏
     */
    TreeSelect.prototype.hide = function(){
        if(!this.isShow) return;
        this.$container.css({"visibility":"hidden","left":"-1000px","top":"-1000px"});
        this.isShow = false;
    };

    TreeSelect.prototype.destroy = function(){
        this.$container.remove();
        $(document).off(".ztree");
    };

    /**
     * 绑定事件
     */
    TreeSelect.prototype.bindEvent = function(){
        var _this = this;
        $(document).on("click.ztree",function(ev){
            if(ev.target !== _this.elem) _this.hide();
        });
        this.$container.on("click.ztree",function(){
            return false;
        });
    };

    /**
     *节点被点击的事件回调函数
     * @param {Object} event 点击的事件对象
     * @param {Object} treeId  对应ztree的treeid，便于用户操作
     * @param {Object} treeNode 点击的节点对象（JSON格式）
     */
    TreeSelect.prototype.itemClickHandler = function(event,treeId,treeNode){
        this.setValue(treeNode);
        this.hide();
    };

    /**
     * 捕获checkbox被勾选或取消勾选的事件回调
     */
    TreeSelect.prototype.itemCheckedHandler = function(){
        this.checkedNodes = this.ztreeObj.getCheckedNodes(true);
        this.setValue();
    };

    /**
     * 设置值
     * @param treeNode
     */
    TreeSelect.prototype.setValue = function(treeNode){
        var checkedNodes = treeNode ? [treeNode]:this.checkedNodes; //获取所有选中的节点
        var values = [], keys = [];
        var id = this.opts.settings.data.simpleData.idKey,
            name = this.opts.settings.data.key.name;
        for(var i = 0 , len = checkedNodes.length;i<len;i++){
            //filter parent node data
            if(this.opts.filterParent && checkedNodes[i].isParent) continue;
            values.push(checkedNodes[i][name]);
            keys.push(checkedNodes[i][id]);
        }
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
        this.opts.cbFn(checkedNodes); //执行回调函数
    };

    return TreeSelect;
});