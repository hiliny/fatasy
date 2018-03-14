/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 舱位控件
 * @linc: MIT
 */
define(function (require, exports, module) {


    var defaultOpts = {
            width:400, //自定义宽度
            height:null, //自定义高度
            hiddenName:null, //隐藏域name
            content:"", //显示的内容
            autoClose: false ,//是否自动关闭
            defer:2000, //延迟多少秒
            allCheck:"---", //如果配置allCheck = "---",则在全选的时候，赋值为allCheck配置的值
            fn1:null, //自定义渲染title
            splitStr:"/", //分隔符
            fn2:null, //自定义渲染数据项
            ajaxOpts:{
              type:"get"
            },
            simpleData:{
              id:"id",
              name:"name"
            },
            qDatas:{},
            pos:[] //位置
        },
        Common = require("../js/Common.js");


    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function Cabin(elem,options){
        this.id  = Common.cid("vetech-cabin");
        this.elem = elem;
        this.$elem = $(elem);

        this.opts = $.extend(true,{},defaultOpts,options);
        this.isShow = false;
        this.checkedData = {}; //选中的数据
        this.dataItems = [];

        this.$hiddenInput =$("#"+this.opts.hiddenName);
        this.data = []; //存储加载的数据
        this.dataBuffer = []; //数据缓存
        this.init();

    }

    /**
     * 全部选中
     * @param {Object} ev
     */
    Cabin.prototype.checkedAll = function(ev){
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
     * 初始化
     */
    Cabin.prototype.init = function(){
        this.$container = $('<div class="vetech-cabin"></div>');
        this.$container.css("width",this.opts.width);
        $(document.body).append(this.$container);
    };
    /**
     * 加载数据
     * @param callback 回调函数
     */
    Cabin.prototype.load = function(callback){
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
    Cabin.prototype.render = function(){
        this.dataBuffer = []; //再次渲染的时候，需要清除缓存的数据，然后再重新加入
        //判断一下数据格式是否正确

        if($.type(this.data) !== "array") throw new TypeError("数据格式错误，需要[object Array]格式");
        this.$container.html("");
        var dtWidth = 80;
        var ddWidth = this.opts.width - dtWidth-2;
        var name = this.opts.simpleData.name;
        for(var i = 0 ,len = this.data.length; i<len;i++){
            var item = this.data[i];
            var $dl = $('<dl class="clearfix"></dl>');
            var $dt = $('<dt><label class="title">'+(this.opts.fn1 ? this.opts.fn1(item) : item.name)+'</label></dt>');
            $dt.css("width",dtWidth);
            var $dd = $('<dd></dd>');
            $dd.css("width",ddWidth);
            var $ul = $('<ul class="clearfix"></ul>');
            $dd.append($ul);
            $dl.append($dt).append($dd);

            for(var j= 0 , len2 = item.childs.length; j< len2; j++){
                var item2 =item.childs[j], clsName="";
                clsName = "1" === item2.isPublish ? "publish-seat":"no-publish-seat";
                var $li = $('<li><label class="item '+clsName+'">'+(this.opts.fn2 ? this.opts.fn2(item2) : item2[name])+'</label></li>');
                $li.data("data",item2);
                $ul.append($li);
            }
            this.$container.append($dl);
        }
        if(this.data.length){
            this.addToolbar();
        }

    };
    /**
     * 添加底部工具栏
     */
    Cabin.prototype.addToolbar = function(){
        var dtWidth = 80;
        var ddWidth = this.opts.width - dtWidth-2;
        this.$toolbar = $('<dl class="clearfix toolbar"></dl>');
        this.$toolbar.append('<dt style="width:'+dtWidth+'"><label class="checked-all-btn">全选</label></dt>');
        this.$tips = $('<dd style="width:'+ddWidth+'"><ul class="clearfix"><li>图例：</li><li><div class="tips">公布运价</div></li><li><div class="tips bgRed">非公布运价</div></li></ul></dd>');
        this.$toolbar.append(this.$tips);
        this.$container.append(this.$toolbar);

        //所有数据渲染完毕，再来绑定事件
        this.bindEvent();
        //数据回填
        this.writeValue();

    };
    /**
     * 显示
     */
    Cabin.prototype.show = function(){
        if(this.elem.readOnly) return; //如果是readonly，则不显示
        if(this.isShow) return;
        this.setPos();
        this.isShow = true;
        this.$container.css("visibility","visible");
    };
    /**
     * 隐藏
     */
    Cabin.prototype.hide = function(){
        if(!this.isShow) return;
        this.$container.css({"visibility":"hidden","left":-1000,"top":-1000});
        this.isShow = false;
    };
    /**
     * 设置位置
     */
    Cabin.prototype.setPos = function(){
        var pointer = this.$elem.offset(),
            iWidth = $(document).outerWidth(),
            iTop = pointer.top + this.$elem.outerHeight(),
            iLeft = pointer.left + this.$container.outerWidth() > iWidth ?  (pointer.left + this.$elem.outerWidth())-this.$container.outerWidth() : pointer.left;
        this.$container.css({"left":iLeft, "top":iTop});
    };



    /**
     * 数据回填
     */
    Cabin.prototype.writeValue = function(){
        this.$container.find(".item").removeClass("active");
        var keys = this.$hiddenInput.length ? this.$hiddenInput.val() : this.$elem.val();
        if(keys === this.opts.allCheck){
            this.$container.find(".checked-all-btn").addClass("active");
            this.$container.find("label").addClass("active");
            this.setValue();
        }else {
            keys = keys.split(this.opts.splitStr);
            this.$container.find(".item").each(function(i,item){
                if($.inArray($(item).parent().data("data").id,keys) >-1) $(item).addClass("active");
            });
        }
        this.setValue();
    };
    /**
     * 手动输入时，回填数据
     */
    Cabin.prototype.writeValueByInput = function(value){
        value = (value || "").toUpperCase();
        var splitStr = this.opts.splitStr;
        if(this.opts.allCheck && value === this.opts.allCheck){
           this.$hiddenInput.val(this.opts.allCheck);
        }else{
            var lastStr = value.substring(value.length-1); //输入框中最后一个值
            if(lastStr === splitStr || lastStr === "-") return; //如果最后一个值为分隔符或者是-，则表示没有输入完，不进行舱位回填
            var strArr = value.split(splitStr);
            var resultArr = []; //存储最终核算后的舱位数据
            for(var i = 0 , len = strArr.length;i < len;i++){
                if(strArr[i].indexOf("-") === -1) resultArr.push(strArr[i]);
                else resultArr = resultArr.concat(this._getCarbinByValues(strArr[i]));
            }
            if(this.$hiddenInput.length) this.$hiddenInput.val(resultArr.join(splitStr));
            else this.$elem.val(resultArr.join(this.opts.splitStr));
        }
        this.writeValue();
    };
    /**
     * 根据A-F类型的value获取舱位
     * @param {Object} value
     */
    Cabin.prototype._getCarbinByValues = function(value){
        var startIndex = this._getIndexByValue(value.split("-")[0]);
        var endIndex = this._getIndexByValue(value.split("-")[1]);
        var $items = this.$container.find(".item");
        if(startIndex === -1 || endIndex === -1) return;
        var resultArr = [];
        if(startIndex >= endIndex){
            resultArr.push($items.eq(startIndex).data("data").id);
        }else{
            for(var i = startIndex ; i<= endIndex ; i++){
                resultArr.push($items.eq(i).parent().data("data").id);
            }
        }
        return resultArr;
    };
    /**
     * 根据值获取值所在的下标
     * @param {Object} value
     */
    Cabin.prototype._getIndexByValue = function (value){
        var $items = this.$container.find(".item");
        for(var i = 0,len = $items.length;i<len;i++){
            var id  = $items.eq(i).parent().data("data").id;
            if( id=== value){
                return i;
            }
        }
        return -1;
    };

    /**
     * 往input中输入值
     */
    Cabin.prototype.setValue = function(){
        if(this.opts.allCheck && this.$container.find(".checked-all-btn").hasClass("active")){ //如果配置了自定义全选，则在全选时，采用---来标示
            this.$hiddenInput.val(this.opts.allCheck);
            this.$elem.val(this.opts.allCheck);
            this.opts.cbFn(this.opts.allCheck);
        }else{ //如果配置了隐藏域，隐藏域中的值用分隔符隔开，input中的值还要进行二次修正（即相同的要用-来表示，A-F）
            var $items = this.$container.find(".item"),
                tempArr = [],
                keys  =[],
                idKey = this.opts.simpleData.id,
                checkedArr = [];//临时数组
            for(var i = 0, len = $items.length;i<len;i++){
                var $item = $items.eq(i),
                    id = $item.parent().data("data")[idKey];
                if($item.hasClass("active")){
                    tempArr.push(id);
                    keys.push(id);
                }else{
                    if(tempArr.length >2){
                        checkedArr.push(tempArr[0] + "-" + tempArr[tempArr.length-1]);
                    }else{
                        checkedArr = checkedArr.concat(tempArr);
                    }
                    tempArr.length = 0;
                }
            }
            if(tempArr.length){
                if(tempArr.length >2){
                    checkedArr.push(tempArr[0] + "-" + tempArr[tempArr.length-1]);
                }else{
                    checkedArr = checkedArr.concat(tempArr);
                }
            }
            var splitStr = this.opts.splitStr;
            this.$hiddenInput.val(keys.join(splitStr));
            this.$elem.val(this.$hiddenInput.length ? checkedArr.join(splitStr) : keys.join(splitStr));
            this.opts.cbFn(keys);
        }
    };


    /**
     * 绑定事件
     */
    Cabin.prototype.bindEvent = function(){
        if(this.isBindedEvent) return;
        this.isBindedEvent = true;

        var _this = this;
        //全选事件
        this.$container.on("click.cabin",".checked-all-btn",$.proxy(this.checkedAll,this));
        //舱位分类点击事件
        this.$container.on("click.cabin",".title",function(){
            var $target = $(this),
                $labels = $target.parents("dl").find("label");
            if($target.hasClass("active")){
                $target.removeClass("active");
                $labels.removeClass("active");
            }else{
                $target.addClass("active");
                $labels.addClass("active");
            }
            _this.setAllCheckboxState();
            _this.setValue();
        });
        //舱位点击事件
        this.$container.on("click.cabin",".item",function(){
            var $target = $(this),
                $dd = $target.parents("dd");
            if($target.hasClass("active")){
                $target.removeClass("active");
            }else{
                $target.addClass("active");
            }
            var $title = $target.parents("dl").find("label.title");
            if($dd.find("label").length === $dd.find("label.active").length){
                $title.addClass("active");
            }else{
                $title.removeClass("active");
            }
            _this.setAllCheckboxState();
            _this.setValue();
        });


        $(document).on("click.cabin",function(ev){
            var target = ev.target;
            if(target !== _this.elem) _this.hide();
        });

        $(document).on("keyup.cabin",function(ev){
            if(ev.keyCode ===9  && !_this.$elem.is(":focus")) _this.hide();
            return false;
        });

        this.$container.on("click.cabin",function(){
            return false;
        });

        this.$elem.on("keyup.cabin",function(){
            _this.writeValueByInput($(this).val());
        });

    };

    /**
     * 设置全选的box状态
     */
    Cabin.prototype.setAllCheckboxState = function(){
        var $allCheckbox = this.$container.find(".checked-all-btn"),
            $titles = this.$container.find(".title");
        if($titles.length === this.$container.find(".title.active").length){
            $allCheckbox.addClass("active");
        }else{
            $allCheckbox.removeClass("active");
        }
    };

    Cabin.prototype.destroy = function(){
        this.$container.remove();
        $(document).off(".cabin");
    };

    return Cabin;

});
