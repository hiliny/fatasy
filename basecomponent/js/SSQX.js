/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 省市区县联动控件(所有控件不提供数据回填功能)
 * @linc: MIT
 *
 */
define(function (require, exports, module) {

    /**
     * 默认配置参数
     */
    var defaultOpts = {
        type:1,
        typeValue:{},
        splitStr:",", //默认分隔符
        itemWidth:55,  //选项的宽度
        tabWidth:100, //选项卡的宽度
        rightWidth:180, //tab-header右侧空余的宽度
        headers:["省份","城市","区县"], //省份、城市、区县头部
        simpleData:{
            id:"bh",
            name:"name",
            pid:"pid"
        },
        pid:"00002", //省份的pid
        closeImg:"/img/clsoe.png",  //关闭
        cbFn:function(){} //回调函数
    },
        Common = require("../js/Common");


    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function SSQX(elem,options){
        this.id = Common.cid("SSQX");
        this.elem = elem;
        this.$elem = $(elem);

        this.opts = $.extend(true,{},defaultOpts,options);

        this.iNow = 0; //当前激活的tab

        this.$hiddenInput = $("#" + this.opts.hiddenName);

        this.init();
    }

    /**
     * 初始化
     */
    SSQX.prototype.init = function(){
        this.$container = $('<div class="vetech-ssqx">');

        var $closeBtn = $('<span class="close"> <img src="'+this.opts.closeImg+'"> </span>');

        //构造tab头部
        var $tabHeader = $('<div class="tab-header">');
        var headers = this.opts.headers,
            $ul = $('<ul class="clearfix">');
        var tabContents = [];
        for(var i = 0, len = headers.length;i<len;i++){
            var $li = $('<li class="tab"><a href="javascript:;" data-index="'+i+'">'+headers[i]+'</a></li>');
            var contentDiv = '<div class="tab-content"></div>';
            tabContents.push(contentDiv);
            $ul.append($li);
        }
        $tabHeader.append($ul);

        this.$container.append($closeBtn).append($tabHeader).append(tabContents.join(""));

        this.tabClick($tabHeader.find("li").first());

        this.bindEvent(); //绑定事件
    };



    /**
     * load函数
     * @param callback
     */
    SSQX.prototype.load = function(callback){
        var _this = this;
        if(this.opts.type === 1){
            this.data = this.opts.typeValue;
            callback.call(this,this.data);
        }else{
            //查询参数
            var queryObj = this.opts.qDatas;
            queryObj[this.opts.simpleData.pid] = this.opts.pid;

            $.ajax({
                type:"get",
                url:this.opts.typeValue,
                data:queryObj,
                success:function(data){
                    if(data.status === "200") {
                        _this.data = data.result.records;
                    }else{
                        Common.error(data.message);
                    }
                    callback.call(_this,_this.data);
                },
                error:function(msg){
                    Common.error(msg);
                }
            });
        }

    };

    /**
     * 渲染
     */
    SSQX.prototype.render = function(){
        if(!this.data.length)return;
        var $ul = $('<ul class="clearfix">');
        for(var i=0,len = this.data.length; i<len;i++){
            var item = this.data[i];
            var $li = $('<li class="item"><a href="javascript:;" title="'+item[this.opts.simpleData.name]+'">'+item[this.opts.simpleData.name]+'</a>');
            $li.data("data",item);
            $ul.appendChild($li);
        }
        this.$container.find(".tab-content").eq(this.iNow).html($ul);

    };

    /**
     * 头部点击事件
     */
    SSQX.prototype.tabClick = function($li){
        var index = $li.data("index");
        this.iNow = parseInt(index);
        this.$container.find(".tab").find("a").removeClass("active").end().eq(index).find("a").addClass("active");

        this.$container.find(".tab-content").removeClass("active").eq(index).addClass("active");
    };

    /**
     * 点击事件点击事件
     * @param $li
     */
    SSQX.prototype.itemClick = function($li){

        if($li.find("a").hasClass("active")){ //取消选择
            $li.parents(".tab-content").nextAll(".tab-content").empty();
            $li.find("a").removeClass("active");
        }else{ //选择
            $li.find("a").addClass("active");
            var data = $li.data("data");

            this.opts.pid = data[this.opts.simpleData.pid];
            if (this.iNow < this.opts.headers.length - 1) { //已经选择到最后一层
                this.iNow = this.iNow + 1;
                this.tabClick(this.$container.find(".tab").eq(this.iNow));
                this.load(function () {
                    this.render();
                });
            }
            this.setValue();
        }

    };

    /**
     * 设置值
     */
    SSQX.prototype.setValue = function(){
        var result = [], values = [],keys = [],sd = this.opts.simpleData;
        this.$container.find(".tab-content").find("a").each(function(i,item){
            if($(item).hasClass("active")){
                var data = $(item).parent().data("data");
                result.push(data);
                values.push(sd.name);
                keys.push(sd.id);
            }
        });

        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.length && this.$hiddenInput.val(keys.join(this.opts.splitStr));
        this.opts.cbFn(result);

        result = null;
        values = null;
        keys = null;
    };

    /**
     * 绑定事件
     */
    SSQX.prototype.bindEvent = function(){
        var _this = this;

        this.$container.on("mousedown.ssqx",function(){
           return false;
        }).on("click",".close",function(){
            _this.hide();
        }).on("click",".tab",function(){
            _this.tabClick($(this));
        }).on("click",".item",function(){
            _this.itemClick($(this));
        });

        //close
        $(document).on("mousedown.ssqx",function(ev){
            if(ev.target !== _this.elem) _this.hide();
        });
    };

    /**
     * 显示
     */
    SSQX.prototype.show = function(){
        if(this.isShow) return;
        this.setPos();
        this.$container.show();
        this.isShow = true;
    };

    /**
     * 隐藏
     */
    SSQX.prototype.hide = function(){
        if(this.isShow){
            this.$container.hide();
            this.isShow = false;
        }
    };

    /**
     * 设置位置
     */
    SSQX.prototype.setPos = function(){
        var pointer = this.$elem.offset();
        this.$container.css({"left":pointer.left, "top":pointer.top + this.$elem.outerHeight()});
    };

    /**
     * 销毁
     */
    SSQX.prototype.destroy = function(){
        this.$container.off(".ssqx");
        this.$container.remove();
    };

});