/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define(function(require,exports,module){
    var Common = require("../js/Common");
    /**
     * 共公属性
     */
    var defaultOpts = {
        width:600, //宽度
        height:200, //最小高度
        itemWidth:80, //数据项的宽度
        splitStr:",", //分隔符
        classW:80, // 左侧类型的宽度
        type:3, //数据加载方式，
        ajaxType:"get",
        typeValue: null, //如果数据加载传递的值：jsonName/url
        hiddenName:null, //隐藏域name
        fn1:null, //fn1 自定义渲染热门线路主题数据值
        fn2:null, //fn2 自定义分类
        fn3:null, //fn3自定义渲染数据值
        model:"single" //模式分为两种，当model是single时，是单独的弹出路线主题层，当model是group时，表示是组合一起使用的。
    };

    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function RouteTheme(elem, options,cbFn) {
        this.id = Common.cid("RouteTheme");
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.elem = elem;
        this.$elem = $(elem);
        this.cbFn = cbFn ||  function(){};
        this.$hotThemes = [];  //热门主题
        this.$allThemes = []; //所有主题(排除相同的)
        this.$sameThemes = []; //存储和热门主题相同的数据
        this.model = this.opts.model; //使用模式
        this.isOpen = false; //标示是否打开更多
        this.checked ={"keys":[],"values":[]}; //选择的
        //隐藏域
        if(this.opts.hiddenName){
			this.$hiddenInput = $("#" + this.opts.hiddenName);
			this.checked.keys = (this.$hiddenInput.val() || "").split(this.opts.splitStr);
		}
		if($.type(this.opts.fn1) !== "function"){
            this.opts.fn1 = null;
        }
		if($.type(this.opts.fn2) !== "function"){
            this.opts.fn2 = null;
        }
		if($.type(this.opts.fn3) !== "function"){
            this.opts.fn3 = null;
        }

        this.init();
    }

    /**
     * 初始化加载
     */
    RouteTheme.prototype.init = function() {
        if(this.model === "group"){
            this.$hotElement = $('<div class="vetech-route-theme clearfix"></div>');
            this.$hotContainer = $('<ul></ul>');
            this.$hotElement.append(this.$hotContainer);
        }
        this.$layer = $('<div class="vetech-route-theme vrt-layer">');
        this.$layer.css({"width":this.opts.width,"min-height":this.opts.height});
        $(document).find("body").append(this.$layer);
    };


    /**
     * 加载数据
     * @param callback
     */
    RouteTheme.prototype.load = function(callback) {
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax({
                type: this.opts.ajaxType,
                url: this.opts.typeValue,
                dataType: "json",
                data: this.opts.qDatas,
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                },
                error: function(msg) {
                    throw new Error("数据加载错误" + msg);
                }
            });
        }
    };


    /**
     * 设置位置
     */
    RouteTheme.prototype.setPos=function(){
        var pointer = this.$elem.offset(),
            iWidth = $(document).outerWidth(),
            iTop = pointer.top + this.$elem.outerHeight(),
        iLeft = pointer.left + this.$layer.outerWidth() > iWidth ?  (pointer.left + this.$elem.outerWidth())-this.$layer.outerWidth() : pointer.left;
        this.$layer.css({"left":iLeft, "top":iTop});
    };

    /**
     * 渲染
     */
    RouteTheme.prototype.render = function() {
        var checkedLis = [];
        //要选中的li
        if (this.model === "group") {
            var hotData = this.data.hotTheme;
            var templateFn = this.opts.fn1;
            for (var i = 0, len = hotData.length; i < len; i++) {
                var item = hotData[i];
                //利用模板函数自定义渲染
                var showText = templateFn ? templateFn(item) : item.mc;
                var $li = $('<li><label title="' + item.mc + '"><input type="checkbox"/>' + showText + "</label></li>");
                $li.data = item;
                this.$hotThemes.push($li);
                this.$hotContainer.append($li);
                if ($.inArray(item.id, this.checked.keys) !== -1) checkedLis.push($li);
            }
            this.$more = $('<li class="more"><a href="javascript:void(0);">更多</a></li>');
            this.$hotContainer.append(this.$more);
            this.$elem.append(this.$hotElement);
        }
        var allData = this.data;
        var tempWidth = this.opts.width - this.opts.classW;
        //10 为dd的margin-left值,另外10px为dl的margin值
        var templateFn2 = this.opts.fn2;
        var templateFn3 = this.opts.fn3;
        for (var k = 0, len2 = allData.length; k < len2; k++) {
            var item1 = allData[k];
            var $dl = $('<dl class="vetech-clearfix"></dl>');
            var showText1 = templateFn2 ? templateFn2(item1) : item1.mc;
            var $dt = $('<dt class="vetech-inline" style="width:' + this.opts.classW + 'px;">' + showText1 + "</dt>");
            var $dd = $('<dd class="vetech-inline" style="width:' + tempWidth + 'px;"></dd>');
            $dl.append($dt).append($dd);
            var $ul = $("<ul></ul>");
            for (var j = 0, len3 = item1.childs.length; j < len3; j++) {
                var item2 = item1.childs[j];
                var showText2 = templateFn3 ? templateFn3(item2) : item2.mc;
                var $li2 = $('<li><label title="' + item2.mc + '"><input type="checkbox"/>' + showText2 + "</label></li>");
                $li2.css("width", this.opts.itemWidth);
                $li2.data = item2;
                if (this.isInHotThemes(item2)) {
                    this.$sameThemes.push($li2);
                } else {
                    this.$allThemes.push($li2);
                }
                if ($.inArray(item2.bh, this.checked.keys) !== -1) checkedLis.push($li2);
                $ul.append($li2);
            }
            $dd.append($ul);
            this.$layer.append($dl);
        }
        this.bindEvent();
        this.writeValue(checkedLis);
    };

    /**
     * 数据回填
     */
    RouteTheme.prototype.writeValue= function(checkedLis) {
        var names = [];
        for(var i = 0,len = checkedLis.length;i<len;i++){
            var $li = checkedLis[i];
            names.push($li.data.mc);
            setCheckboxState($li.find("input[type='checkbox']").get(0),true);
        }

        if(this.model === "single"){
            this.$elem.val(names.join(this.opts.splitStr));
        }
    };

    /**
     * 选择以后设置值
     */
    RouteTheme.prototype.setValue=function(){
        var result = [];
        var mySelf = this;
        this.checked ={"keys":[],"values":[]}; //选择的
        //获取被选中的热门线路主题
        for(var i = 0 ,len= this.$hotThemes.length; i < len;i++){
            var $li = this.$hotThemes[i];
            getValue($li);
        }
        //获取弹出层被选中的线路主题，排除相同的
        for(var j = 0 ,len2 = this.$allThemes.length;j <len2;j++){
            var $li2 = this.$allThemes[j];
            getValue($li2);
        }

        function getValue($li){
            if($li.find("input[type='checkbox']").get(0).checked){
                result.push($li.data);
                mySelf.checked.keys.push($li.data.bh);
                mySelf.checked.values.push($li.data.mc);
            }
        }
        this.$elem.val(mySelf.checked.values.join(this.opts.splitStr));
        this.$hiddenInput.val(mySelf.checked.keys.join(this.opts.splitStr));
        //执行回调
        this.cbFn(result);
    };

    /**
     * 检索数据项是否在热门主题中
     */
    RouteTheme.prototype.isInHotThemes=function(item){
        var tempItem = null;
        for(var i = 0 , len = this.$hotThemes.length; i<len;i++){
            tempItem = this.$hotThemes[i].data;
            if (item.bh === tempItem.bh && $.trim(item.mc) === $.trim(tempItem.mc)) {
                return true;
            }
        }
        return false;
    };


    /**
     * 显示
     */
    RouteTheme.prototype.show=function(){
        this.setPos();
        this.$layer.css("visibility","visible");
        if(this.$more){
            this.$more.find("a").text("关闭");
            this.isOpen = true;
        }
    };

    /**
     * 隐藏
     */
        RouteTheme.prototype.hide=function(){
        this.$layer.css("visibility","hidden");
        if(this.$more){
            this.$more.find("a").text("更多");
            this.isOpen = false;
        }
    };

    /**
     * 绑定事件
     */
    RouteTheme.prototype.bindEvent = function () {
        var self = this;
        if (this.model === "group") {
            //更多点击事件
            this.$more.on("click", function () {
                if (!self.isOpen) {
                    self.show();
                } else {
                    self.hide();
                }
            });
        } else {
            this.$elem.on("click", $.proxy(self.show, self));
            //如果不是用的组合模式，那么需要给document添加点击事件用来隐藏弹出层
            $(document).on("mousedown", function (ev) {
                var target = ev.target;
                if (self.elem !== target) self.hide();
            });
            this.$layer.on("mousedown", function () {
                return false;
            });
        }
        for (var i = 0, len = this.$hotThemes.length; i < len; i++) {
            change1(this.$hotThemes[i]);
        }

        function change1($li) {
            $li.find("input[type='checkbox']").on("change", function (ev) {
                self.mutexOperate($li, self.$sameThemes);
                ev.stopPropagation();
            });
        }

        //其他的数据项目绑定值
        for (var j = 0, len2 = this.$allThemes.length; j < len2; j++) {
            change2(this.$allThemes[j]);
        }

        function change2($li) {
            $li.find("input[type='checkbox']").on("change", function (ev) {
                self.setValue();
                return false;
            });
        }

        for (var k = 0, len3 = this.$sameThemes.length; k < len3; k++) {
            change3(this.$sameThemes[i]);
        }

        function change3($li) {
            $li.find("input[type='checkbox']").on("change", function (ev) {
                self.mutexOperate($li, self.$hotThemes);
                return false;
            });
        }

    };

    /**
     * 互斥操作
     * @param {Object} item 被选中的数据项
     * @param {Object} $searchThemes 检索的数据项
     */
    RouteTheme.prototype.mutexOperate=function($li,$searchThemes){
        for(var i = 0 , len = $searchThemes.length; i < len;i++){
            var tempItem = $searchThemes[i].data;
            if ($li.data.bh === tempItem.bh) {
                if($li.find("input[type='checkbox']").get(0).checked){
                    setCheckboxState($searchThemes[i].find("input[type='checkbox']").get(0),true);
                    this.setValue();
                }else{
                    setCheckboxState($searchThemes[i].find("input[type='checkbox']").get(0),false);
                    this.setValue();
                }
                break;
            }
        }
    };


    /**
     * 设置checkbox的选中状态
     * @param {Object} box
     * @param {Object} state
     */
    function setCheckboxState(box,state){
        if(box && box.type === "checkbox"){
            box.checked = state;
        }
    }
    return RouteTheme;
});