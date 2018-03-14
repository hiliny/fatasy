/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 航司多选控件，也可以用于国际舱位控件
 * @linc: MIT
 */
define(function (require, exports, module) {

    var defaultOpts = {
            width:380, //自定义宽度
            height:null, //自定义高度
            hiddenName:null, //隐藏域name
            content:"", //显示的内容
            autoClose: false ,//是否自动关闭
            defer:2000, //延迟多少秒
            allCheck:"---", //如果配置allCheck = "---",则在全选的时候，赋值为allCheck配置的值
            fn1:null, //自定义渲染title
            splitStr:"/", //分隔符
            fn2:null, //自定义渲染数据项
            qDatas:{},
            ajaxOpts:{
                type:"get"
            },
            simpleData:{
              id:"id",
              name:"name"
            },
            pos:[] //位置
        },
        $ = window.jQuery,
        Common = require("../js/Common.js");


    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function HSMult(elem,options){
        this.id  = Common.cid("vetech-cabin");
        this.elem = elem;
        this.$elem = $(elem);

        this.opts = $.extend(true,{},defaultOpts,options);
        this.isShow = false;
        this.checkedData = {}; //选中的数据

        this.$hiddenInput =$("#"+this.opts.hiddenName);
        this.data = []; //存储加载的数据
        this.init();

    }

    /**
     * 初始化
     */
    HSMult.prototype.init = function(){
        this.$container = $('<div class="vetech-cabin"></div>');
        this.$container.css("width",this.opts.width);
        $(document.body).append(this.$container);
    };
    /**
     * 加载数据
     * @param callback 回调函数
     */
    HSMult.prototype.load = function(callback){
        var _this = this;
        if(this.opts.type === 1){
            this.data = this.opts.typeValue;
            callback.call(this,this.data);
        }else{
            $.ajax($.extend(true,{
                type:"get",
                url:this.opts.typeValue,
                data:this.opts.qDatas,
                success:function(data){
                    _this.data = data;
                    callback.call(_this,_this.data);
                }
            },this.opts.ajaxOpts));
        }
    };
    /**
     * 渲染数据
     */
    HSMult.prototype.render = function(){

        if($.type(this.data) !== "array") throw new TypeError("数据格式错误，需要[object Array]格式");
        this.$container.html("");
        var $dl = $('<dl class="clearfix"></dl>');
        var $dd = $('<dd></dd>');
        $dd.css("width","100%");
        var $ul = $('<ul class="clearfix"></ul>');
        $dd.append($ul);
        $dl.append($dd);
        var name = this.opts.simpleData.name;
        for(var i= 0 , len2 = this.data.length; i< len2; i++){
            var item2 =this.data[i];
            var $li = $('<li><label class="item no-publish-seat">'+(this.opts.fn2 ? this.opts.fn2(item2) : item2[name])+'</label></li>');
            $li.data("data",item2);
            $ul.append($li);
        }
        this.$container.append($dl);
        if(this.data.length){
            this.addToolbar();
        }

    };
    /**
     * 添加底部工具栏
     */
    HSMult.prototype.addToolbar = function(){
        this.$toolbar = $('<dl class="clearfix toolbar"></dl>');
        this.$toolbar.append('<dt style="width:100%;"><label class="checked-all-btn">全选</label></dt>');
        this.$container.append(this.$toolbar);
        this.bindEvent();
    };

    /**
     * 显示
     */
    HSMult.prototype.show = function(){
        if(this.elem.readOnly) return; //如果是readonly，则不显示
        if(this.isShow) return;
        this.setPos();
        this.isShow = true;
        this.$container.css("visibility","visible");
    };
    /**
     * 隐藏
     */
    HSMult.prototype.hide = function(){
        if(!this.isShow) return;
        this.$container.css({"visibility":"hidden","left":-1000,"top":-1000});
        this.isShow = false;
    };
    /**
     * 设置位置
     */
    HSMult.prototype.setPos = function(){
        var pointer = this.$elem.offset(),
            iWidth = $(document).outerWidth(),
            iTop = pointer.top + this.$elem.outerHeight(),
            iLeft = pointer.left + this.$container.outerWidth() > iWidth ?  (pointer.left + this.$elem.outerWidth())-this.$container.outerWidth() : pointer.left;
        this.$container.css({"left":iLeft, "top":iTop});
    };

    /**
     * 数据回填
     */
    HSMult.prototype.writeValue = function(){
        var checked = (this.$hiddenInput.val() || "").split(this.opts.splitStr),
            checkedData = [],
            names = [],
            id = this.opts.simpleData.id,
            name = this.opts.simpleData.name;
        this.$container.find(".item").each(function(i,item){
            var data = $(item).parent().data("data");
            if($.inArray(data[id],checked) >-1){
                $(item).addClass("active");
                checkedData.push(data);
                names.push(data[name]);
            }
        });
        this.$elem.val(names.join(this.opts.splitStr));
        this.opts.cbFn(checkedData);
    };

    /**
     * 全部选中
     * @param {Object} ev
     */
    HSMult.prototype.checkedAll = function(ev){
        var $target = $(ev.target);
        if($target.hasClass("active")){
            $target.removeClass("active");
            this.$container.find("label").removeClass("active");
        }else{ //全部选中
            $target.addClass("active");
            this.$container.find("label").addClass("active");
        }
        this.setValue();
    };

    /**
     * 绑定事件
     */
    HSMult.prototype.bindEvent = function(){
        var _this = this;
        this.$container.on("click.HSMult",".checked-all-btn",$.proxy(this.checkedAll,this));

        this.$container.on("click.HSMult",".item",$.proxy(this.itemClick,this));

        $(document).on("click.HSMult",function(ev){
            if(ev.target !== _this.elem) _this.hide();
        });

        this.$container.on("click.HSMult",function(){
            return false;
        });
    };

    /**
     * 销毁
     */
    HSMult.prototype.destroy = function(){
        this.$container.off(".HSMult");
        this.$container.remove();
        $(document).off(".HSMult");
    };

    /**
     * 设置值
     */
    HSMult.prototype.setValue = function(){
        var checkeds = [],
            names =[],
            ids =[],
            id = this.opts.simpleData.id,
            name = this.opts.simpleData.name;
        this.$container.find(".item").each(function(i,item){
            if($(item).hasClass("active")){
                var data = $(item).parent().data("data");
                checkeds.push(data);
                names.push(data[name]);
                ids.push(data[id]);
            }
        });
        this.$elem.val(names.join(this.opts.splitStr));
        this.$hiddenInput.val(ids.join(this.opts.splitStr));
        this.opts.cbFn(checkeds);
    };

    /**
     * 单个选项点击事件
     * @param ev
     */
    HSMult.prototype.itemClick = function(ev){
        var $target = $(ev.target);
        if($target.hasClass("active")){
            $target.removeClass("active");
            this.$container.find(".checked-all-btn").removeClass("active");
        }else{
            $target.addClass("active");
            var isCheckedAll = true;
            this.$container.find(".item").each(function(){
                if(!$(this).hasClass("active")){
                    isCheckedAll = false;
                    return false;
                }
            });
            if(isCheckedAll){
                this.$container.find(".checked-all-btn").addClass("active");
            }
        }
        this.setValue();
    };


    return HSMult;

});
