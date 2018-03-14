/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 多选下拉框
 * @linc: MIT
 *
 */
define(function (require, exports, module) {

    /**
     * 默认配置参数
     * @type {{width: number, height: number, type: number, typeValue: Array, simpleData: {id: string, name: string, title: null}, hiddenName: string, splitStr: string, hasAllChecked: boolean, usetype: string, editable: boolean, fn1: null}}
     */
    var defaultOpts = {
        width:null,
        height:120,
        type:1,
        typeValue:[],
        simpleData:{
            "id":"id",
            "name":"name",
            "title":null // 要显示的属性
        },
        formatPostData:function(data){return data;}, //格式化发送请求的数据
        ajaxOpts:{
            type:"get"
        },
        defaultValues:null, //默认显示的值，默认不会配置，==请选择==
        qDatas:{}, //查询参数
        hiddenName:"", //隐藏域id
        splitStr:",",//分隔符
        hasAllChecked:false, //是否有全选功能
        usetype:"mult", //默认是多选的
        disbale:false, //是否不可编辑
        fn1:null, //自定义渲染
        cbFn:function(){} //回调函数
    };

    var Common = require("../js/Common");


    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function MultSelect(elem,options){
        this.id = Common.cid("MultSelect");
        this.elem = elem;
        this.$elem = $(elem);

        this.opts = $.extend(true,{},defaultOpts,options);
        this.isShow = false; //默认是没有显示的
        //隐藏域
        this.$hiddenInput = $("#" +this.opts.hiddenName);

        this.checked = null; //选择的对象值，这个属性只针对单选

        this.init();
    }

    /**
     * 初始化
     */
    MultSelect.prototype.init = function(){
        this.$elem.addClass("ve-arrow-down");
        this.$container = $('<div class="mult-select">');
        var width = this.opts.width;
            width = width ? width : this.$elem.outerWidth();
        this.$container.css({
            width:width,
            height:this.opts.height
        });

    };

    /**
     * 加载数据
     * @param callback
     */
    MultSelect.prototype.load = function(callback){
        var _this = this;
        if(this.opts.type === 1){
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this,this.data);
        }else{
            $.ajax($.extend(true,{
                type:"get",
                url:this.opts.typeValue,
                dataType:"json",
                data:this.opts.formatPostData(this.opts.qDatas),
                success:function(data){
                    _this.data = data;
                    callback.call(_this,_this.data);
                },
                error:function(msg){
                    throw new Error("数据加载错误"+msg);
                }
            },this.opts.ajaxOpts));
        }
    };
    /**
     * 初始化
     */
    MultSelect.prototype.render = function(){
        var sd = this.opts.simpleData,
            dvs = this.opts.defaultValues,
            value = "",
            title="";

        if(!this.data.length) return;

        var keys = (this.$hiddenInput.val() || "");
            keys = keys.split(this.opts.splitStr);
        //多选下拉全选功能
        if(this.opts.usetype === "mult" && this.opts.hasAllChecked){
            var $allChecked = $('<label class="allChecked checkbox" title="全选">全选<input type="checkbox"></label>');
            this.$container.append($allChecked);
        }else if(this.opts.usetype === "radio" && this.opts.defaultValues){ //单选，可能要配置==请选择==
            value = dvs[sd.name];
            title = dvs[sd.title];

            var $firstLabel = $('<label class="item" title="'+title+'">'+value+'</label>');
            $firstLabel.data("data",this.opts.defaultValues);
            this.$container.append($firstLabel);
        }

        for(var i = 0 ,len = this.data.length;i<len;i++){
            value = this.opts.fn1 ? this.opts.fn1(this.data[i]) : this.data[i][sd.name];
            title = sd.title ? this.data[i][sd.title] : value;
            var $label = $('<label class="item" title="'+title+'">'+value+'</label>');

            if(this.opts.usetype === "mult"){
                $label.addClass("checkbox").append('<input type="checkbox" value="'+this.data[i][sd.id]+'">');
                if($.inArray(this.data[i][sd.id],keys) !== -1){
                    $label.find("input").get(0).checked = true;
                }
            }
            if(!this.checked && this.opts.usetype === "radio"){
                if($.inArray(this.data[i][sd.id],keys) !== -1){
                   this.checked = this.data[i];
                }
            }

            $label.data("data",this.data[i]);
            this.$container.append($label);

        }

        $(document.body).append(this.$container);

        this.bindEvent();

        this.writeValue();
    };

    /**
     * 显示
     */
    MultSelect.prototype.show = function(){
        if(this.isShow) return;
        this.$elem.removeClass("ve-arrow-down").addClass("ve-arrow-up");
        this.setPos();
        this.$container.css("visibility","visible");
        this.isShow = true;
    };

    /**
     * 隐藏
     */
    MultSelect.prototype.hide = function(){
        if(!this.isShow) return;
        this.$elem.removeClass("ve-arrow-up").addClass("ve-arrow-down");
        this.$container.css({
            "visibility":"hidden",
            "left":-1000,
            "top":-1000
        });
        this.isShow = false;
    };

    /**
     * 设置位置
     */
    MultSelect.prototype.setPos = function(){
        var pointer = this.$elem.offset();
        this.$container.css({"left":pointer.left,"top":pointer.top + this.$elem.outerHeight()});
    };

    /**
     * 销毁整个控件
     */
    MultSelect.prototype.destroy = function(){
        this.$container.off(".multSelect");
        this.$container.remove();
    };

    /**
     * 绑定事件
     */
    MultSelect.prototype.bindEvent = function(){
        var _this = this;

        if(this.opts.usetype === "mult"){
            this.$container.on("change.multSelect",".item",$.proxy(this.setValue,this));
        }else{
            this.$container.on("click.multSelect",".item",function(){
                var data = $(this).data("data");
                _this.setValue(data);
            });
        }
        //全选功能
        if(this.opts.hasAllChecked){
            this.$container.on("change.multSelect",".allChecked",function(){
                var state = $(this).find("input").get(0).checked;
                _this.$container.find("input[type='checkbox']").each(function(i,item){
                    item.checked = state;
                });
                _this.setValue();
            });
        }

        this.$container.on("mousedown.multSelect",function(){
            return false;
        });
        $(document).on("mousedown.multSelect",function(ev){
            var target = ev.target;
            if(target !== _this.elem) _this.hide();
        });

        //如果不可编辑，则不让输入
        if(this.opts.disabled){
            this.$elem.on("keydown.multSelect",function(){
                return false;
            });
        }



    };
    /**
     * 设置值
     * @param data 设置值
     */
    MultSelect.prototype.setValue = function(data){
        var result =[],keys = [],values = [],sd = this.opts.simpleData;
        if(this.opts.usetype === "mult"){
            var $checkedBox = this.$container.find("input[type='checkbox']:checked");

            var checkedCount = 0;
            $checkedBox.each(function(i,item){
                var $label = $(item).parents("label");
                if($label.hasClass("allChecked")) return true;
                var data = $label.data("data");
                result.push(data);
                keys.push(data[sd.id]);
                values.push(data[sd.name]);
                checkedCount++;
            });
            //设置全选是否选中
            var $allChecked = this.$container.find(".allChecked");
            if($allChecked.length){
                $allChecked.find("input").get(0).checked = checkedCount === this.$container.find("input[type='checkbox']").length-1;
            }
        }else{
            values.push(data[sd.name]);
            keys.push(data[sd.id]);
            this.hide();
        }

        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
        this.opts.cbFn(this.opts.usetype === "mult" ? result : data);
    };

    /**
     * 数据回填
     */
    MultSelect.prototype.writeValue = function(){
        if(this.checked){
            this.setValue(this.checked);
            delete this.checked;
        }

    };

    return MultSelect;

});