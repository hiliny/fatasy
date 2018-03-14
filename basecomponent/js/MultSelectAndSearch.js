/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 多选搜索
 * @linc: MIT
 */
define(function (require, exports, module) {
    var defaultOpts = {
            simpleData: {
                "id": "id",
                "name": "name"
            },
            ajaxOpts: {},
            title1: "已选择的城市",
            title2: "未选择的城市",
            qDatas: {}, //查询参数
            hiddenName: "", //隐藏域id
            splitStr: ","//分隔符
        },
        $ = window.jQuery,
        Common = require("../js/Common");


    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function MultSelectAndSearch(elem,options){
        this.id = Common.cid("MultSelectAndSearch");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true,defaultOpts,options);
        this.checkedData = []; //已经选择的
        this.unCheckedData = []; //未选择的
        this.$hiddenInput = $("#" + this.opts.hiddenName);

        this.init();
    }

    /**
     * 初始化
     */
    MultSelectAndSearch.prototype.init = function(){
        this.$container = $('<div class="multSelectAndSearch">');

        //查询区域
        this.$searchContent = $('<div class="searchContent"><input type="text" class="searchTxt" placeholder="请输入检索"></div>');

        //内容区
        var $content = $('<div class="content">');
        this.$leftConent = $('<div class="leftContent"><p>'+this.opts.title1+'</p><select multiple="multiple"></select></div>');

        this.$centerContent = $('<div class="centerContent"></div>');
        var $add = $('<input type="button" class="add" value="添加"/>'),
            $addAll = $('<input type="button" class="addAll" value="全部添加"/>'),
            $del = $('<input type="button" class="del" value="删除"/>'),
            $delAll = $('<input type="button" class="delAll" value="全部删除"/>');

        this.$centerContent.append($add).append($addAll).append($del).append($delAll);

        this.$rightContent = $('<div class="leftContent"><p>'+this.opts.title2+'</p><select multiple="multiple"></select></div>');

        $content.append(this.$leftConent).append(this.$centerContent).append(this.$rightContent);

        //底部工具条
        this.$toolbarContent = $('<div class="toolbarContent"><input type="button" class="sureBtn" value="确认选择"><input type="button" class="closeBtn" value="关闭窗口"></div>');

        this.$container.append(this.$searchContent).append($content).append(this.$toolbarContent);

        $(document.body).append(this.$container);
        this.bindEvent();
    };

    /**
     *加载数据
     * @param callback
     */
    MultSelectAndSearch.prototype.load = function(callback){
        var _this = this;
        if(this.opts.type === 1){
            var data = $.extend(true,{},this.opts.typeValue);
            this.checkedData = data.checked || [];
            this.unCheckedData = data.unChecked || [];
            callback.call(_this,data);
            this.opts.typeValue = null;
        }else{
            $.ajax($.extend(true,{
                type:"get",
                url:this.opts.typeValue,
                data:this.opts.qDatas,
                success:function(data){
                    _this.data = data || [];
                    callback.call(_this,data);
                }
            },this.opts.ajaxOpts));

        }
    };

    /**
     * 数据回填
     */
    MultSelectAndSearch.prototype.writeValue = function(){
        this.checkedData = [];
        this.unCheckedData = [];
        var checkedIds = (this.$hiddenInput && this.$hiddenInput.val()) || "";
        if(!checkedIds){
            this.checkedData  =[];
            this.unCheckedData= $.extend(true,[],this.data);
        }else{
            var ids = checkedIds.split(this.opts.splitStr),
                id = this.opts.simpleData.id,
                item;
            for(var i = 0, len = this.data.length;i<len;i++){
                item = this.data[i];
                if($.inArray(item[id],ids) >-1){
                    this.checkedData.push(item);
                }else{
                    this.unCheckedData.push(item);
                }
            }
        }
        this.data = [];
    };

    /**
     * 渲染
     */
    MultSelectAndSearch.prototype.render = function(){
        this.$searchContent.find(".searchTxt").val("");
        this.rendered(this.$leftConent.find("select").empty(),this.checkedData);
        this.rendered(this.$rightContent.find("select").empty(),this.unCheckedData);
    };

    /**
     * 渲染已经选择的
     */
    MultSelectAndSearch.prototype.rendered = function($select,data){
        var id = this.opts.simpleData.id,
            name = this.opts.simpleData.name,
            $option,
            renderFn = this.opts.fn1,
            isCustom = $.type(renderFn) === "function",
            item;

        for(var i=0,len = data.length; i<len;i++){
            item = data[i];
            $option = isCustom ? renderFn(item) : $('<option  title="'+item[name]+'" value="'+item[id]+'">'+item[name]+'</option>');
            $select.append($option);
        }
    };


    /**
     * 绑定事件
     */
    MultSelectAndSearch.prototype.bindEvent = function(){
        var _this = this;

        this.$leftConent.on("dblclick.MultSelectAndSearch","option",function (ev) {
            _this.revertData("checkedData",[$(ev.target).val()]);
            _this.render();
        });
        this.$rightContent.on("dblclick.MultSelectAndSearch","option",function(ev){
            _this.revertData("unCheckedData",[$(ev.target).val()]);
            _this.render();
        });

        this.$centerContent.on("click.MultSelectAndSearch",".add",function(){
            var  values = _this.$rightContent.find("select").val();
            _this.revertData("unCheckedData",values);
            _this.render();

        }).on("click.MultSelectAndSearch",".addAll",function(){
            _this.checkedData  = _this.checkedData.concat(_this.unCheckedData);
            _this.unCheckedData = [];
            _this.render();
        }).on("click.MultSelectAndSearch",".del",function(){
            var values = _this.$leftConent.find("select").val();
            _this.revertData("checkedData",values);
            _this.render();
        }).on("click.MultSelectAndSearch",".delAll",function(){
            _this.unCheckedData  = _this.unCheckedData.concat(_this.checkedData);
            _this.checkedData = [];
            _this.render();
        });

        $(document).on("click.MultSelectAndSearch",function(ev){
            if(ev.target !== _this.elem) _this.hide();
        });

        this.$container.on("click",function(){
            return false;
        });

        this.$searchContent.on("keyup.MultSelectAndSearch",".searchTxt",$.proxy(this.filterHandler,this));

        this.$toolbarContent.on("click.MultSelectAndSearch",".sureBtn",$.proxy(this.sureHandler,this));
        this.$toolbarContent.on("click.MultSelectAndSearch",".closeBtn",$.proxy(this.closeHandler,this));

    };

    /**
     *
     */
    MultSelectAndSearch.prototype.revertData = function(dataKey,values){
        var newArr = [],
            tempArr = [],
            id = this.opts.simpleData.id,
            item;
        for (var i = 0, len = this[dataKey].length; i < len; i++) {
            item = this[dataKey][i];
            if ($.inArray(item[id],values) > -1) {
                tempArr.push(item);
            } else {
                newArr.push(item);
            }
        }
        this[dataKey] = newArr;
        var reverKey = dataKey === "checkedData" ? "unCheckedData" : "checkedData";
        this[reverKey] = this[reverKey].concat(tempArr);

    };
    /**
     * 显示
     */
    MultSelectAndSearch.prototype.show = function(){
        this.setPos();
        this.$container.show();
    };

    MultSelectAndSearch.prototype.setPos = function(){
        var pointer = this.$elem.offset();
        this.$container.css({
            left:pointer.left,
            top:pointer.top + this.$elem.outerHeight()+2
        });
    };

    /**
     * 隐藏
     */
    MultSelectAndSearch.prototype.hide = function(){
        this.$container.hide();
    };

    /**
     * 销毁
     */
    MultSelectAndSearch.prototype.destroy = function(){
        this.$container.off(".MultSelectAndSearch");
        this.$container.remove();
    };

    /**
     * 确认操作
     */
    MultSelectAndSearch.prototype.sureHandler = function(){
        var id = this.opts.simpleData.id,
            name = this.opts.simpleData.name,
            item,
            items = [],
            ids = [],
            names = [];
        for(var i =0,len = this.checkedData.length;i<len;i++){
            item = this.checkedData[i];
            ids.push(item[id]);
            names.push(item[name]);
            items.push(item);
        }
        this.$elem.val(names.join(this.opts.splitStr));
        this.$hiddenInput.val(ids.join(this.opts.splitStr));

        this.hide();
        this.opts.cbFn(items);
    };

    /**
     * 关闭操作
     */
    MultSelectAndSearch.prototype.closeHandler = function(){
        this.hide();
    };

    /**
     * 过滤数据
     */
    MultSelectAndSearch.prototype.filterHandler = function(){
        var value = this.$searchContent.find(".searchTxt").val(),
            hasFilterFn = $.type(this.opts.filterFn) === "function",
            filterFn = this.opts.filterFn,
            id = this.opts.simpleData.id,
            name = this.opts.simpleData.name,
            newArr = [],
            item;
        for(var i =0, len = this.unCheckedData.length;i<len;i++){
            item = this.unCheckedData[i];
            if(!hasFilterFn){
                if(item[id].indexOf(value) > -1 || item[name].indexOf(value) >-1){
                    newArr.push(item);
                }
            }else{
                if(filterFn(item,value)){
                    newArr.push(item);
                }
            }
        }

        this.rendered(this.$rightContent.find("select").empty(),newArr);

    };

    return MultSelectAndSearch;

});
