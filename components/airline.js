/**
 * Created by sing on 2018/3/1.
 * @描述:机票航线控件
 */
define(function(require,exports,module){
    /**
     * 航线控件初始化入口
     */
    function init(){
        if($.fn.airline) return ;
        $.fn.airline = function(options){
            options = $.extend(true,{
                choosedList:[],
                hiddenName:"",
                width:650,
                height:450
            },options);
            options.el = $(this);
            var dlg = new AirlineProvider(options);
            $(this).on("click",function(){
                dlg.render();
            });
        };
    }

    /**
     * 航线控件类
     * @param options
     * @constructor
     */
    function AirlineProvider(options){
        this.option = options ||{};
        this.fnName = null;
        this.layerIndex = null;
    }

    AirlineProvider.prototype = {
        render:function(){
            var _this = this;
            this.registerCallback();
            this.choosedFn = "airline-" + String(Math.random()).replace(/\D/g,"");
            var choosedList = this.option.choosedList;
            choosedList = $("#"+this.option.hiddenName).val();
            window[this.choosedFn] = function(){
                return choosedList;
            };
            this.layerIndex = window.layui.layer.open({
                type:2,
                title:"航线选择",
                content:"/component/airlineTpl?&cbFn="+this.fnName + "&choosedFn=" +this.choosedFn,
                area:["600px","400px"],
                shade:0.3,
                end:function(){
                    window[_this.fnName] = null;
                    window[_this.choosedFn] = null;
                }
            });
        },
        registerCallback:function(){
            var _this = this;
            this.fnName =  "airline-" + String(Math.random()).replace(/\D/g,"");
            window[this.fnName] = function(data){
                var name = [],code = [];
                $.each(data,function(i,n){
                    name.push(n.dlmc);
                    code.push(n.nbbh);
                });
                name = name.length?name.join(","):"";
                code = code.length?code.join(","):"";
                var element = _this.option.el;
                if(element[0].tagName.toUpperCase() === "INPUT"){
                    element.val(name);
                }
                $("#"+_this.option.hiddenName).val(code);
                window.layui.layer.close(_this.layerIndex);
                _this.option.cbFn &&  _this.option.cbFn(data);
            };
        }
    };
    module.exports.init = init;

});