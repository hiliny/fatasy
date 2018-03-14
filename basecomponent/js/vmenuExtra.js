/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 右键菜单功能
 * @linc: MIT
 *
 */
define(function(require,exports,module){
	
	var VMenu = require("../js/VMenu.js");

	function init(){
		
		
		//如果已经被渲染完毕，就不在继续渲染，以便节省性能
		if($.fn.createMenu) return;
		
		
		/**
		 * 添加方法
		 * @param {Object} nodes
		 * @param {Object} options
		 */
		$.fn.createMenu = function(options){
			
			var triggerType = options.triggerType ? options.triggerType : "mouseenter";
			
			$.each(this, function(i,item) {
				
				$(item).on(triggerType,function(){
					
					var menu = new VMenu(this,options);
					menu.load(function(){
						this.init();
						this.bindEvent();
						this.show();
					});
					
				});
				
			});
			
		};
		
		
		
	}
	
	
	exports.init = init;
	
});
