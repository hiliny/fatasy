/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 自动分隔控件
 * @linc: MIT
 */
define(function (require, exports, module) {

    function init(){
        if($.fn.autoSplit) return;
        $.fn.autoSplit=function(options){
            if(this.data("isBinded")) return; //避免重复绑定
            var opts = $.extend({
                length:3, //分割
                split:"/", //分割符号
                distinct:false, //是否去重
                autoAll:true, //是否支持---
                cbFn:function(){}, //回调函数
                upcase:true, //是否转大写
                suportNum:false //是否支持数字
            }, options);

            this.on("keydown",function(ev){
                var codeVal = ev.keyCode;
                var strVal = $(this).val();
                //已经输入---了，什么都不能输入
                if($(this).val() === "---" && codeVal!== 8) return false;
                //suportNum为false的时候，不让输入数字
                if(((codeVal >= 48 && codeVal <=57) || (codeVal >=96 && codeVal <=105)) && !opts.suportNum) return false;
                //只能连续输入---，否则-是不能被输入的
                if((codeVal === 189 || codeVal === 109) && !(strVal === "" || strVal === "-" || strVal === "--"))return false;

                return true;
            });

            this.on("keyup",function(){
                var strVal = $(this).val();
                //分两种情况，一种是length为3，直接输入---；另一种是length不为3，但是也要允许---，是否允许，取决于opts.autoAll的配置
                if(strVal === "---" || (opts.autoAll && (strVal === "" || strVal === "-" || strVal === "--"))){
                    strVal = strVal;
                }else{
                    if(opts.upcase) strVal = strVal.toUpperCase();
                    strVal = strVal.replace(new RegExp(opts.split,'gm'),"");
                    var tempArr = [];
                    for(var i = 0 ; i< strVal.length;i++){
                        tempArr.push(strVal.substr(i,opts.length));
                        i+= opts.length-1;
                    }
                    //去重操作
                    if(opts.distinct){
                        var tempObj = {},
                            index= 0,
                            len = tempArr.length,
                            key;
                        for(;index<len;index++){
                            tempObj[tempArr[index]] = tempArr[index];
                        }
                        tempArr =[];
                        for(key in tempObj){
                            tempArr.push(key);
                        }
                    }
                    strVal = tempArr.join(opts.split);
                }
                $(this).val(strVal);
                opts.cbFn(strVal);
            });

            this.data("isBinded",true);
        };

    }

    exports.init = init;
});
