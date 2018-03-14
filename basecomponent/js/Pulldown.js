/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:下拉、多选下拉、模糊搜索
 * @linc: MIT
 *
 */
define(function(require,exports){
    var defaultOpts = {
            width: 200, //自定义宽度,默认宽度200
            height: 200, //该属性只会在没有分页的时候有效
            simpleData: { //个性化配置参数
                id: "id",
                name: "name",
                count: "size", //
                start: "current",  //
                totalNum: "totalNum", //总数
                data: "data" //返回的数据list
            },
			ajaxOpts:{  //配置ajax相关信息
				type:"get"
			},
			formatPostData:function(data){return data;}, //格式化发送请求的数据
            qDatas: {},//查询参数
            filterFn: function (item) { //过滤函数
                return 0;
            },
            cbFn: function () {
            },
            title: "可输入拼音、汉字、三字码", //提示信息
            type: 1, //数据加载方式，默认为3
            typeValue: null, //如果数据加载传递的值：jsonName/url
            hiddenName: null, //隐藏域name
            dataType: "static", //取值static和dynamic,如果是dynamic，则翻页时，就是实时查询
            qUrl: "", //当dataype是dynamic时，qUrl必须要配置
            pageSize: 10, //每页显示多少条
			inputExecCallback:false, //输入自动执行回调函数
            hiddenFilter: true,//静态数据的时候是否根据隐藏域中的值去过滤数据，默认为false会过滤。。设置true不会
            autoSetValue: true,
            "_openFilter_": true, //默认开启检索功能
            "_hasPage_": true, //是否有分页，默认是有的，配置为false，就直接显示数据,直接显示数据就不存在检索的情况
            defer: 0, //0毫秒以后执行查询，可以配置
            autoExecCallback: false, //自动执行回调
            filterData: [], //需要过滤的数据

            fn1: null //自定义渲染
        },
        Common = require("../js/Common.js");
	
	/**
	 * 构造函数
	 * @param {Object} elem
	 * @param {Object} options
	 */
	function Pulldown(elem,options){
		this.id = Common.cid("Pulldown");
		this.elem = elem;
		this.$elem = $(elem);
		this.$elem.attr("autocomplete","off");
		
		this.opts = $.extend(true, {},defaultOpts,options);
		this.$hiddenInput = $(document.body).find("#" + this.opts.hiddenName);
		this.data = []; //存储加载的数据
		this.currentPage =1;

		this.totalNum = 0; //总共有多少条数据
		this.iNow = 0; //默认哪个选中
		this.timer = null; //定时器
		this.ajax = null; //发送ajax的对象
		this.isBindedEvent =false; //标记是否已经绑定过事件
		this.triggerType = "key"; //查询触发的方式，默认是key，还可以取值为page，即分页
		
		this.init();
	}
	
	/**
	 * 初始化方法
	 */
	Pulldown.prototype.init = function(){
		this.$elem.addClass("ve-arrow-down");
		this.$container = $('<div class="vetech-pulldown-container"></div>');
		this.$container.css({"visibility":"hidden","width":this.opts.width});
		this.$title = $('<div class="title">'+this.opts.title+'</div>');
		this.$content = $('<div class="content"></div>');

		//如果没有分页，又设置了高度，设置高度即可
		if(!this.opts._hasPage_ && this.opts.height){
			this.$container.css({"max-height":this.opts.height,"overflow":"auto"});
		} 

		this.$container.append(this.$title).append(this.$content);

		$(document.body).append(this.$container);

	};
	
	/**
	 * 加载数据
	 */
	Pulldown.prototype.load = function(callback){
		if(this.opts.dataType === "dynamic"){
			this.loadDynamicData(callback);
		}else{
			this.formartData(this.opts.typeValue,callback);
		}
	};
	
	/**
	 * 实时加载数据
	 * @param {Object} callback 回调函数
	 */
	Pulldown.prototype.loadDynamicData = function(callback){
		var qStr =$.trim(this.$elem.val()), //查询参数
			id = this.$hiddenInput.val() || "",
			_this = this,
			simpleData = this.opts.simpleData;
		
		var lastValue = this.$elem.data("lastValue");
		if(lastValue === qStr && this.triggerType === "key"){
			callback.call(this,this.data);
			return;
		}
		this.$elem.data("lastValue",qStr);

		
		this.ajax && this.ajax.abort();

		//查询参数
		var tempData = {
			data:qStr,
			id:id
		};
		tempData[simpleData.count] = this.opts.pageSize;
		tempData[simpleData.start] = this.currentPage;

		this.ajax = $.ajax($.extend(true,{
            type:"get",
            url:this.opts.typeValue,
            dataType:"json",
            data: this.opts.formatPostData($.extend(true,{},tempData,this.opts.qDatas)),
            success:function(data){
                if(data.status === "200") {
                    _this.data = data.result.records || data.result;
                    _this.totalNum = data.result.total;
                }else{
                    Common.error(data.message);
                }
                callback.call(_this,_this.data);
            }
        },this.opts.ajaxOpts));
	};

	/**
	 * 格式化数据
	 * @param {Object} data 数据
	 * @param {Object} callback 回调函数
	 */
	Pulldown.prototype.formartData = function(data,callback){
        var filterData = this.opts.filterData;
        //如果是静态数据，又配置了有filterData，那么可以在静态数据中过滤掉filterData中 的数据
        if ($.type(filterData) === "array" && filterData.length) {
            var newData = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];
                if ($.inArray(item[this.opts.simpleData.id], filterData) === -1) {
                    newData.push(item);
                }
            }
            this.data = newData;
            newData = null;
        }
        this.loadStaticData();
        if ($.type(callback) === "function") {
            callback.call(this, this.data);
        }

	};
	
	/**
	 * 数据回填
	 */
	Pulldown.prototype.writeValue = function(){
		if(!this.$hiddenInput.val()) return;

		var tempData = null;
		for(var i = 0, len = this.data.length;i<len;i++ ){
			if(this.$hiddenInput.val() === this.data[i][this.opts.simpleData.id]){
				tempData = this.data[i];
				break;
			}
		}
		if(!tempData) return;
		this.$elem.val(tempData[this.opts.simpleData.name]);
		this.opts.autoExecCallback && this.opts.opts.cbFn(tempData);
	};
	
	/**
	 * 渲染
	 */
	Pulldown.prototype.render = function(){
		this.iNow = 0;
		var $ul = $("<ul></ul>");
		var simpleData = this.opts.simpleData;
		for(var i = 0 , len = this.data.length;i< len;i++){
			var item = this.data[i];
			var showTxt = this.opts.fn1 ? this.opts.fn1(item) : "<span title='"+item[simpleData.name]+"'>"+item[simpleData.name]+"</span><span class='right' title='"+item.py+"'>"+item.py+"</span>";
			var $li = $('<li class="'+(i === 0 ? "active":"")+'">'+showTxt+'</li>');
			$ul.append($li);
			$li.data("index",i);
			//把数据存储
			$li.data("data",item);
		}
		this.$content.html("").append($ul);
		
		if(this.opts._hasPage_ && !this.isBindedEvent){
			this.$toolbar = $('<div class="toolbar"></div>');
			this.$prevBtn = $('<a class="prev" href="javascript:void(0)">上一页</a>');
			this.$nextBtn = $('<a class="next" href="javascript:void(0)">下一页</a>');
			this.$toolbar.empty().append(this.$prevBtn).append(this.$nextBtn);
			this.$container.append(this.$toolbar);
		}
		if(this.opts._hasPage_) this.listenBtnState();

		if(!this.isBindedEvent) this.bindEvent();
	};
	
	/**
	 * 监听分页按钮状态
	 */
	Pulldown.prototype.listenBtnState = function(){
		if(this.currentPage <=1){
			this.$prevBtn.isDisabled = true;
			this.$prevBtn.addClass("disable");
		}else{
			this.$prevBtn.isDisabled = false;
			this.$prevBtn.removeClass("disable");
		}
		var lastPage = Math.ceil(this.totalNum / this.opts.pageSize);
		if(this.currentPage >= lastPage){
			this.$nextBtn.isDisabled = true;
			this.$nextBtn.addClass("disable");
		}else{
			this.$nextBtn.isDisabled = false;
			this.$nextBtn.removeClass("disable");
		}
	};
	
	/**
	 * 设置数据
	 */
	Pulldown.prototype.setValue = function(data){
		var id = this.opts.simpleData.id,
			name = this.opts.simpleData.name;
			
		if($.type(data) === "object"){
			this.$elem.val(data[name] || "");
			this.$hiddenInput.val(data[id] || "");
			//currentPage重置为1
			this.currentPage =1;
			this.hide();
		}
		if(this.opts.cbFn) this.opts.cbFn(data);
	};
	
	/**
	 * 下一页事件处理
	 * @param {Object} ev
	 */
	Pulldown.prototype.nextBtnHandler = function(ev){
		if(this.$nextBtn.isDisabled) return;
		this.currentPage = this.currentPage+1;
        this.triggerType = "page";
		this.load(function(){
			this.render();
			this.show();
		});
	};
	
	/**
	 * 上一页事件处理
	 * @param {Object} ev
	 */
	Pulldown.prototype.prevBtnHandler = function(ev){
		if(this.$prevBtn.isDisabled) return;
		this.currentPage = this.currentPage-1;
		this.triggerType = "page";
		this.load(function(){
			this.render();
			this.show();
		});
	};

	Pulldown.prototype.loadStaticData = function(){
		this.filterStaticData();
		var startIndex = (this.currentPage-1)*this.opts.pageSize;
		var data = this.data.slice(startIndex,startIndex+this.opts.pageSize);
		this.data = data;
	};
	
	/**
	 * 输入元素点击事件
	 * @param {Object} ev
	 */
	Pulldown.prototype.elemClickHandler = function(ev){
		//TODO:这个先放在这里
	};
	
	/**
	 * 滑动效果
	 * @param {Object} value
	 */
	Pulldown.prototype.slideHandler = function(value){
		if(this.iNow === 0 && value === -1) return;
		var $lis = this.$container.find("li");
		if(this.iNow === $lis.length-1 && value ===1) return;
		$lis.eq(this.iNow).removeClass("active");
		this.iNow += value;
		$lis.eq(this.iNow).addClass("active");
	};
	
	/**
	 * 输入元素键盘事件
	 * @param {Object} ev
	 * @param {Object} callback回调函数
	 * @desc:键盘事件要考虑方向键，上下是选择，左右是翻页，enter是确定
	 */
	Pulldown.prototype.elemKeyUpHandler = function(ev,callback){
		var _this = this;
		this.$hiddenInput.val(""); //只要键盘有输入，直接清除隐藏域中的数据
		this.$elem.removeClass("placeholder");  //input输入的时候，需要清除class为placeholder
		if(this.data && this.data.length){
			if(ev.keyCode === 13){ //确定
				this.setValue(this.$container.find("li").eq(this.iNow).data("data"));
			}else if(ev.keyCode === 37){
				this.opts._hasPage_ && this.prevBtnHandler(ev); //上一页
			}else if(ev.keyCode === 38){
				this.slideHandler(-1);//上移
			}else if(ev.keyCode === 39){
                this.opts._hasPage_ &&  this.nextBtnHandler(ev);//下一页
			}else if(ev.keyCode === 40){
				this.slideHandler(1);//下移
			}else{
				if(this.timer) window.clearTimeout(this.timer);
				this.timer = window.setTimeout(function(){
					_this.currentPage = 1;
					_this.triggerType = "key";
					_this.load(callback);
				},this.opts.defer);

				//如果配置了inputExecCallback为true，则执行回调函数，回调函数第一个参数值是input输入值，第二个是标记是输入时执行的回调
				//在对接时，可拿到回调的第二个参数判断是什么场景下执行的回调
				if(this.opts.inputExecCallback){
                    this.opts.cbFn(this.$elem.val(),true);
				}
			}
		}else{
			if(this.timer) window.clearTimeout(this.timer);
			this.timer = window.setTimeout(function(){
				_this.load(callback);
			},this.opts.defer);
            if(this.opts.inputExecCallback){
                this.opts.cbFn(this.$elem.val(),true);
            }
		}

	};

	Pulldown.prototype.bindEvent = function(){
		this.isBindedEvent = true;
		var _this = this;
		if(this.opts._hasPage_){
			this.$prevBtn.on("click.pulldown",function(ev){//上一页事件
				_this.prevBtnHandler.call(_this,ev);
			});
			this.$nextBtn.on("click.pulldown",function(ev){
				_this.nextBtnHandler.call(_this,ev);
			}); //下一页事件
		}

		this.$container.on("mouseenter.pulldown","li",function(){
			var $lis = _this.$container.find("li");
			$lis.eq(_this.iNow).removeClass("active");
			$(this).addClass("active");
			_this.iNow = $(this).data("index");
		}).on("mousedown.pulldown",function(){
			//IE8及以下做特殊处理
			if(document.all && !document.addEventListener){
				_this.$container[0].setCapture && _this.$container[0].setCapture();
			}
			return false;
		}).on("click.pulldown","li",function(){
			_this.setValue($(this).data("data"));
		}).on("mouseup.pulldown",function(ev){
			_this.$container[0].releaseCapture && _this.$container[0].releaseCapture();
		});

		this.$elem.on("blur.pulldown",function(){
			_this.hide.call(_this);
		}).on("click.pulldown",function(){//当点击click的时候，选中所有的值，以便更好的执行删除操作
			if($(this).val()) $(this).select();
		});

	};
	
	/**
	 * 销毁方法
	 */
	Pulldown.prototype.destroy = function(){
		this.$container.off(".pulldown");
		this.$elem.off(".pulldown");
        this.$prevBtn && this.$prevBtn.off(".pulldown");
        this.$nextBtn && this.$nextBtn.off(".pulldown");
		this.$container.remove();
	};
	
	/**
	 * 隐藏
	 */
	Pulldown.prototype.hide = function(){
        this.$elem.removeClass("ve-arrow-up").addClass("ve-arrow-down");
		this.$container.css("visibility","hidden");
		//如果文本框中没有值，则直接清除隐藏域中的值
		if(!this.$elem.val()) this.$hiddenInput.val("");
	};
	
	Pulldown.prototype.setPos = function(){
		var pointer = this.$elem.offset(),
			iWidth = $(document).outerWidth(),
			iTop = pointer.top + this.$elem.outerHeight(),
			iLeft = pointer.left + this.$container.outerWidth() > iWidth ?  (pointer.left + this.$elem.outerWidth())-this.$container.outerWidth() : pointer.left;
		this.$container.css({"left":iLeft, "top":iTop});
	};
	
	
	/**
	 * 显示
	 * @param {Object}
	 */
	Pulldown.prototype.show = function(){
        this.$elem.removeClass("ve-arrow-down").addClass("ve-arrow-up");
		this.setPos();
		this.$container.css("visibility","visible");
	};
	
	/**
	 * 过滤静态数据
	 * @desc:静态数据过滤的时候
	 */
	Pulldown.prototype.filterStaticData = function(){
		var qStr = $.trim(this.$elem.val()); //查询参数
		var tempArr = [],
			originData = this.opts.typeValue;
		for(var i = 0 , len = originData.length;i<len;i++){
			var item = originData[i];
			var result = this.opts.filterFn.call(this,item,qStr);
			if(result === -1) continue;
			item.sortIndex = result; //排序字段
			tempArr.push(item);
		}
		if(qStr){
			//根据索引排序
			tempArr.sort(function(item1,item2){
				return item1.sortIndex - item2.sortIndex;
			});
		}
		this.data = tempArr;
		this.totalNum = this.data.length;
	};
	

	return Pulldown;

});