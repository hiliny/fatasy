/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 悬浮层控件
 * @linc: MIT
 *
 */
define(function (require, exports, module) {

    var Common = require("../js/Common");

    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        width:200,
        height:100,
        position:"down",
        arraw_down:"img/down.png",
        arraw_up:"img/up.png",
        triggerType:"mousemove",
        beforeDestroy:function(){return true;},
        setEvent:function(){}, //设置事件函数
        defer:100,//关闭窗口延时时间
        createOnce:true //是否创建一次，如果设置为true,当鼠标移除到popup层，自动销毁控件
    };


    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function Popup(elem,options){
        this.id = Common.cid("vetech-popup");
        this.elem = elem;
        this.$elem = $(elem);

        this.opts = $.extend(true,{},defaultOpts,options);
        this.init();

        this.isShow = false;
    }

    /**
     * 初始化
     */
    Popup.prototype.init = function(){
        this.$container = $('<div class="vetech-popup">');
        var $content = $('<div class="content">');

        this.$container.append($content);

        var $img = $('<img>');
        if(this.opts.position === "down"){
            $content.addClass("upContent");
            $img.addClass("arraw_up").attr("src",this.opts.arraw_up);
        }else{
            $content.addClass("downContent");
            $img.addClass("arraw_down").attr("src",this.opts.arraw_down);
        }
        $img.css("left",(this.opts.width-20)/2);

        this.$container.append($img);
        this.$container.css({width:this.opts.width,height:this.opts.height});

        $(document.body).append(this.$container);

        this.bindEvent();

    };

    /**
     * 添加内容
     */
    Popup.prototype.addContent = function(html){
        this.$container.find(".content").append(html);
    };

    /**
     * 显示
     */
    Popup.prototype.show = function(){
        if(this.isShow) return;

        this.setPos();

        this.$container.show();
        this.isShow = true;
    };

    /**
     * 隐藏
     */
    Popup.prototype.hide = function(){
        if(!this.isShow) return;
        this.$container.hide();
        this.isShow = false;
    };

    /**
     * 销毁
     */
    Popup.prototype.destroy = function(){
        if($.type(this.opts.beforeDestroy) === "function" && this.opts.beforeDestroy()){
            $(document).off(".popup");
            this.$elem.off(".popup");
            this.$container.off(".popup");
            this.$container.remove();

        }
    };

    /**
     * 绑定事件
     */
    Popup.prototype.bindEvent = function(){
        var _this = this;
        _this.timer = null;
        _this.state = null; //当前状态


        if(this.opts.triggerType === "click"){
            this.opts.defer = 0;
        }

        $(document).on(this.opts.triggerType +".popup",function(ev){
            clearTimeout(_this.timer);
            var target = ev.target;

            if(target !== _this.elem  && $(target).closest(".vetech-popup").get(0) !== _this.$container.get(0)){
                _this.state = "isClosing"; //准备关闭
                _this.timer = setTimeout(function(){
                    if(_this.state !== "isClosing") return;
                    if(_this.opts.createOnce){
                        _this.destroy();
                    }else{
                        _this.hide();
                    }

                },_this.opts.defer);
            }else{
                _this.state = "open";
            }
        });
        //添加外面绑定的事件
        this.opts.setEvent.call(this);
    };

    /**
     * 设置位置
     */
    Popup.prototype.setPos = function(){
        var pointer = this.$elem.offset();

        var iLeft = pointer.left +  this.$elem.width()/2 - this.opts.width/2; //左侧
        iLeft = iLeft <0 ? 0 :iLeft;
        if($(document.body).width() - iLeft < this.opts.width){
            iLeft = $(document.body).width() - this.opts.width;
        }
        var iTop = pointer.top - this.opts.height+1;

        if(this.opts.position === "down" || iTop <0){
            iTop = pointer.top + this.$elem.height();
        }
        this.$container.css({"left":iLeft,"top":iTop});

    };

    return Popup;

});