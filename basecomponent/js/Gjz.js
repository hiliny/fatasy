/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 国际州控件
 * @linc: MIT
 */
define(function (require, exports, module) {

    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        width:158,
        level: 4, //默认是4层
        splitStr:"/",
        filterIds:null, //需要过滤出来的数据，哪些不显示
        rootId:"---",
        pid:"0", //根节点的pid，默认设置为0，如果后台数据发生变化，可以在这里进行修改
        fn1:null //自定义渲染函数
    },
        $ = window.jQuery,
        Common = require("../js/Common");


    /**
     * 国际州构造函数
     * @param elem 绑定的控件dom
     * @param options 配置参数
     * @constructor
     */
    function Gjz(elem,options){
        this.id = Common.cid("Gjz");
        this.elem = elem;
        this.$elem = $(elem);
        this.$listContainers = []; //列表集合
        this.opts = $.extend({},defaultOpts,options);
        this.data = [];
        this.dataStore ={}; //数据仓库，存储分组好的数据
        this.activeItems = {}; //存储激活的对象
        this.checked = {"keys":[],"values":[],"ezms":[]}; //选中的值
        this.isShow = false; //默认隐藏
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.$hiddenInput2 = $("#" + this.opts.hiddenName2);
        //获取默认值
        try{
            this.checked.keys = this.$hiddenInput.val().split(this.opts.splitStr);
        }catch(e){
            this.checked.keys = [];
        }
    }

    /**
     * 加载数据
     * @param callback 回调函数
     */
    Gjz.prototype.load = function(callback){
        var _this = this;
        if(1 === this.opts.type){ //1、type=1 ，页面加载了数据文件date.js，直接传入json对象即可
            this.data = this.opts.typeValue;
            callback.call(_this,this.data);
        }else{
            $.ajax({
                type:"get",
                url:_this.opts.typeValue,
                dataType:"json",
                success:function(data){
                    _this.data = data;
                    callback.call(_this,_this.data);
                }
            });
        }
    };

    /**
     * 格式化数据，将数据按层级分组，渲染时减少循环量
     */
    Gjz.prototype.formartData = function(){
        //根据回填的二字码来判断
        var checkedCountrys = [],state = false;
        if(this.$hiddenInput2 && this.$hiddenInput2.val()){
            if(this.$hiddenInput2.val() === this.opts.rootId){
                state = true;
            }else{
                checkedCountrys = this.$hiddenInput2.val().split(this.opts.splitStr);
            }
        }

        var tempArr = this.opts.filterIds ? this.opts.filterIds.split(this.opts.splitStr) : [];
        for(var i = 0 , len = this.data.length;i <len;i++){
            var dataItem = this.data[i];
            if($.inArray(dataItem.id,tempArr) > -1) continue;
            //根据隐藏域中的值拿到对应的name，以此作为数据回填
            if(contains(this.checked.keys,dataItem.id)){
                this.checked.values.push(dataItem.name);
            }
            //需要给数据构造两个私有属性，一个是_dataIndex一个是_state
            dataItem._dataIndex = i;
            if(state || $.inArray(dataItem.by3,checkedCountrys) >-1){
                dataItem._state = true; //标示是否选中
            }else{
                dataItem._state = false; //标示是否选中
            }
            //按层级分组
            if(!this.dataStore[dataItem.level]) this.dataStore[dataItem.level] = [];
            this.dataStore[dataItem.level].push(dataItem);
        }
        this.render();
        this.writeValue();
    };

    /**
     * 数据回填
     */
    Gjz.prototype.writeValue = function(){
        //1、判断是否选择全球
        if(contains(this.checked.keys,this.opts.rootId)) {
            this.$elem.val("全球");
            this.$hiddenInput.val(this.getRootId()); //这里只有更新隐藏域中的id值了，下次 才会直接显示
        }
        else this.$elem.val(this.checked.values.join(this.opts.splitStr));
    };
    /**
     * 根据pid查询根节点的id
     */
    Gjz.prototype.getRootId = function(){
        for(var i = 0 ; i< this.data.length;i++){
            if(this.data[i].parid === this.opts.pid) return this.data[i].id;
        }
    };

    /**
     * 渲染
     */
    Gjz.prototype.render = function(){
        for(var i = 0 ; i< this.opts.level;i++){
            var $list = $('<div class="vetech-gjz-list" level-index="'+(i+1)+'"></div>');
            $list.css("width",this.opts.width);
            this.$listContainers.push($list);
            $(document.body).append($list);
        }
        //默认创建第一层级
        this.createList(0,this.opts.pid,false).bindEvent(0).setPos(this.$elem,0);
    };

    /**
     * 销毁
     */
    Gjz.prototype.destroy = function(){
        if(this.$listContainers.length) return;
        for(var i = 0 ; i< this.$listContainers.length;i++){
            this.$listContainers[i].remove();
        }
    };

    /**
     * 设置值
     *
     */
    Gjz.prototype.setValue = function() {
        this.checked.keys.length = 0; //存放显示值对应的id
        this.checked.values.length = 0; //存放显示的值
        this.checked.ezms.length = 0; //存放选中对应的二字码

        this.checkedOpts = [];  //选中的节点
        var _this = this;
        searchCheckedData(this, 0, this.opts.pid, function () {
            if (_this.checked.values.length === 1 && contains(_this.checked.values,"全球")) { //判断是否是选择的全球
                _this.checked.ezms = [_this.opts.rootId]; //全球对应的二字码是---
            }

            _this.$elem.val(_this.checked.values.join(_this.opts.splitStr));
            _this.$hiddenInput.val(_this.checked.keys.join(_this.opts.splitStr));
            _this.$hiddenInput2.val(_this.checked.ezms.join(_this.opts.splitStr));

            if (_this.opts.cbFn) _this.opts.cbFn(_this.data, this.checkedOpts);

        });

        //查找选中的数据(从根节点开始找)
        function searchCheckedData(_this, level, pid, cbFn) {
            var data = _this.getNextLevelDate(level, pid);
            for (var i = 0; i < data.length; i++) {
                if (data[i]._state) {
                    _this.checked.keys.push(data[i].id);
                    _this.checked.values.push(data[i].name);
                    _this.checkedOpts.push(data[i]);
                    if (data[i].isleaf === "1") _this.checked.ezms.push(data[i].by3);
                    else findEzmData(_this, data[i].level + 1, data[i].id);
                } else {
                    var nextLevel = level + 1;
                    if (nextLevel < _this.opts.level) searchCheckedData(_this, nextLevel, data[i].id);
                }
            }
            if (cbFn) cbFn();
        }

        /**
         * 查找二字码
         * @param {Object} _this
         * @param {Object} level
         * @param {Object} pid
         */
        function findEzmData(_this, level, pid) {
            var data = _this.getNextLevelDate(level, pid);
            for (var i = 0; i < data.length; i++) {
                if (data[i]._state && data[i].isleaf === "1") { //如果被选中，且是子节点情况下，该值需要存储
                    _this.checked.ezms.push(data[i].by3);
                    _this.checkedOpts.push(data[i]);
                }
                var nextLevel = level + 1;
                if (nextLevel < _this.opts.level) findEzmData(_this, nextLevel, data[i].id);
            }
        }
    };

    /**
     * 设置位置
     * @param {Object} dependDom 依赖的dom元素
     * @param {Object} levelIndex  要设置位置的dom元素的index
     */
    Gjz.prototype.setPos = function(dependDom,levelIndex){
        var pointer = $(dependDom).offset();
        if(dependDom === this.$elem){ //第一级的位置计算和后面的位置计算方式不同，要分开处理
            this.$listContainers[levelIndex].css({"left":pointer.left,"top":(pointer.top + dependDom.get(0).offsetHeight)});
        }else{
            this.$listContainers[levelIndex].css({"left":(pointer.left + dependDom.get(0).offsetWidth),"top":pointer.top});
        }
        return this;
    };


    /**
     * 创建list
     * @param {Object} levelIndex  层级
     * @param {Object} pid  父节点id
     * @param {Object} state  父节点id
     */
    Gjz.prototype.createList = function(levelIndex,pid,state){
        var $list = this.$listContainers[levelIndex],data = this.getNextLevelDate(levelIndex,pid);
        //获取隐藏域中选中的值
        var keys = this.checked.keys;
        $list.data = data;
        var $ul = $('<ul></ul>');
        for(var i = 0 ,len = data.length; i< len;i++){
            var $li = $('<li data-index="'+data[i]._dataIndex+'"></li>');
            var $label = $('<label></label>');
            $li.append($label);

            var $checkbox = $('<input type="checkbox"/>');
            var $span = $('<span>'+data[i].name+'</span>');
            var $checkboxImg = $('<img class="box" disabled="disabled" src="'+Gjz.uncheckedUrl+'" />');
            $label.append($checkbox).append($span).append($checkbox).append($checkboxImg);
            //如果是子节点或者已经是最后一层，不会出现下一层的图标
            if(data[i].isleaf ==="0" && parseInt(levelIndex) !== this.opts.level-1){
                var $nextImg = $('<img class="arrow" src="'+Gjz.arrawUrl+'" />');
                $label.append($nextImg);
            }
            var tempState = (contains(keys,data[i].id)) ? true: state;
            setCheckboxState($checkbox.get(0),tempState);
            this.changeImgUrl($checkbox);
            $ul.append($li);
        }
        $list.html("").append($ul);
        return this;
    };

    /**
     * 绑定事件
     * @param {Object} levelIndex
     */
    Gjz.prototype.bindEvent = function(levelIndex){
        var $list = this.$listContainers[levelIndex];
        var _this = this;
        $list.find("li").each(function(){
            var $checkbox = $(this).find("input");
            $checkbox.on("change",$.proxy(_this.itemClickHandler,_this,levelIndex,$checkbox));
            $(this).on("mouseover",$.proxy(_this.itemActiveHandler,_this,levelIndex,this));
        });
        //禁止输入框输入
        this.$elem.on("keydown",function(){
            return false;
        });

        //除了点击input自身和控件以外，点击其他的地方需要隐藏
        $(document.body).on("click",function(ev){
            var target = ev.target;
            if(!(ev.target === _this.elem || $(target).parents("div").hasClass("vetech-gjz-list"))){
                _this.hideContainer();
            }
        });
        return this;
    };

    /**
     * 数据项点击事件
     * @param levelIndex
     * @param $checkbox
     */
    Gjz.prototype.itemClickHandler = function(levelIndex,$checkbox){
        //更新当前点击数据项的状态
        this.changeImgUrl($checkbox);
        var nextIndex = parseInt(levelIndex)+1;
        var currData = this.data[$checkbox.parents("li").attr("data-index")];
        var state = $checkbox.get(0).checked;
        if(nextIndex < this.opts.level && currData.isleaf === "0"){
            //更新下一层级页面上的状态
            this.updateNextList(nextIndex,state);
            //更新点击对象下所有子数据项的状态值
            this.updateAllChildrensState(nextIndex,currData.id,state);
        }
        //更新上级节点的状态
        this.updatePNodeState(levelIndex,state);
    };

    Gjz.prototype.changeImgUrl = function($checkbox){
        //在更改图片是否选中的时候去同步数据的状态
        var dataIndex = $checkbox.parents("li").attr("data-index");
        this.data[dataIndex]._state = $checkbox.get(0).checked;

        var boxUrl = $checkbox.get(0).checked ? Gjz.checkedUrl : Gjz.uncheckedUrl;
        $checkbox.parent().find(".box").attr("src",boxUrl);
    };

    /**
     * 更新下一个list的状态
     * @param {Object} levelIndex 层级
     * @param {Object} state
     */
    Gjz.prototype.updateNextList = function(levelIndex,state){
        var $list = this.$listContainers[levelIndex];
        var _this = this;
        $list.find("input").each(function(){
            setCheckboxState(this,state);
            _this.changeImgUrl($(this));
        });
    };
    /**
     * 更新所有子节点的状态
     * @param {Object} levelIndex  层级
     * @param {Object} pid
     * @param {Object} state
     */
    Gjz.prototype.updateAllChildrensState = function(levelIndex,pid,state){
        function update(_this,level,pid,state){
            var data = _this.getNextLevelDate(level,pid);
            for(var i = 0; i< data.length;i++){
                data[i]._state = state;
                var nextLevel = level+1;
                if(nextLevel < _this.opts.level) update(_this,nextLevel,data[i].id,state);
            }
        }
        update(this,levelIndex,pid,state);
    };
    /**
     * 更新父节点的状态
     * @param {Object} levelIndex
     * @param {Object} state
     * @desc:更新父节点有两种情况，一种是state为false时，父节点需要清除选中，一种是state，且state所在的层级全部选中，父节点要选中
     */
    Gjz.prototype.updatePNodeState = function(levelIndex,state){
        var $checkbox;
        if(levelIndex !== 0){
            if(!state){
                for(var i = 0 ; i< levelIndex;i++){
                    $checkbox = $(this.activeItems[i]).find("input");
                    setCheckboxState($checkbox.get(0),state);
                    this.changeImgUrl($checkbox);
                }
            }else{
                var $checkboxs = this.$listContainers[levelIndex].find("input").not("input:checked");
                if($checkboxs.length === 0){
                    var prevIndex = levelIndex-1;
                    $checkbox = $(this.activeItems[prevIndex]).find("input");
                    setCheckboxState($checkbox.get(0),state);
                    this.changeImgUrl($checkbox);
                    this.updatePNodeState(prevIndex,state);
                }
            }
        }
        this.setValue();
    };

    /**
     * 数据项激活对象,鼠标移入事件
     * @param {Object} levelIndex
     * @param {Object} li
     */
    Gjz.prototype.itemActiveHandler = function(levelIndex,li){
        //如果已经是当前对象，不会再执行
        levelIndex = parseInt(levelIndex);
        this.closeNextLists(levelIndex);
        var currData = this.data[$(li).attr("data-index")];
        this.$listContainers[levelIndex].find("li").removeClass("active");
        $(li).addClass("active");
        this.activeItems[levelIndex] = li;
        //如果不是最底层而且该节点不是子节点
        if(levelIndex < this.opts.level-1 && currData.isleaf !=="1"){
            var nexeIndex = levelIndex+1;
            var pid = currData.id;
            var state = $(li).find("input").get(0).checked;
            this.createList(nexeIndex,pid,state).bindEvent(nexeIndex).setPos($(li),nexeIndex).show(nexeIndex);
        }
        return false;
    };

    /**
     *关闭下层所有list
     */
    Gjz.prototype.closeNextLists = function(levelIndex){
        for(var i = levelIndex+1;i < this.opts.level;i++){
            this.hide(i);
        }
    };

    /**
     * 列表显示
     * @param {Object} levelIndex
     */
    Gjz.prototype.show = function(levelIndex){
        this.$listContainers[levelIndex].show();
        this.isShow = true;
    };

    /**
     * 列表隐藏
     * @param {Object} levelIndex
     */
    Gjz.prototype.hide = function(levelIndex){
        this.$listContainers[levelIndex] && this.$listContainers[levelIndex].hide();
    };

    /**
     * 隐藏整个容器
     */
    Gjz.prototype.hideContainer = function(){
        for(var i = 0;i < this.$listContainers.length;i++){
            this.$listContainers[i].hide();
        }
        this.isShow = false;
    };

    /**
     * 获取下一层的数据
     * @param {Object} levelIndex
     * @param {Object} pid
     */
    Gjz.prototype.getNextLevelDate = function(levelIndex,pid){
        var data = this.dataStore[levelIndex];
        if(!data) return []; //防止层级乱写报错
        var newData = [];
        for(var i = 0 , len = data.length;i<len;i++){
            if(data[i].parid === pid) newData[newData.length] = data[i];
        }
        return newData;
    };




    /**
     * 判断一个数组中是否包含value值
     * @param arr
     * @param value
     */
    function contains(arr,value){
        for(var i = 0 ,len = arr.length; i<len;i++){
            if(value === arr[i]) return true;
        }
        return false;
    }


    /**
     * 设置checkbox的状态
     * @param {Object} box  checkbox
     * @param {Object} state  状态
     */
    function setCheckboxState(box,state){
        if(box && box.type ==="checkbox"){
            box.checked = state;
        }
    }

    Gjz.checkedUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABR0lEQVQ4T6VT3VGDQBD+vrsCPCswVqAOvksLqcBYQJBUEDsQje9SAiXEd5nECowViAXAOgc5PJBkMsobs7vfz963xD8/9ufNKjaoyjmEIYlzWxfBGkQGpR6Ki6TwZzoAJp9OAN4TMEPCBCgAmRXBInX1FsAOE3w+xJFINS4unzLbWwM0sqv3XcwOVCAfBE9qJUqdWjsNQB4lBG73sQvkDUqHqMqM4JU0VuycBZiuCZ7tAmiHyyohcV0vFvJSBIuwBjjOI+nL9P4bZm/Y1T6DR3YARGQJrceoyqVVNMTsq2wBfAsCSaH0zDJCq3iI+ZcFk0d3BOae7LQIFjfmNUqd5/5+uktcxYZluQF59AOCDYHR4GJFvkTrUfuM25f4e5AcS51GQeIr6SiwzJCJS2GbRL9pm8oYkNAGxi0MsMek073HdMgd9Hu+ASMdqhFDVly6AAAAAElFTkSuQmCC";
    Gjz.uncheckedUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA+0lEQVQ4T62T3Y2DMAzHbcz7dYQboZHC8zHCjdAROgIblBG6QTsC95xIZoQboQNgfHKUoqoKDy3HQ0SM/fMffyAUHmbeTdP0VVXV3j7P8zzWdf3jnLs9u+OjwQJF5AQAZr+qagpAxB0AfNs7ER0fQQuAmfci0mWH3xVlnyLSE1HnnBsT3I6c+UxEh5LMgsrFNwFijGYwajHzsxpmNiWd9/6AOXtvl5LsNVtOesQYYyqO9/76IiDFYQihA4ChaZrhFUAIoQWAdjtg8y9sLuLmNv7LIGXI+6N8b9+9HnZX1QsR3UTEpvUDEa3vuLpMhXlvVTWtMyKORDSU9uQPB1G/Nds28bkAAAAASUVORK5CYII=";
    Gjz.arrawUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1klEQVQ4T53TMQ6CMBgF4L8GNxxcNCbAWTgCHcqMN/AIeAOPoKtM3oAj6A1MmASHOsrAMzWSoCktyERo/q+89JVR51kei90t9jfdb7Z39gVkBYgofzoul3wubcNqXQcQCLIhxu/Cz22IFmiHQJSWwt+aECPwGTRGGgIYIw0CTJFGAQoC4VSKIGrRUQCAB2gSVrF3Hg0AdKmnbvjbj0F/AMKhFEGiO04r0ICtq9jb93WhF1B5G8YiWxv1VX7ndSLJV9fRVVbHVDuz5K/LtMgK1f3Utmt3/QXLB3gRjd5nowAAAABJRU5ErkJggg==";


    return Gjz;
});
