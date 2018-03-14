/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 航班号是否适用控件
 * @linc: MIT
 */
define(function (require, exports, module) {

    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        cbFn:function(){},
        showGXHB: true //默认是显示共享航班的
    };
    var Common = require("../js/Common.js");

    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
   function FlightNum(elem,options){
        this.id = Common.cid("FlightNum");
        this.elem = elem;
        this.$elem = $(elem);
        this.isShow = false;
        this.opts =$.extend(true,{},defaultOpts,options);
        if(!this.opts.hiddenName1) throw new Error("适用航班隐藏域ID需要配置");
        if(this.opts.showGXHB &&  !options.hiddenName2) throw new Error("适用共享航班隐藏域ID需要配置");
        this.$hiddenInput1 = $(document.body).find("#" + options.hiddenName1);
        this.$hiddenInput2 = $(document.body).find("#" + options.hiddenName2);
    }

    FlightNum.prototype.init = function(){
       //容器
        this.$container = $("<div class='flightNum-container'>");
        this.$container.css("height",this.opts.showGXHB ? 60 : 40);
        //title
        this.$title = $("<div class='title'>");
        //conent
        this.$content = $("<div class='content'>");

        var randomNum = String(Math.random()).replace(/\D/g,"");

        this.$container.append(createLabel("all").append(createInput("radio","radioContent"+randomNum,"全部适用")));
        this.$container.append(createLabel("sy").append(createInput("radio","radioContent"+randomNum,"适用")));
        this.$container.append(createLabel("bsy").append(createInput("radio","radioContent"+randomNum,"不适用")));

        //设置底部
        this.$footer = $("<div class='footer'>");

        if(this.opts.showGXHB){
            this.$footer.append(createLabel("sygxhb").append(createInput("checkbox","chk","适用共享航班")));
        }

        this.$container.append(this.$title).append(this.$content).append(this.$footer);

        $(document.body).append(this.$container);

        this.bindEvent();
        this.writeValue();
    };

    /**
     * 时间绑定
     */
    FlightNum.prototype.bindEvent = function(){
        var _this = this;
        $(document).on("click.FlightNum",function(ev){
            var target = ev.target;
            if(target !== _this.elem) _this.hide();
        });

        this.$container.find("input").on("click.FlightNum",$.proxy(this.operateHandler,this));
        this.$container.on("click.FlightNum",function(ev){
            ev.stopPropagation();
        });
        this.$elem.on("keyup.FlightNum",$.proxy(this.upperCaseHandler,this));

    };

    /**
     * 操作
     */
    FlightNum.prototype.operateHandler = function(ev){
        var  _this = this;
        var target = ev.target;
        this.$elem.removeClass("placeholder");  //placeholder问题
        if($(target).is("label") || $(target).parent().is("label")){
            var $label = $(target).is("input") ? $(target).parent() : $(target);
            if($label.attr("id") === "all"){ //全部适用
                _this.$elem.val("---");
                _this.$hiddenInput1.val("1");
                _this.$elem.removeClass("bsy").addClass("sy");
            }else if($label.attr("id") === "sy"){ //适用
                _this.$elem.val("");
                _this.$hiddenInput1.val("1");
                _this.$elem.removeClass("bsy").addClass("sy");
            }else if($label.attr("id") === "bsy"){ //不适用
                _this.$elem.val("");
                _this.$hiddenInput1.val(0);
                _this.$elem.removeClass("sy").addClass("bsy");
            }else{ //适用共享航班
                if(_this.opts.showGXHB){
                    var result = $label.find("input").get(0).checked ? 1:0;
                    _this.$hiddenInput2.val(result);
                }
            }
        }
        this.$elem.focus();
        this.opts.cbFn(_this.$elem.val(),_this.$hiddenInput1.val(),_this.$hiddenInput2.val());
    };

    /**
     * 转大写
     */
    FlightNum.prototype.upperCaseHandler = function(){
        this.$elem.val((this.elem.value || "").toUpperCase());
    };

    /**
     * 显示操作
     */
    FlightNum.prototype.show = function(){
        if(this.isShow) return;
        this.setPos();
        this.$container.show();
        this.isShow = true;
    };

    /**
     * 隐藏操作
     */
    FlightNum.prototype.hide = function(){
        if(!this.isShow) return;
        this.$container.hide().css("left","-1000px");
        this.isShow = false;
    };

    /**
     * 设置控件的位置
     */
    FlightNum.prototype.setPos = function(){
        var pointer = this.$elem.offset(),
            iWidth = $(document).outerWidth(),
            iTop = pointer.top + this.$elem.outerHeight(),
        iLeft = pointer.left + this.$container.outerWidth() > iWidth ?  (pointer.left + this.$elem.outerWidth())-this.$container.outerWidth() : pointer.left;
        this.$container.css({"left":iLeft, "top":iTop});
    };

    /**
     * 销毁
     */
    FlightNum.prototype.destroy = function(){
        this.$container.off(".FlightNum");
        $(document).off(".FlightNum");
        this.$container.remove();
    };

    /**
     * 数据回填
     */
    FlightNum.prototype.writeValue = function(){
        var value1,value2,labelId1;
        value1= this.$hiddenInput1.val();
        value2 = this.$hiddenInput2.val();
        if(value1 === "1" && this.$elem.val() === "---"){
            labelId1 = "all";
        }else if(value1 === "1"){
            labelId1 = "sy";
        }else if(value1 === "0"){
            labelId1 = "bsy";
        }
        if(labelId1) this.$container.find("#" + labelId1).find("input").get(0).checked = true;
        if(this.opts.showGXHB){
            this.$container.find("#sygxhb").find("input").get(0).checked = ("1" === value2) ? true:false;
        }
    };





    /**
     * 创建input标签
     * @param type input类型
     * @param name name名称
     * @param value 值
     */
   function createInput(type,name,value){
     return $("<input type='"+type+"' name='"+name+"' value='"+value+"'/>"+value+"</input>");
   }

    /**
     * 创建label
     * @param id
     * @returns {*|jQuery|HTMLElement}
     */
   function createLabel(id){
       return $("<label id='"+id+"'>");
   }


   return FlightNum;


});
