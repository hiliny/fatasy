/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: tab选项卡控件
 * @linc: MIT
 *
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");

    /**
     * 默认参数
     * @type {{}}
     */
    var defaultOpts = {
    	width:600, //轮播图的宽度
		height:300, //轮播图的高度
		defer:2000, //自动播放间隔时间
		textAlign:"right", //圆点对齐方式
		isAutoPlay:true, //是否自动播放
		showTitle:true //是否显示标题
    };

    /**
     * tab选项卡
     * @param elem
     * @param options
     * @constructor
     */
    function VetechSlider(elem,options){
        this.id = Common.cid("VetechSlider");
        this.opts = $.extend({},defaultOpts, options);
		this.elem = elem;
		this.$elem = $(elem);
		this.cbFn = this.opts.cbFn ||"";
		this.isMoving = false; //标记是否在移动
		this.currIndex = 0; //当前显示图片的下标
		this.nextIndex = 0; //下一个要显示的图片下标
		this.timer = {};
		this.direction = -1; //播放的方向
    }
	
	var fn=VetechSlider.prototype;
	
    /**
     * 加载数据
     * @param callback 回调函数
     */
    fn.load = function(callback){
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
	 * 初始化
	 */
	fn.render = function(){
		this.NUM = this.data.length; //图片的个数
		if(!this.NUM) return; //如果没有正确加载数据，或者是获取的数据对象中不存在数据，轮播图就不进行渲染
		this.$container = $('<div class="vetech-swiper"><ul></ul><div class="switch-bar"></div></div>');
		this.$nav=$("<ul></ul>");
		this.$slidebar=$('<div class="switch-bar"></div>');
		this.$container.css({"width":this.opts.width,"height":this.opts.height});
		this.$slidebar.css("text-align",this.opts.textAlign);

		this.$leftBtn = $('<span class="switch-btn leftBtn"></span>');
		this.$rightBtn = $('<span class="switch-btn rightBtn"></span>');

		this.$container.append(this.$nav).append(this.$slidebar).append(this.$leftBtn).append(this.$rightBtn);

		this.$elem.append(this.$container);

		this.renderData();
	};
	
	//渲染数据
	fn.renderData = function(){
		for(var i = 0; i< this.NUM;i++){
			this.$nav.append(this.createLi(i,this.data[i]));
			var $point = this.createPoint(i);
			if(i === 0) $point.addClass("active");
			this.$slidebar.append($point);
		}

		this.bindEvent();
		this.autoPlay();
	};
	
	fn.bindEvent = function(){
		var _this=this;
		this.$leftBtn.on("click",$.proxy(this.leftBtnHandler,this));
		this.$rightBtn.on("click",$.proxy(this.rightBtnHandler,this));

		this.$container.on("click",".point",$.proxy(this.pointHandler,this));
		this.$container.on("click","ul li",function(){
			if($.type(_this.cbFn)=== "function"){
				_this.cbFn($(this));
			}
		});
	
	};

	/**
	 * 自动播放
	 */
	fn.autoPlay = function(){
		if(!this.opts.isAutoPlay) return;
		var _this = this;
		this.timer = setInterval(function(){
			_this.rightBtnHandler.call(_this); //自动播放的效果和点击右边按钮是一致的
		},this.opts.defer);
	};
	
	/**
	 * 停止播放
	 */
	fn.stopPlay = function(){
		if(this.timer) clearInterval(this.timer);
	};

	fn.switchHandler = function(){
		var _this = this;
		if(this.isMoving) return;
		this.isMoving = true;
		this.stopPlay();
		var $currLi = this.$container.find("li[data-index='"+this.currIndex+"']");
		this.$container.find(".point").removeClass("active").eq(this.nextIndex).addClass("active");
		if(this.direction === 1){ //左边
			this.$nav.css("left",-this.opts.width);			this.$container.find('li[data-index="'+this.nextIndex+'"]').insertBefore($currLi);
			this.$nav.animate({
				left: 0
			},function(){
				_this.currIndex = _this.nextIndex;
				_this.isMoving = false;
				_this.autoPlay.call(_this);
			});
		}else{ //右边操作			$currLi.after(this.$container.find("li[data-index='"+this.nextIndex+"']"));
			this.$nav.animate({
				left: - this.opts.width
			},function(){				_this.$nav.find("li").last().after(_this.$nav.find("li").first());
				_this.$nav.css("left",0);
				_this.currIndex =_this.nextIndex;
				_this.isMoving = false;
				_this.autoPlay.call(_this);
			});
		}
	};
	
	/**
	 * 左边按钮点击事件
	 */
	fn.leftBtnHandler = function(){
		this.direction = 1;
		this.nextIndex =  this.currIndex <= 0 ? this.NUM-1 : this.currIndex -1;
		this.switchHandler();
	};

	/**
	 * 右边按钮点击事件
	 */
	fn.rightBtnHandler = function(){
		this.direction = -1;
		this.nextIndex =  this.currIndex >= this.NUM-1 ? 0 : this.currIndex +1;
		this.switchHandler();
	};

	/**
	 * 点击圆点事件
	 * @param {Object} ev
	 */
	fn.pointHandler = function(ev){
		if(this.isMoving) return;
		var $target = $(ev.target);
		if($target.hasClass("active")) return;
		var index = $target.data("index");
		this.nextIndex = index;
		this.switchHandler();
	};
	

	/**
	 * 创建可点击的点
	 * @param {Object} index
	 */
	fn.createPoint = function(index){
		return $('<span class="point" data-index="'+index+'"></span>');
	};

	fn.createLi = function(index,data){
		var $li = $('<li data-index="'+index+'" style="width:'+this.opts.width+'px"></li>'),
			$a = $('<a></a>'),
			$img = $('<img/>'),
			$p = $('<p>'+data.title+'</p>');
		if(data.href){
			$a.attr("href",data.href).attr("target","_blank");
		}else{
			$a.attr("href","javascript:void(0);");
		}
		$a.append($img);
		if(this.opts.showTitle){
			$a.append($p);
		}
		$li.append($a);

		$img.attr("src",data.url).css({"width":this.opts.width,"height":this.opts.height});
		//如果图片加载不出来，用占位图来显示
		$img.on("error",function(){
			$img.attr("src","../img/slide-btn.png");
			$img.off("error");
		});
		return $li;
	};

    return VetechSlider;

});