/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define(function(require,exports,module){
    var Common = require("../js/Common");

    var defaultOpts = {
        maxNum:50,
        minNum:0,
        defaultNum:0,
        numSize:1        
    };

    function InputNumber(elem,options){
        this.id = Common.cid("InputNumber");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend({},defaultOpts,options);
        this.data=this.opts.data;
        this.cbFn = this.opts.cbFn || $.noop;
        this.maxNum = parseInt(this.opts.maxNum,10);
        this.minNum = parseInt(this.opts.minNum,10);
        this.numSize = parseInt(this.opts.numSize,10);
    }

    var fn = InputNumber.prototype;

    //初始化容器
    fn.init = function(){
        this.$container = $('<div class="vetech-inputnumer"></div>');
        this.$input = $('<input type="text" class="ve-number" value="'+this.opts.defaultNum+'"/>');
        this.$button = $('<div class="ve-button">'+
        '<button type="button" class="iconfont">&#xe605;</button>'+
        '<button type="button" class="iconfont">&#xe601;</button></div>');
        this.$container.append(this.$input).append(this.$button);
        this.show();
        this.bindEvent();
    };
    
	
    //展现数据
    fn.show = function(){
    	var mm=this.$elem.css("margin"),
            iWidth = this.$elem.width(),
            iHeight =this.$elem.height();
        this.$container.css({"width":iWidth-2, "height":iHeight,"margin":mm});
        this.$elem.after(this.$container).remove();
        this.$button.innerHeight(iHeight);
        this.$input.innerWidth(iWidth-this.$button.width()-5);
    };

    //绑定事件
    fn.bindEvent = function(){
       var _this=this;
		this.$button.on("click","button:first",function(){
			var value=parseInt(_this.$input.val() || 0 ,10);
			if(value<_this.maxNum){
			    value = value+_this.numSize;
			}
            _this.$input.val(value);
			_this.cbFn(value);
		});
		
		this.$button.on("click","button:last",function(){
			var value=_this.$input.val() || 0;
			if(value>_this.minNum){
			    value = value-_this.numSize;
			}
            _this.$input.val(value);
			_this.cbFn(value);
		});
		
		this.$input.on("blur",function(){
			var value=_this.$input.val();
			if(value){
				value=parseInt(value,10);
				if(value>_this.maxNum){
					value =_this.maxNum;
				}else if(value < _this.minNum){
					value =_this.maxNum;
				}
			}else{
				value="";
			}
			_this.$input.val(value);
			_this.cbFn(value);
		});
		
		this.$input.on("keyup",function(ev){
			ev=ev||window.event;
           	var code= ev.keyCode;
            if(!((code >=48 && code<= 57) || code===8 || code===46)){
                this.value=this.value.replace(/\D/g,'');
            }
			_this.cbFn(this.value);
		});
   };
    
    return InputNumber;
});