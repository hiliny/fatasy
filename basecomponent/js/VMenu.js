/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 右键菜单功能
 * @linc: MIT
 *
 */
define(function(require,exports,module){
	
	"use strict";
	
	var Common = require("../js/Common.js");

	/**
	 * 默认参数
	 */
	var defaultOpts = {
		width:100,
		model:1, //model可以取两种，一种是model=1,菜单以show/hide方式来展现，一种是model=2，菜单是以enable/disable来显示
		type:1, //type分两种情况，一种是type为1，表示typeValue就是数据对象，type为2，表示要用ajax去请求的
		typeValue:[],
		simpleData:{
			"text":"text", //显示的内容
			"icon":"icon" //菜单前面的图标
		},
		cbFn:$.noop //回调函数
	};
	
	
	/**
	 * 构造函数
	 * @param {Object} elem
	 * @param {Object} node
	 * @param {Object} options
	 */
	function VMenu(elem,options){
		this.id = Common.cid("VMenu");
		this.elem = elem;
		this.$elem = $(elem);
		
		this.opts = $.extend(true,{} ,defaultOpts,options);
		
		this.state = "open";
	}
	
	/**
	 * 加载数据
	 * @param {Object} callback
	 */
	VMenu.prototype.load = function(callback){
		callback = $.type(callback) === "function" ? callback : null;
		var _this = this;
		if(this.opts.type === 1){
			this.data = this.opts.typeValue;
			delete this.opts.typeValue;
			callback && callback.call(_this,this.data);
		}else{
			$.ajax({
				type:"get",
				url:this.opts.typeValue,
				data:this.opts.qDatas || {},
				success:function(data){
					_this.data = data;
					callback && callback.call(_this,data);
				},
				error:function(data){
					Common.error(data);
				}
			});
		}
		
	};
	
	VMenu.prototype.init = function(){
		if($.type(this.data) !== "array"){
			Common.error("数据格式错误，菜单控件需要array");
			return ;
		}
		
		this.$container = $("<div class='vetech-menu-container'></div>");
		var $ul = $("<ul></ul>");
		this.$container.append($ul);
		
		var len = this.data.length; //total count
		var _this = this;
		$.each(this.data, function(i,item) {
			var $li = $("<li class='menu-item'></li>");
			//把其他属性都加到li上
			_this.addExtendProps.call(_this,$li,item);
			
			if(item.icon){
				var $img = $("<img src='"+item.icon+"'/>");
				$li.append($img);
			}

			var $span = $("<span>"+(item.text || "")+"</span>");
			$li.append($span);
			//最后一个节点不加上底线
			if(i === len-1) $li.css("border-bottom","none");
			//beforeInit自己控制是否显示隐藏
			var beforeInit = _this.opts.beforeInit;
			if($.type(beforeInit) === "function"){
				var result = beforeInit(_this.$elem,$li,_this.opts.model,item);
				if(false === result){
					if(_this.opts.model === 1){
						setItemHide($li);
					}else if(_this.opts.model === 2){
						setDisabled($li);
					}
				}
			}
			$li.data("data",item);
			$ul.append($li);
		});
		
		//如果有数据的话，直接添加上去
		if(_this.data.length){
			$(document.body).append(_this.$container);
			var afterInit = _this.opts.afterInit;
			//在初始化完毕以后，调用afterInit函数，进行权限设置
			if(afterInit && $.type(afterInit) === "function"){
				afterInit($ul.find("li"));
			}
		}
		
	};
	
	/**
	 * bind event
	 */
	VMenu.prototype.bindEvent = function(){
		var _this = this;
		this.$container.on("mousedown.vmenu",function(event){
			if(event.button === 2) return false;
		}).on("contextmenu.vmenu",function(){
			return false;
		}).on("click.vmenu","li",function(){
			_this.itemClick($(this));
		}).on("mouseenter.vmenu","li",function(){
			_this.hoverHandler($(this));
		}).on("mouseleave.vmenu",function(){
			_this.hide();
		});
		
		$(document).on("mousemove."+_this.id,function(ev){
			var target = ev.target;
			if(target !== _this.elem && !$(target).parents(".vetech-menu-container").length){
				_this.state = "isClosing"; //准备关闭
                clearTimeout(_this.timer);
                _this.timer = setTimeout(function(){
					if(_this.state === "isClosing"){
						_this.hide();
					} 	
				},10);
			}else{
				_this.state = "open";
			}
		});
	};
	
	/**
	 * 菜单点击事件
	 */
	VMenu.prototype.itemClick = function($li){
		if($li.attr("isDisabled")) return;
		var callback = this.opts.cbFn;
		if(callback && $.type(callback) === "function"){
			callback($li,$li.data("data"));
		}
		this.hide();
	};
	
	/**
	 * 鼠标移动事件
	 */
	VMenu.prototype.hoverHandler = function($li){
		
		if($li.attr("isdisabled") === "true") return;
		
		this.$container.find("li").css("background","#fff");
		$li.css("background","#ddd");		
	};
	
	/**
	 * 设置菜单显示的位置
	 */
	VMenu.prototype.setPos = function(){
		var pointer = this.$elem.offset();
		var iWidth = $(document).width();
		var iHeight = $(document).height();
		//判断是显示左边还是显示右边
		if(iWidth - pointer.left-this.elem.offsetWidth < this.$container[0].offsetWidth){
			this.$container.css("left",pointer.left-this.$container[0].offsetWidth); //显示左边
		}else{
			this.$container.css("left",pointer.left + this.elem.offsetWidth); //显示右边
		}
		//判断是显示下面还是显示上面(判断规则：以整个document中间为界限，目标点在中间偏上的位置，菜单显示在下方,目标点在中间偏下的地方，再进行特殊处理)
		if((pointer.top + this.elem.offsetHeight/2 < iHeight/2) || (iHeight - pointer.top - this.elem.offsetHeight > this.$container[0].offsetHeight)){
			this.$container.css("top",pointer.top); //显示下面
			if(iHeight-pointer.top < this.$container[0].offsetHeight){
				this.$container.css({"height":iHeight-pointer.top-10,"overflow":"auto"});
			}
		}else{
			var iBottom = pointer.top+ this.elem.offsetHeight-this.$container.get(0).offsetHeight;
			if(iBottom < 0 ) iBottom = 0;
			this.$container.css("top",iBottom); //显示上面
			if(pointer.top + this.elem.offsetHeight < this.$container[0].offsetHeight){
				this.$container.css({"height":pointer.top + this.elem.offsetHeight-10,"overflow":"auto"});
			}
		}
	
	};
	
	/**
	 * 显示
	 */
	VMenu.prototype.show = function(){
		this.setPos();
		this.$container.css("visibility","visible");
	};
	
	/**
	 * 隐藏
	 */
	VMenu.prototype.hide = function(){
		this.$container.hide();
		this.destroy();
	};
	
	/**
	 * 销毁
	 */
	VMenu.prototype.destroy = function(){
		this.$container.off(".vmenu");
		$(document).off("."+this.id);
		this.$container.remove();
	};
	
	
	/**
	 * 设置菜单项不可操作
	 * @param {Object} $li
	 */
	function setDisabled($li){
		$li.css({"background":"#FCFCFC","color":"#999","cursor":"not-allowed"});
		$li.find("span").css("cursor","not-allowed");
		$li.attr("isDisabled",true);		
	}
	
	/**
	 * 设置菜单项隐藏
	 * @param {Object} $li
	 */
	function setItemHide($li){
		$li.hide();
	}
	
	
	/**
	 * 添加扩展属性
	 * @param {Object} $li
	 * @param {Object} node
	 */
	VMenu.prototype.addExtendProps =function($li,nodeData){
		var opts = this.opts.simpleData;
		for(var key in nodeData){
			if(nodeData.hasOwnProperty(key) && key !== opts.text && key !==opts.icon){
				$li.attr(key,nodeData[key]);
			}
		}
		
	};

	return VMenu;
	
});