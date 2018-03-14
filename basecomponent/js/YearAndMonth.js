/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 年月控件
 * @linc: MIT
 */
define(function(require,exports,module){
	
	var Common = require("../js/Common.js");

	//默认配置参数
	var defaultOpts = {
		yearName:"", //年份name属性，用于生成select的name属性值
		monthName:"", //月份name属性,用于生成select的name属性值
		disabledLater:false, //禁止当前时间后的年月不可选
		currYear:"", //当前要显示的年份
		currMonth:"", //当前要显示的月份
		startTime: new Date().getFullYear() - 20, //开始时间（默认是当前年前20年）
		endTime:new Date().getFullYear() + 20//结束时间（默认是当前年后20年）
	};
	
	/**
	 * 配置参数
	 * @param {Object} elem 
	 * @param {Object} options
	 * @param {Object} cbFn
	 */
	function YearAndMonth(elem,options,cbFn){
		this.id = Common.cid("yearAndMonth");
		
		this.opts = $.extend({},defaultOpts,options);
		
		this.opts.startTime = $.type(this.opts.startTime) === "string" ?  parseInt(this.opts.startTime) : this.opts.startTime;
		this.opts.endTime = $.type(this.opts.endTime) === "string" ?  parseInt(this.opts.endTime) : this.opts.endTime;
		
		//当前选中的年和月
		var date = new Date();
		this.opts.currYear = this.opts.currYear ? this.opts.currYear : date.getFullYear();
		this.opts.currMonth = this.opts.currMonth ? this.opts.currMonth : date.getMonth() + 1;
		
		this.cbFn = cbFn || function(){};
		
		this.$elem = $(elem);
		this.elem = elem;
		
		this.init();
		
	}
	
	/**
	 * 初始化函数
	 */
	YearAndMonth.prototype.init  = function(){
		//年份
		this.$yearContainer = $('<select class="year"></select>');
		if(this.opts.yearName) this.$yearContainer.attr("name",this.opts.yearName);
		//月份
		this.$monthContainer = $('<select class="month"></select>');
		if(this.opts.monthName) this.$monthContainer.attr("name",this.opts.monthName);
		this.$container = $('<div class="time-Container"></div>');
		
		this.$container.append(this.$yearContainer).append(this.$monthContainer);
		
		this.hide(); //先隐藏
		
		this.$elem.append(this.$container);
		this.bindEvent();
	};
	
	/**
	 * 渲染
	 */
	YearAndMonth.prototype.render = function(){
		//如果禁止选择当前时间后的时间，那么当前年以后的年份不进行渲染
		var endYear = this.opts.disabledLater ? new Date().getFullYear() : this.opts.endTime;
		var $option = null;
		for(var i = this.opts.startTime; i <= endYear; i++){
			$option = $('<option value="'+i+'">'+i+'年</option>');
			this.$yearContainer.append($option);
		}

		var endMonth = this.opts.disabledLater ? new Date().getMonth() +1 : 12;
		for(var j = 1; j <=endMonth;j++){
			var value = j<10 ? "0" +j :j;
			$option = $('<option value="'+value+'">'+j+'月</option>');
			this.$monthContainer.append($option);
		}
		this.wirteValue();
	};
	
	/**
	 * 数据回填
	 */
	YearAndMonth.prototype.wirteValue = function(){
		this.$yearContainer.val(this.opts.currYear);
		var month = parseInt(this.opts.currMonth);
		month = month <10 ? "0"+month : month;
		this.$monthContainer.val(month);
	};
	
	/**
	 * 显示
	 */
	YearAndMonth.prototype.show = function(){
		this.$container.show();
	};
	
	/**
	 * 隐藏
	 */
	YearAndMonth.prototype.hide = function(){
		this.$container.hide();
	};
	
	/**
	 * 函数绑定
	 */
	YearAndMonth.prototype.bindEvent = function(){
		this.$yearContainer.on("change",$.proxy(this.timeChangeHandler,this));
		this.$monthContainer.on("change",$.proxy(this.timeChangeHandler,this));
	};
	
	/**
	 * 时间改变事件
	 */
	YearAndMonth.prototype.timeChangeHandler = function(ev){
		var value = $(ev.target).find("option:selected").val();
		this.cbFn(ev.target,value);
	};
	
	return YearAndMonth;
	
	
});