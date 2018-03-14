/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 机场航站楼控件
 * @linc: MIT
 *
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var laytpl = window.layui ? window.layui.laytpl : window.laytpl;

    /**
     * 默认参数
     * @type {{}}
     */
    var defaultOpts = {
        type:1,
        typeValue:{},
        splitStr:",", //默认分隔符
        itemWidth:55,  //选项的宽度
        tabWidth:60, //选项卡的宽度
        rightWidth:100, //tab-header右侧空余的宽度
        mult:false, //支持多选
        title:"支持中文拼音/简拼/三字码的输入",
        hotSimpleData:{ //热门机场显示名称
            "id":"nbbh",
            "name":"hzlqm"
        },
        hzlOpts:{ //航站楼配置参数
            type:2,
            simpleData:{
                id:"nbbh",
                name:"hzlqm"
            },
            qDatas:{
                dldh:""  //查询参数、地理单号
            },
            backContent:"点击返回城市列表",
            typeValue:"../data/hzl.json"
        },
        simpleData:{
            id:"bh",
            name:"name"
        },
        cbFn:function(){} //回调函数
    };

    /**
     * tab选项卡
     * @param elem
     * @param options
     * @constructor
     */
    function JCHZL(elem,options){
        this.id = Common.cid("JCHZL");
        this.elem = elem;
        this.$elem = $(elem);
        this.data = {};
        this.opts = $.extend(true,{},defaultOpts,options);
        this.isShow = false; //标记是否已经显示
        //把初始化的数据存储起来
        this.tempData = {};
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.iNow = 0; //当前选中的
    }

    /**
     * 加载数据
     * @param callback 回调函数
     */
    JCHZL.prototype.load = function(callback){
        if($.type(callback) !== "function") throw new Error("参数配置错误");
        var _this = this;
        if(this.opts.type === 1){
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this,this.data);
        }else{
            $.ajax({
                type:"get",
                url:this.opts.typeValue,
                data:this.opts.qDatas,
                dataType:"json",
                success:function(data){
                    _this.data = data;
                    callback.call(_this,data);
                },
                error:function(msg){
                    Common.error(msg);
                }
            });
        }
    };

    /**
     * 存储数据
     */
    JCHZL.prototype.storeData = function(){
        var data = this.data;
        var id = this.opts.simpleData.id;
        var hotId = this.opts.hotSimpleData.id;
        for(var i = 0 ,len = data.length; i<len;i++){
            for(var j = 0, len2=data[i].groups.length;  j<len2 ; j++){
                var items = data[i].groups[j].items;
                for(var k = 0, len3 = items.length; k<len3;k++){
                    var item = items[k];
                    this.tempData[item[hotId] || item[id]] = item;
                }
            }
        }
    };

    /**
     * 初始化
     */
    JCHZL.prototype.init = function(callback){
        var _this = this;
        this.storeData();

        var data ={
            title:this.opts.title,
            simpleData:this.opts.simpleData,
            hotSimpleData:this.opts.hotSimpleData,
            list:this.data
        };

        Common.loadTpl(window.CTPL.JCHZL,function(state,result){
            if("error" === state) Common.tplError();
            laytpl(result).render(data,function(html){
                _this.$container = $(html);
                $(document.body).append(_this.$container);
                _this.setWidth();
                _this.bindEvent();
                _this.tabClick(_this.$container.find(".tab").eq(_this.iNow).find("a"));
                if(callback) callback.call(_this);
            });
        });

    };

    /**
     * 设置容器的宽度
     */
    JCHZL.prototype.setWidth = function(){
        var $tabs =this.$container.find(".tab-header").find("li");
        $tabs.css("width",this.opts.tabWidth);
        this.$container.width($tabs.length * this.opts.tabWidth + this.opts.rightWidth);
        this.$container.find(".tab-content").find("li").width(this.opts.itemWidth);
    };

    /**
     * 绑定相关事件
     */
    JCHZL.prototype.bindEvent = function(){
        var _this = this;
        this.$container.on("click.JCHZL",".tab",function(ev){
            _this.tabClick($(ev.target));
        });
        this.$container.on("click.JCHZL",".item",$.proxy(this.itemClick,this));
        this.$container.on("click.JCHZL",function(){
            return false;
        });
        this.$container.on("click.JCHZL",".close",$.proxy(this.hide,this));

        $(document).on("click.JCHZL",function(ev){
            if(ev.target !== _this.elem) _this.hide();
        });

        this.$container.on("click.JCHZL",".backBtn",function(){
            _this.$container.find(".tab-content").eq(_this.iNow).addClass("active");
            _this.hzl.hide();
        });

        this.$container.on("click.jCHZL",".hzlItem",function(){
            var data = $(this).data("data");
            _this.setValue(data,true);
            _this.opts.cbFn(data,true);
            _this.hide();
        });
    };

    /**
     * 选项卡卡头点击事件
     * @param $target
     */
    JCHZL.prototype.tabClick = function($target){
        var $tabs =this.$container.find(".tab"),
            $contents = this.$container.find(".tab-content"),
            currIndex = $target.data("index");
        $tabs.find("a").removeClass("active");
        $contents.removeClass("active");
        $tabs.eq(currIndex).find("a").addClass("active");
        $contents.eq(currIndex).addClass("active");
        this.iNow = currIndex;
    };

    /**
     * 具体选项点击事件
     */
    JCHZL.prototype.itemClick = function(ev){
        var target = ev.target,
            $target = $(target),
            id = target.id,
            result = this.tempData[id];
        if(!$target.is("a"))return;

        //点击的热门机场
        if($target.hasClass("hot")){
            this.setValue(result,true);
            this.opts.cbFn(result,true);
            this.hide();
        }else{
            this.tabItemClick(result);
        }

    };

    /**
     * tab选项卡点击事件（beforeItemClick）
     * @param data
     */
    JCHZL.prototype.tabItemClick = function(data){
        var _this = this;
        this.opts.hzlOpts.qDatas = {
            dldh: data.dldh
        };
        this.opts.hzlOpts.cityData = data;
        this.hzl = new Hzl(this.opts.hzlOpts);
        this.hzl.load(function(data){
            this.data = data.result;
            this.render();
            _this.$container.append(this.$container);
            _this.$container.find(".tab-content").eq(_this.iNow).removeClass("active").end().last().addClass("active");
        });
    };


    /**
     * 设置值
     * @param data
     * @param isHot 是否热门
     */
    JCHZL.prototype.setValue = function(data,isHot){
        var id =isHot ? this.opts.hotSimpleData.id : this.opts.simpleData.id;
        var name = isHot ? this.opts.hotSimpleData.name : this.opts.simpleData.name;
        var keys=[],values = [];
        if(this.opts.mult){

            for(var key in data){
                if(data.hasOwnProperty(key)){
                    keys.push(data[key][id]) ;
                    values.push(data[key][name]);
                }
            }
        }else{
            keys.push(data[id]) ;
            values.push(data[name]);
        }
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
    };

    /**
     * 显示
     */
    JCHZL.prototype.show = function(){
        if(!this.isShow){
            this.setPos();
            this.$container.show();
            this.isShow =true;
        }
    };

    /**
     * 隐藏
     */
    JCHZL.prototype.hide = function(){
        if(this.isShow){
            this.$container.hide();
            this.isShow = false;
        }

    };

    /**
     * 设置位置
     */
    JCHZL.prototype.setPos = function(){
        var pointer = this.$elem.offset();
        this.$container.css({"left": pointer.left, "top": pointer.top + this.$elem.outerHeight()});
    };

    /**
     * 销毁
     */
    JCHZL.prototype.destroy = function(){
        this.$container.off(".JCHZL");
        $(document).off(".JCHZL");
        this.$container.remove();
    };



    /**
     * 航站楼构造函数
     * @param data
     * @constructor
     */
    function Hzl(options){
        this.id = Common.cid("HZL");
        this.opts = $.extend(true,{},options);
        this.init();
    }

    Hzl.prototype = {
        init:function(){
            this.$container = $("<div class='vetech-jchzl-container tab-content'>");
        },
        load:function(callback){
            var _this = this;
            $.ajax({
                url:this.opts.typeValue,
                type:"get",
                dataType:"json",
                data:this.opts.qDatas,
                success:function(data){
                    _this.data = data;
                    callback.call(_this,_this.data);
                },
                error:function(msg){
                    Common.error(msg);
                }
            });
        },
        render:function(){
            var data = this.data,
                id = this.opts.simpleData.id,
                name = this.opts.simpleData.name;

            var $div = $('<div class="city-header clearfix"><span>'+this.opts.cityData.dlmc+'</span><span class="backBtn">'+this.opts.backContent+'</span></div>');
            this.$container.append($div);

            var $ul = $('<ul class="clearfix"></ul>');
            for(var i = 0 ,len = data.length;i<len;i++){
                var $li = $('<li class="hzlItem" id="'+data[i][id]+'">'+data[i][name]+'</li>');
                $li.data("data",data[i]);
                $ul.append($li);
            }
            this.$container.append($ul);
        },
        show:function(){
            this.$container.show();
        },
        hide:function(){
            this.$container.remove();
        }
    };


    return JCHZL;

});