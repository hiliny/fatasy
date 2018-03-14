/**
 * @作者:yilia
 * @描述: 单价格日历控件
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");

    /**
     * 默认参数
     * @type {{}}
     */
    var defaultOpts = {
    	usetype:"layer", //使用方式，默认是弹出，还有一种是append
		activeDate: new Date(), //当前显示的日期
		type:"2",
        formatPostData: function(data) {
            return data;
        },
		typeValue:"" //默认的数据方式
    };

    /**
     * 单价格日历
     * @param elem
     * @param options
     * @constructor
     */
    function PriceCalender(elem,options){
        this.id = Common.cid("PriceCalender");
        this.opts = $.extend({},defaultOpts, options);
        this.elem = elem;
		this.$elem = $(elem);
		this.cbFn = this.opts.cbFn ||function(){};
		if( !$.type(this.opts.activeDate,"[object Date]") ) throw new TypeError("activeDate需要Date类型");
		this.isShow = false;
		this.init();
    }
	
	var fn=PriceCalender.prototype;
	
	/**
	 * 初始化日历容器
	 */
	fn.init = function(){
		//外层容器
		this.$container = $('<div class="vetech-price-calendar clearfix"></div>');
		//左侧显示月份和切换按钮的区域
		this.$monethArea = $('<div class="month-area"></div>');
		//右侧显示日期的区域
		this.$daysArea = $('<div class="days-area"></div>');
		
		//设置左侧内容
		this.$today = $('<div class="today"><a href="javascript:void(0)">回到今天</a></div>');
		this.$switchBtn = $(getMonthTpl(this.opts.activeDate));
		this.$monethArea.append(this.$today).append(this.$switchBtn);
		
		//设置右侧区域
		var $table = $('<table></table>');
		$table.append(createThead());
		$table.append(createTbody());
		this.$daysArea.append($table);
		
		this.$container.append(this.$monethArea).append(this.$daysArea);
		
		//根据使用类型来添加
		if(this.opts.usetype === "layer"){
			$(document.body).append(this.$container);
		} else{
			this.$elem.append(this.$container);
			this.show();
		}
		
		//添加完毕以后，还要修正切换按钮区域的高度值
		var iHeight = this.$daysArea.find("tbody").outerHeight();
		this.$switchBtn.css("height",iHeight);
		
		this.initDays(this.opts.activeDate);
		this.bindEvent();
	};
	
		
	/*
	 * 创建左侧模板
	 * @param {Object} date
	 */
	function getMonthTpl(date){
		var htmlArray = [];
		htmlArray.push('<div class="switch-btn">');
		htmlArray.push('<a class="prev-btn"></a>');
		htmlArray.push('<a class="next-btn"></a>');
		htmlArray.push('<div class="month">');
		htmlArray.push('<span>'+date.getFullYear()+'年</span><span>'+(date.getMonth()+1)+'月</span>');
		htmlArray.push('</div>');
		htmlArray.push('</div>');
		return htmlArray.join("");
	}
	
	/*
	 * 创建表头
	 */
	function createThead(){
		var $thead = $('<thead></thead>'),
			tempArr = ["日","一","二","三","四","五","六"];
		for(var i = 0; i < tempArr.length; i++ ){
			$thead.append('<th>'+tempArr[i]+'</th>');
		}
		return $thead;
	}
	
	/*
	 * 创建body区域
	 */
	function createTbody(){
		var $tbody = $('<tbody></tbody>');
		var $tr = null;
		for(var i = 0 ; i < 42;i++){
			if(i%7 === 0){
				$tr = $('<tr></tr>');
				$tbody.append($tr);
			} 
			$tr.append('<td><a href="javascript:void(0)"></a></td>');
		}
		return $tbody;
	}
	
	/*
	 * 显示
	 */
	fn.show = function(){
		if(this.isShow) return;
		this.setPos();
		this.$container.css({"visibility":"visible","position":"absolute","z-index":1000});
		this.isShow = true;
	};
	
	/*
	 * 隐藏
	 */
	fn.hide = function(){
		if(!this.isShow) return;
		this.$container.css({"visibility":"hidden"});
		if(this.opts.usetype === "layer"){
			this.$container.css({"left":0,"top":0});
		}
		this.isShow = false;
	};
	/*
	 * 计算位置
	 */
	fn.setPos = function(){
		var pointer = this.$elem.offset(),
			iWidth = $(document).outerWidth(),
			iHeight = $(document).outerHeight(),
			iLeft = 0,
			iTop = pointer.top + this.$elem.outerHeight()+2;
		
		iLeft = pointer.left + this.$container.outerWidth() > iWidth ?  (pointer.left + this.$elem.outerWidth())-this.$container.outerWidth() : pointer.left;
		if(this.opts.usetype === "layer"){
			this.$container.css({"left":iLeft, "top":iTop});
		}
	};
	
	
	/**
	 * 事件绑定
	 */
	fn.bindEvent = function(){
		var _this = this;
		this.$today.on("click",function(ev){
			_this.backToSomeDay(ev,new Date(),true);
		});
		
		this.$daysArea.find("td>a").on("click",function(){
			_this.itemClickHandler($(this));
		});
		
		this.$monethArea.find(".prev-btn").on("click", function(ev){
			_this.switchBtnHandler(ev,-1);
		});
		this.$monethArea.find(".next-btn").on("click",function(ev){
			_this.switchBtnHandler(ev,1);
		});
		//只有是弹出的时候，点击组件以外的区域才会关闭组件
		if(this.opts.usetype === "layer"){
			$(document).on("click",function(ev){
				var target = ev.target;
				if(target !== _this.elem) _this.hide();
			});
			this.$container.on("click",function(){
				return false;
			});
		}

		//防止a标签触发window.onbeforeunload事件
		this.$container.on("click","a",function(){
			return false;
		});
	};
	
	
	/**
	 * 点击日期事件 
	 * @param {Object} $target
	 */
	fn.itemClickHandler = function($target){
		if($target.hasClass("not-value") || $target.hasClass("invalid"))return;
		this.setActive($target);
		//callback execute
		var dateStr = $target.attr("data-date");		
		
		if($.isEmptyObject(this.cbFn)){
			this.cbFn(dateStr,$target);
		} 
		if(this.opts.usetype === "layer"){
			this.hide();
		}
	};
	
	/*
	 * 切换按钮操作事件
	 * @param {Object} ev
	 * @param {Object} iSpeed
	 */
	fn.switchBtnHandler = function(ev,iSpeed){
		var $month = this.$switchBtn.find(".month>span"),
			year = $month.eq(0).text().replace("年",""),
			month = $month.eq(1).text().replace("月","");
		month = parseInt(month) + iSpeed-1;
		this.backToSomeDay(ev,new Date(year,month,1),false);
		return false;
	};
		
	/**
	 * 回到某一天
	 * @param {Object} ev
	 * @param {Object} date
	 * @param {Object} isExecuteAcite 是否要激活active
	 */
	fn.backToSomeDay = function(ev,date,isExecuteAcite){
		this.initDays(date);
		this.render();
		var $clickedDom = this.$daysArea.find("a[data-date='"+(formatDate(date))+"']");
		isExecuteAcite && this.setActive($clickedDom);
		return false;
	};
	
	/**
	 * 激活某个对象
	 * @param {Object} $clickedDom
	 */
	fn.setActive = function($clickedDom){
		if($clickedDom.hasClass("invalid")) return; //如果当前没有价格的话，不选中
		this.$daysArea.find(".active").removeClass();
		$clickedDom.addClass("active");
	};
	
	/**
	 * 初始化日期
	 * @param {Object} date
	 */
	fn.initDays = function(date){
		//根据activeDate来获取该月第一天星期几
		var year = date.getFullYear(),
			month = date.getMonth(),
			dayIndex = 1, //天数
			weekNum = 0, //activeDate所在月份第一天星期几 
			maxDay = 0; //activeDate所在月份最大有多少天
		weekNum = new Date(year,month,1).getDay();
		maxDay = new Date(year,month+1,0).getDate();
		var tempMonth = month+1;
		tempMonth = tempMonth <10 ? "0"+tempMonth: tempMonth;
		this.$daysArea.find("td>a").each(function(i,item){
			$(this).html("").removeClass();
			if(i >= weekNum && dayIndex <= maxDay){
				dayIndex = dayIndex <10 ? "0"+dayIndex: dayIndex;
				$(this).attr("data-date",""+year + "-" + tempMonth + "-" + dayIndex);
				$(this).append('<span class="date">'+dayIndex+'</span>');
				dayIndex++;
			}else{
				$(this).addClass("not-value");
			}
		});
		this.$switchBtn.find(".month").find("span").eq(0).text(year+"年").end().eq(1).text((month+1)+"月");
	};
	
	/**
	 * 渲染数据
	 */
	fn.render = function(){
		var _this = this;
		this.$daysArea.find("td>a").each(function(i){
			if($(this).hasClass("not-value")) return;
			var dateStr = $(this).attr("data-date");
			$(this).addClass("invalid");
			for(var j=0;j<_this.data.length;j++){
				if(_this.data[j].lyrq === dateStr){
					$(this).removeClass("invalid");
					$(this).append('<span class="price">￥'+_this.data[j].pjCbj+'</span>');
					$(this).data("price",_this.data[j].pjCbj);
					if(formatDate(_this.opts.activeDate) === dateStr) $(this).addClass("active"); //默认选中当前(前提：有价格数据)
					return;
				}
			}			
		});
	};
	/**
	 * 格式化
	 */
	function formatDate(date){
		var year = date.getFullYear(),
			month = date.getMonth() +1,
			days = date.getDate();
		month = month < 10 ? "0" + month : month;
		days = days < 10 ? "0" + days : days;
		return "" + year +"-"+ month +"-" + days;
	}
	
    /**
     * 加载数据
     * @param callback 回调函数
     */
    fn.load = function(callback){
        if ($.type(callback) !== "function") throw new Error("参数配置错误");
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax($.extend(true, {
                type: "get",
                url: this.opts.typeValue,
                dataType: "json",
                data: this.opts.formatPostData(this.opts.qDatas),
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                },
                error: function(msg) {
                    throw new Error("数据加载错误" + msg);
                }
            }, this.opts.ajaxOpts));
        }
    };

    return PriceCalender;

});