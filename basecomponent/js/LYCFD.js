/**
 * @作者:yilia 
 * @时间：2018.1.3
 * @描述: 旅游出发地控件
 *
 */
define(function (require, exports, module) {
	
	var Common = require("../js/Common");
    var laytpl = window.layui.laytpl;
	
	/**
	 * 默认参数
	 */
	var defaultOptions = {
		"simpleData":{
			id:"id",
			name:"name"
		},
		"autoClose":false, //是否自动关闭
		"writeValue":[], //数据回填
		"renderFn":null, //自定义渲染函数
		"isAuto":false, //内容页中的选项是否根据内容自适应，默认是false，即以...代替，如果为true
		"type":1,
		"typeValue":"",
		"pt":"ASMS",  //平台
		"csbh":"",  //城市编号
		"queryUrl":"/webcomponent/travel/kjcommtravel/searchTravelCity", //查询的url
		"maxNum":20,
		"size":10, //搜索时，默认显示10条数据
		"cbFn":function(){} //回调函数
 	};
    
    
	/**
	 * 加载模板
	 */
	function LYCFD(elem,options){
		this.id = Common.cid("LYCFD");
		this.elem = elem;
		this.$elem = $(elem);
		this.opts = $.extend(true, {}, defaultOptions,options);
		this.cbFn = this.opts.cbFn || $.noop();
		this.isShow = false; //标记是否已经显示
		this.isComming = false;
		this.loadShow=null;
	}
	
	var fn=LYCFD.prototype;
		
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
    fn.init = function(callback){
        var _this = this;
        Common.loadTpl(_this.opts.tplUrl,function(state,result){
            if("error" === state) Common.tplError();
            laytpl(result).render(_this.data,function(html){
                _this.$mddContainer = $(html);
                $(document.body).append(_this.$mddContainer);
                _this.setWidth();
                _this.bindEvent();
                _this.show();
            });
        });

    };

	/**
	 * 数据回填
	 */
	fn.writeValue=function(){
		var result = this.opts.writeValue;
		if( result && result.length >0){
			this.$mddContainer.find(".em-none").hide();
			for(var i = 0,len = result.length;i<len;i++){
				this.addSpan(result[i]);
			}
		}
	};
	
	/**
	 * 展示
	 */
	fn.show=function(){
		if(!this.isShow){
            this.setPos();
            $(document.body).append(this.$mddContainer);
			this.$mddContainer.show();
			this.setWidth();
            this.isShow =true;
       }
	};
	
	
	fn.setPos=function(){
		var point = this.$elem.offset();
		this.$mddContainer.css({"left":point.left, "top": point.top + this.$elem.outerHeight()});
	};
	
	/**
     * 隐藏
     */
    fn.hide = function(){
        if(this.isShow){
            this.$mddContainer.hide();
            this.isShow = false;
        }

    };

	/**
	 * 设置已经选择的宽度
	 */
	fn.setWidth=function(){
		var iWidth = this.$mddContainer.find(".header li").length * 60 + 50;
		this.$mddContainer.find(".search-container div").width(iWidth - 85);
		this.$mddContainer.find(".list-container").width(iWidth-85);
		this.$mddContainer.width(iWidth);
	};


	fn.bindEvent=function(){
		var _this=this;
		this.$mddContainer.on("keyup.mddComponent",".searchTxt", function (ev){
			_this.searchHandler($(this),ev);
		});

		this.$mddContainer.on("click.mddComponent",".header li",function(){
			_this.switchTabHandler($(this));
		});
		this.$mddContainer.on("click.mddComponent",".list-container li",function(){
			_this.addCityHandler($(this));
		});
		this.$mddContainer.on("click.mddComponent",".content li",function(){
			_this.itemClickHandler($(this));
		});

		this.$mddContainer.on("click.mddComponent",".choosedCity",function(){
			_this.choosedCityClickHandler($(this));
			return false;
		});
		this.$mddContainer.on("keyup.mddComponent",".focusInput",function(ev){
			_this.choosedCityKeyHandler($(this),ev);
		});

		this.$mddContainer.on("click.mddComponent",".sureBtn",function(){
			_this.sureHandler($(this));
		});
		this.$mddContainer.on("click.mddComponent",".search-container div",function(){
			_this.setFocus($(this));
		});

		$(document).on("mousedown.mddComponent",function(){
			_this.hide();
		});
		this.$mddContainer.on("mousedown.mddComponent",function(){
			return false;
		});
		//是否自动关闭
		if(this.opts.autoClose){
			this.$mddContainer.on("mouseleave",function(){
				_this.isComming = false;
				_this.hide();
			});
		}
		this.$mddContainer.on("mouseenter",function(){
			_this.isComming = true;
		});
	};


	/**
	 * 模糊搜索查询
	 * @param {Object} obj
	 * @param {Object} ev
	 */
	fn.searchHandler=function(obj,ev){
		var _this=this;
		var value = this.$mddContainer.find(".searchTxt").val();
		var keyCode = ev.keyCode;

		var $container = _this.$mddContainer.find(".list-container");
		var $currLi =$container.find(".active");

		if(keyCode === 8 && !value){ //删除选中的
			if($(obj).data("isNull")){
				$(obj).parents(".search-container").find(".choosedCity").last().remove();
				this.warnMaxNum();
			}else{
				this.$mddContainer.find(".tab-container").show().end().find(".list-container").hide();
				$(obj).data("isNull",true);
			}
		}else if(keyCode === 38){ //方向键↑
			if($currLi.length){
				if(!$currLi.prev("li").length) return; //如果当前选中的列已经是第一列了，就不往上选中了
				$currLi.prev("li").addClass("active");
				$currLi.removeClass("active");
			}

		}else if(keyCode === 40){ //方向键↓
			if(!$currLi.length){
				$container.find("li").eq(0).addClass("active");
			}else{
				if(!$currLi.next("li").length) return;
				$currLi.next("li").addClass("active");
				$currLi.removeClass("active");
			}

		}else if(keyCode === 13){//enter
			if($container.find(".active").length>0){
				this.addCityHandler($container.find(".active"));
			}
		}else{
			var iWidth = _this.calcInputWdith(value);
			$(obj).css("width",iWidth+20);
			this.$mddContainer.find(".tab-container").hide().end().find(".list-container").show();
			$(obj).data("isNull",false);
			$.ajax({
				type:"get",
				url:_this.opts.queryUrl,
				data:{
					"pt":_this.opts.pt,
					"size":_this.opts.size,
					"qStr":value
				},
				dataType:"json",
				success:function(data){
					if(_this.opts.type === "cfd"){
						data = data.data || [];
					}else{
						data = _this.formatData(data);
					}
					_this.renderList(data);
				}
			});
		}

	};

	/**
	 * 渲染
	 * @param data
     */
	fn.renderList=function(data){
		var $frag = $(document.createDocumentFragment());
		var keyWord = $.trim($(".searchTxt").val());
		for(var i = 0,len = data.length; i< len;i++){
			var $li = $("<li>"+markKeyword(data[i][this.opts.simpleData.name])+"</li>");
			if(this.opts.renderFn){
				$li = this.opts.renderFn(data[i],keyWord);
			}
			$li.data("data",data[i]);
			$frag.append($li);
		}
		this.$mddContainer.find(".list-container").html("").append($frag);
	};

	/**
	 * 标记关键字
	 * @param name
     */
	function markKeyword(name){
		var keyWord = $.trim($(".searchTxt").val());
		var raRegExp = new RegExp(keyWord,"g");
		return name.replace(raRegExp,"<i style='color:red;font-style: normal;'>"+keyWord+"</i>");
	}


	/**
	 * 计算input的宽度
	 */
	fn.calcInputWdith=function(value){
		var $span = $("<span style='left:-1000px;position:absolute'>"+value+"</span>");
		$(document.body).append($span);
		var iWidth = $span.width();
		$span.remove();
		return iWidth;
	};

	/**
	 * tab页切换
	 */
	fn.switchTabHandler=function(obj){
		var index = $(obj).data("index");
		$(obj).parent().find("li").removeClass("active").end().end().addClass("active");
		this.$mddContainer.find(".content div").removeClass("active").eq(index).addClass("active");
	};

	fn.addCityHandler=function(obj){
		this.$mddContainer.find(".tab-container").show().end().find(".list-container").hide();
		var data = $(obj).data("data"),
			$searchTxt = this.$mddContainer.find(".searchTxt"),
			id = data[this.opts.simpleData.id];
		//添加的时候，需要对其进行判断，防止重复添加,如果设置了最大值，则超出不许添加
		if(!this.$mddContainer.find(".search-container").find("#" + id).length){
			this.warnMaxNum();
			if(this.$mddContainer.find(".search-container").find("span").length < this.opts.maxNum){
				this.addSpan(data);
			}
		}else{
			$searchTxt.val("").focus();
		}
		$searchTxt.css("width",20); //选择完毕以后，input框的宽度回归到原始值

	};

	/*判断已选数据是否超出最大限制个数，超出则提示，不超出则正常添加*/
	fn.warnMaxNum =function(){
		var _this=this;
		if(this.$mddContainer.find(".search-container").find("span").length < this.opts.maxNum){
			this.$mddContainer.find(".search-container div").css("border","1px solid #76b5f4").find("p").remove();
		}else{
			this.$mddContainer.find(".search-container .searchTxt").val("");
			this.$mddContainer.find(".search-container div").css("border","1px solid red");
			if(this.$mddContainer.find(".choose-warn").length===0){
				var $p=$("<p style='color:red' class='choose-warn'>您最多能选择"+this.opts.maxNum+"个地方</p>");
				this.$mddContainer.find(".search-container div").append($p);
			}
			setTimeout(function(){
				_this.$mddContainer.find(".search-container div").css("border","1px solid #76b5f4").find("p").remove();
			},2000);
		}
	};

	/**
	 * 格式化数据(目的地城市)
	 * @param data
     */
	fn.formatData=function(data){
		var result = [];
		for(var i = 0 ; i< data.length;i++){
			var newData ={};
			newData[this.opts.simpleData.id] = data[i].BH;
			newData[this.opts.simpleData.name] = data[i].MC;
			$.extend({},newData,data[i]);
			result.push(newData);
		}
		//其他属性保持不变
		return result;
	};

	/**
	 * 添加选中的区块
	 */
	fn.addSpan=function(data){
		var $input = this.$mddContainer.find(".search-container .searchTxt");
		var $span = $("<span id='"+(data[this.opts.simpleData.id])+"' class='choosedCity'>"+(data[this.opts.simpleData.name])+";<input class='focusInput'/></span>");
		$span.data("data",data);
		$span.insertBefore($input);
		$input.val("").focus();
	};

	/**
	 * 选择
	 */
	fn.itemClickHandler=function(obj){
		try{
			var data = $(obj).data("data");
			var id = data[this.opts.simpleData.id];
			//点击之前，先判断是否已经选择，如果选择后，就不再进行添加
			if(!this.$mddContainer.find(".search-container").find("#" + id).length){
				this.warnMaxNum();
				if(this.$mddContainer.find(".search-container").find("span").length < this.opts.maxNum){
					this.addSpan(data);
				}
			}
			this.$mddContainer.find(".em-none").hide();
		}catch(e){
			throw new Error("数据格式错误" +e);
		}
	};

	/**
	 * 确认选择
	 */
	fn.sureHandler =function(obj){
		var result = [];
		this.$mddContainer.find(".choosedCity").each(function(){
			var tempData = $(this).data("data");
			result.push(tempData);
		});
		if(this.cbFn) this.cbFn(result);
		this.hide();
	};

	fn.setFocus =function(obj){
		this.$mddContainer.find(".em-none").hide();
		$(obj).find("input").focus();
	};

	/**
	 * 点击已经选择的城市，给其选中标记，并设置焦点
	 */
	fn.choosedCityClickHandler =function(obj){
		$(obj).parent().find("span").removeClass("active").end().end().addClass("active");
		$(obj).find("input").focus();
	};

	//按删除键，可以删除已经选择的城市
	fn.choosedCityKeyHandler = function(obj,ev){
		if(ev.keyCode === 8){
			$(obj).parent().remove();
			this.$mddContainer.find(".searchTxt").focus();
			this.warnMaxNum();
		}
	};
	
	return LYCFD;
});