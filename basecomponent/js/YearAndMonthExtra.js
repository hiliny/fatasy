/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:年月控件扩展
 * @linc: MIT
 *
 */
define(function(require,exports,module){
	
	function init(){
		var Common = require("../js/Common.js");
		var YearAndMonth = require("../js/YearAndMonth.js");
		
		/**
		 * 入口函数
		 * @param {Object} options
		 * @param {Object} cbFn
		 */
		$.fn.addYearAndMonth = function(options,cbFn){
			if(!this.length) Common.nodeError(this);
			var yam = new YearAndMonth(this.get(0),options,cbFn);
			yam.render();
			yam.show();
		};
		
	}
	
	exports.init = init;
	
});