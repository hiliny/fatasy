/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: treeSelect下拉框扩展
 * @linc: MIT
 *
 */
define(function (require,exports) {
    var Common = require("../js/Common.js");
    var TreeSelect = require("../js/TreeSelect.js");

    function init(){
        if($.fn.showTreeSelect) return;

        $.fn.showTreeSelect = function(options){
            if(!this.length){
                Common.nodeError(this);
                return;
            }

            if(this.data("componentTreeSelect")){
                this.data("componentTreeSelect").destroy();
                this.off(".ztree");
            }

            var tr = new TreeSelect(this.get(0),options);
            var isLoaded = false;
            this.on("click.ztree",function(){
                if(isLoaded){
                    tr.show();
                }else{
                    tr.load(function(data){
                        this.data= data.result;
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        };
    }
    exports.init = init;

});