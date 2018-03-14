/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 定时器刷新
 * @linc: MIT
 *
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");

    var defautOpts = {
        totalTime:60, //总时长
        startTxt:"启",
        stopTxt:"停"
    };


    /**
     * 构造函数
     * @param elem 要添加的样式
     * @param options
     * @constructor
     */
    function Refresh(elem,options){
        this.id = Common.cid("Refresh");
        this.elem = elem;
        this.$elem = $(elem);

        this.timer = null;
        this.state = "start";
        this.opts = $.extend(true,{},defautOpts,options);
        this.currTime = this.opts.totalTime;

        this.render();
    }

    Refresh.prototype.render = function(){
        this.$container = $('<div class="refresh-container"><p>本页面将在</p>\n' +
            '    <p><span class="clock">'+this.currTime+'</span>秒</p>\n' +
            '    <p>后自动刷新</p>\n' +
            '    <input type="button" value="'+this.opts.stopTxt+'">');

        this.$elem.append(this.$container);

        this.init();
        this.bindEvent();
    };

    Refresh.prototype.init = function(){

        this.timer && clearInterval(this.timer);
        var _this = this;
        this.update();
        this.timer = setInterval(function(){
            _this.currTime--;
            _this.update();
        },1000);
    };

    Refresh.prototype.start = function(){
        this.state = "start";
        this.$container.find("input").val(this.opts.stopTxt);
        this.init();
    };
    Refresh.prototype.stop = function(){
        clearInterval(this.timer);
        this.state = "stop";
        this.$container.find("input").val(this.opts.startTxt);
    };

    Refresh.prototype.update = function(){
        if(this.currTime<=0){
            this.currTime = this.opts.totalTime;
            if(this.opts.cbFn) this.opts.cbFn();
            this.init();
        }else{
            this.$container.find(".clock").html(this.currTime);
        }
    };

    /**
     * 重置
     */
    Refresh.prototype.reset = function(){
        this.state = "start";
        this.currTime = this.opts.totalTime;
        this.$container.find("input").val(this.opts.stopTxt);
        this.init();
    };


    Refresh.prototype.bindEvent = function(){
        var _this = this;
        this.$container.on("click.Refresh","input",function(){
            if(_this.state === "start"){
                _this.stop();
            }else{
                _this.start();
            }
        });
    };

    /**
     *
     */
    Refresh.prototype.destroy = function(){
        this.off(".Refresh");
        this.$container.remove();
    };



    return Refresh;
});