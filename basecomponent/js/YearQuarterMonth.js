/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 年度、季度和月度控件
 * @linc: MIT
 *
 */
define(function (require, exports, module) {
    //当前年
    var currYear = new Date().getFullYear();
    var Common = require("../js/Common");
    var laytpl = window.layui ? window.layui.laytpl : window.laytpl;

    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        startYear:currYear - 10, //年份开始时间
        endYear:currYear+10, //年份结束时间
        chooseName:"choose", //选择框的名字
        yearName:"year", //年下拉框的名称
        month1Name:"month1", //月份1下拉框的名称
        month2Name:"month2", //月份2下拉框的名称
        cbFn:function(select,value){} //回调函数
    };


    /**
     *
     * @param elem  要存放年度、季度和月度控件的
     * @param options
     * @constructor
     */
    function YearQuarterMonth(elem,options){
        this.id = Common.cid("YearQuarterMonth");
        this.elem = elem;
        this.$elem = $(elem);

        this.opts = $.extend(true,{},defaultOpts,options);

        this.init();
    }

    /**
     * 初始化
     */
    YearQuarterMonth.prototype.init = function(){
        var _this = this;
        Common.loadTpl(window.CTPL.YEARQUARTERMONTH,function(state,result){
            if(state === "error") Common.tplError();
            laytpl(result).render(_this.opts,function(html){
                _this.$container = $(html);
                _this.$elem.html(_this.$container);
                _this.bindEvent();
                _this.chooseHandler("year");
            });

        });
    };
    /**
     * 绑定函数
     */
    YearQuarterMonth.prototype.bindEvent = function(){
        var _this = this;
        this.$container.on("change.yearQuarterMonth","select",function(ev){
            var $target = $(this);
            if($target.hasClass("choose")){
                _this.chooseHandler(this.value);
            }else{
                _this.opts.cbFn(this,this.value);
            }
        });
    };

    /**
     * 选择
     * @param value
     */
    YearQuarterMonth.prototype.chooseHandler = function(value){
        //初始选择的时候，让所有的都显示（相当于重置）
        this.$container.find("select").show().end().find("span").show();
        if(value === "year"){
            this.$container.find(".month1").hide().next("span").hide().next().hide();
            this.$container.find(".month2").hide().next("span").hide();
        }else if(value === "month"){
            this.$container.find(".splitStr").hide().end().find(".month2").hide().next("span").hide();
        }
    };

    /**
     * 销毁
     */
    YearQuarterMonth.prototype.destroy = function(){
        this.$container.off(".yearQuarterMonth");
        this.$container.remove();
    };

    return YearQuarterMonth;

});