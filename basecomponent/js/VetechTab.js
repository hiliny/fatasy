/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: tab选项卡控件
 * @linc: MIT
 *
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var laytpl = window.laytpl;

    /**
     * 默认参数
     * @type {{}}
     */
    var defaultOpts = {
        type:1,
        typeValue:{},
        splitStr:",", //默认分隔符
        itemWidth:55,  //选项的宽度
        tabWidth:100, //选项卡的宽度
        rightWidth:180, //tab-header右侧空余的宽度
        mult:false, //支持多选
        title:"支持中文拼音/简拼/三字码的输入",
        simpleData:{
            id:"bh",
            name:"name"
        },
        beforeItemClick:function(){return true;}, //选项点击前事件
        cbFn:function(){} //回调函数
    };

    /**
     * tab选项卡
     * @param elem
     * @param options
     * @constructor
     */
    function VetechTab(elem,options){
        this.id = Common.cid("vetechTab");
        this.elem = elem;
        this.$elem = $(elem);
        this.data = {};
        this.opts = $.extend(true,{},defaultOpts,options);
        this.isShow = false; //标记是否已经显示
        //把初始化的数据存储起来
        this.tempData = {};
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.checkedItems = {}; //选中的元素，支持多选
    }

    /**
     * 加载数据
     * @param callback 回调函数
     */
    VetechTab.prototype.load = function(callback){
        if($.type(callback) !== "function") throw new Error("参数配置错误");
        var _this = this;
        if(this.opts.type === 1){
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this,this.data);
        }else{
            $.ajax({
                type:"get",
                url:this.opts.typeValue,
                data:this.opts.qDatas,
                dataType:"json",
                success:function(data){
                    _this.data = data;
                    callback.call(_this,data);
                },
                error:function(msg){
                    Common.error(msg);
                }
            });
        }
    };

    /**
     * 存储数据
     */
    VetechTab.prototype.storeData = function(){
        var data = this.data;
        var id = this.opts.simpleData.id;
        for(var i = 0 ,len = data.length; i<len;i++){
            for(var j = 0, len2=data[i].groups.length;  j<len2 ; j++){
                var items = data[i].groups[j].items;
                for(var k = 0, len3 = items.length; k<len3;k++){
                    var item = items[k];
                    this.tempData[item[id]] = item;
                }
            }
        }
    };

    /**
     * 初始化
     */
    VetechTab.prototype.init = function(callback){
        var _this = this;
        this.storeData();

        var data ={
            title:this.opts.title,
            simpleData:this.opts.simpleData,
            list:this.data
        };

        Common.loadTpl(window.CTPL.TAB,function(state,result){
            if("error" === state) Common.tplError();
            laytpl(result).render(data,function(html){
                _this.$container = $(html);
                $(document.body).append(_this.$container);
                _this.setWidth();
                _this.bindEvent();
                _this.tabClick(_this.$container.find(".tab").eq(0).find("a"));
                if(callback) callback.call(_this);
            });
        });

    };

    /**
     * 设置容器的宽度
     */
    VetechTab.prototype.setWidth = function(){
        var $tabs =this.$container.find(".tab-header").find("li");
        $tabs.css("width",this.opts.tabWidth);
        this.$container.width($tabs.length * this.opts.tabWidth + this.opts.rightWidth);
        this.$container.find(".tab-content").find("li").width(this.opts.itemWidth);
    };

    /**
     * 绑定相关事件
     */
    VetechTab.prototype.bindEvent = function(){
        var _this = this;
        this.$container.on("click.vetechTab",".tab",function(ev){
            _this.tabClick($(ev.target));
        });
        this.$container.on("click.vetechTab",".item",$.proxy(this.itemClick,this));
        this.$container.on("click.vetechTab",function(){
            return false;
        });
        this.$container.on("click.vetechTab",".close",$.proxy(this.hide,this));

        $(document).on("click.vetechTab",function(ev){
            if(ev.target !== _this.elem) _this.hide();
        });
    };

    /**
     * 选项卡卡头点击事件
     * @param $target
     */
    VetechTab.prototype.tabClick = function($target){
        var $tabs =this.$container.find(".tab"),
            $contents = this.$container.find(".tab-content"),
            currIndex = $target.data("index");

        $tabs.find("a").removeClass("active");
        $contents.removeClass("active");
        $tabs.eq(currIndex).find("a").addClass("active");
        $contents.eq(currIndex).addClass("active");

    };

    /**
     * 具体选项点击事件
     */
    VetechTab.prototype.itemClick = function(ev){
        var target = ev.target,
            $target = $(target),
            id = target.id,
            result = this.tempData[id];
        if(!$target.is("a"))return;
        if(this.opts.mult){
            if($target.parent().hasClass("active")){
                $target.parent().removeClass("active");
                delete this.checkedItems[id];
            }else{
                $target.parent().addClass("active");
                this.checkedItems[id] = result;
            }
            this.setValue(this.checkedItems);
            this.opts.cbFn(this.checkedItems);
        }else{
            var beforeItemClick = this.opts.beforeItemClick,
                isContinue = true; //是否继续执行
            //beforeItemClick用于机场航站楼控件，点击城市以后，还要展示该城市对应的航站楼
            if(beforeItemClick && $.type(beforeItemClick) === "function"){
                isContinue = beforeItemClick(result);
            }
            if(isContinue){
            	this.$container.find(".tab-content li.active").removeClass("active");
            	$target.parent().addClass("active");
                this.setValue(result);
                this.opts.cbFn(result);
                this.hide();
            }
        }

    };

    /**
     * 设置值
     * @param data
     */
    VetechTab.prototype.setValue = function(data){
        var id = this.opts.simpleData.id;
        var name = this.opts.simpleData.name;
        var keys=[],values = [];
        if(this.opts.mult){

            for(var key in data){
                if(data.hasOwnProperty(key)){
                    keys.push(data[key][id]) ;
                    values.push(data[key][name]);
                }
            }
        }else{
            keys.push(data[id]) ;
            values.push(data[name]);
        }
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
    };

    /**
     * 显示
     */
    VetechTab.prototype.show = function(){
        if(!this.isShow){
            this.setPos();
            this.$container.show();
            this.isShow =true;
        }
    };

    /**
     * 隐藏
     */
    VetechTab.prototype.hide = function(){
        if(this.isShow){
            this.$container.hide();
            this.isShow = false;
        }

    };

    /**
     * 设置位置
     */
    VetechTab.prototype.setPos = function(){
        var pointer = this.$elem.offset();
        this.$container.css({"left": pointer.left, "top": pointer.top + this.$elem.outerHeight()});
    };

    /**
     * 销毁
     */
    VetechTab.prototype.destroy = function(){
        this.$container.off(".vetechTab");
        $(document).off(".vetechTab");
        this.$container.remove();
    };
    
    /**
     * 清除选中项
     */
    VetechTab.prototype.clearItemClick = function(){
		this.$container.find(".tab-content li.active").removeClass("active");
		if(this.opts.mult){
			this.checkedItems = {};
		}
    };

    return VetechTab;

});