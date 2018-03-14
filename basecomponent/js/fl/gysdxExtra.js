/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:
 * @linc: MIT
 *
 */
define(function (require,exports) {

    //标记该模块是否已经被加载过，如果被加载过，init方法不再执行
    var isLoaded = false,
        hotData = [], //热门数据
        allData = []; //整个数据

    var Pulldown = require("../Pulldown.js"),
        Common = require("../Common.js");


    function init(){
        if($.fn.showGysdx) return;

        $.fn.showGysdx = function(options){

            if(!this.length) Common.nodeError(this);
            var options1 = $.extend(true,{
                type:1,
                typeValue:hotData,
                "_hasPage_":false //不要分页
            },options);

            var options2 = $.extend(true,{
                type:1,
                typeValue:allData
            },options);

            var pulldown1 = new Pulldown(this.get(0), options1);
            var pulldown2 = new Pulldown(this.get(0), options2);
            var activePulldown = pulldown1;

            this.on("click",function(){
                pulldown1.load(function(data){
                    this.render();
                    this.show();
                });
                pulldown2.hide();
            }).on("keyup",function(ev){
                if(!this.value){
                    activePulldown = pulldown1;
                    pulldown2.hide();
                }else{
                    activePulldown = pulldown2;
                    pulldown1.hide();
                }
                activePulldown.elemKeyUpHandler(ev,function(){
                    this.render();
                    this.show();
                });
            });

        };
    }
    exports.init = init;


});