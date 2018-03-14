/**
 * @作者:hejie
 * @描述: 酒店热门商圈控件
 * @linc: MIT
 *
 */

define(function(require,exports,module){
	
	var pullDown = require("../js/Pulldown");
	var Common = require("../js/Common");
			
	var laytpl = window.layui ? window.layui.laytpl : window.laytpl;
	
    var defaultOptions = {
    	serviceUrl:"/cdsbase/kj/cds/hotel/getHotelDistrict",
        tplUrl: "/plugins/components/tpl/hotelHotCircleTpl.html",
        pt: 'asms',
        pulldown: true,
        csbh: null,
        hiddenName:'',
        simpleData:{
        	id:"id", //隐藏域的取值字段
        	name:"name" //显示框的取值字段
        },
        type:2,
        cbFn:null
    };

	function HotelHotCircle(elem,options){
		this.elem = elem;
		this.$elem = $(elem);
		this.pullDown = null;
		this.$xzqSqAddressContainer = null;
		if(this.$elem.length<=0){
			throw new Error("DOM绑定错误【请查看页面是否渲染完毕，或者是否存在该DOM对象】");
		}
		this.opts = $.extend(true,{},defaultOptions,options);
		this.tplCache = null;
		this.init();
	}
	
	HotelHotCircle.prototype.init  = function(){
		this.data = null;//服务数据缓存
		this.bindInputEvent();
		this.$elem.data("hotelHotCircle",this);
	};
	
	HotelHotCircle.prototype.bindInputEvent = function(){
		//this.$elem.on('click.hotelHotCircle',$.proxy(this.clickEvent,this));
	};
	
	HotelHotCircle.prototype.clickEvent = function(e){
		this.render();
	};
	
	HotelHotCircle.prototype.load = function(filterFn){
		//filterFn为ajax请求成功的回调函数，对外抛出使数据内容在控件外可修改
		var csbh = $("#" + this.opts.csbh).val();
		var _this = this;
		var _mid = Math.floor(Math.random()*1000);
		if(!csbh) return this;
		$.ajax({
            type: "get",
            url: this.opts.serviceUrl,
            data: {
                "pt": this.opts.pt,
                "bh": csbh,
                "_mid":_mid
            },
            success: function(data) {
            	_this.data = data;
            	if($.isFunction(filterFn)){
            		filterFn.call(_this,data);
            	}
            },
            error:function(a,b,c){
            	console.log(a);
            }
      	}); 		
	};
	
	HotelHotCircle.prototype.render = function(){
		//请求模板为异步操作，不能在render中进行
	};
					
	HotelHotCircle.prototype.show = function(){
		var _this = this;
		//缓存模板，以免每次都请求同一个模板
		if(this.tplCache == null){
			Common.loadTpl(this.opts.tplUrl,function(state, result){
				if (state === "error") Common.tplError();
				_this.tplCache = result;
				_this.buildControl(result,_this.data);
			});			
		}else{
			this.buildControl(this.tplCache,_this.data);			
		}
	};
	
	HotelHotCircle.prototype.buildControl = function(tpl,data){
		var domData = laytpl(tpl).render(data);
		this.destroy();
		this.$xzqSqAddressContainer = $($.trim(domData));
        this.bindEvent();
        this.display();		
	};
	
	HotelHotCircle.prototype.destroy = function(){
		if(this.$xzqSqAddressContainer){
			this.$xzqSqAddressContainer.off(".xzqSqAddressComponent");
			$(document).off(".xzqSqAddressComponent");
            this.$xzqSqAddressContainer.remove();
            this.$xzqSqAddressContainer = null;
            this.$elem.removeData("hotelHotCircle");
		}
	};
	
	HotelHotCircle.prototype.bindEvent = function(){
        this.$xzqSqAddressContainer.on('click.xzqSqAddressComponent', '.header li', $.proxy(this.switchTabHandler,this));
        this.$xzqSqAddressContainer.on('click.xzqSqAddressComponent', '.second_tab li', $.proxy(this.switchSecondTabHandler,this));
        this.$xzqSqAddressContainer.on('click.xzqSqAddressComponent', '.content ul:not(.second_tab) li', $.proxy(this.itemClickHandler,this));
        this.$xzqSqAddressContainer.on('click.xzqSqAddressComponent', '.header .close', $.proxy(this.closeHandler,this));
        $(document).on("mousedown.xzqSqAddressComponent", $.proxy(this.closeHandler,this));
        this.$xzqSqAddressContainer.on("mousedown.xzqSqAddressComponent", function() {
            return false;
        });
	};	
	
	HotelHotCircle.prototype.switchTabHandler = function(ev){
		var eDom =  $(ev.target);
        var index = eDom.attr("data-index");
        eDom.parent().find("li").removeClass("active").end().end().addClass("active");
        this.$xzqSqAddressContainer.find(".content .tab-page").removeClass("active").eq(index).addClass("active");		
	};
	
	HotelHotCircle.prototype.switchSecondTabHandler = function(ev){
		var eDom =  $(ev.currentTarget);
        var index = eDom.attr("data-index");
        eDom.parent().find("li").removeClass("active").end().end().addClass("active");
        var $page =eDom.parent().parent();
        $page.find("ul:gt(0)").hide().eq(index).show();
        if ($page.attr("page-index") === '0') {
            $page.find("ul:gt(0)").eq(index).find("li:first").addClass('active');
        }		
	};
	
	HotelHotCircle.prototype.itemClickHandler = function(ev){
        try {
            var data = $(ev.currentTarget).attr("data-data");
            data = JSON.parse(data);
            this.setValue(data);
            if (typeof this.opts.cbFn === 'function') {
                this.opts.cbFn(data, $(this.elem));
            }
            this.destroy();
        } catch (e) {
            throw new Error("数据格式错误" + e);
        }	
	};	
	
	HotelHotCircle.prototype.closeHandler = function(ev){
	    var target = ev.target;
        if (this.$elem[0] !== target) {
            try {
                var page = this.$xzqSqAddressContainer.find('.content .tab-page.active');
                var index = page.find('.second_tab li.active').attr('data-index');
                if(page.size() <= 0 || !$.isNumeric(index)){
                	this.destroy();
                	return ;
                }
                index = parseInt(index,10);
                var data = page.find('ul').eq(index + 1).find("li.active").data("data-data");
                data = JSON.parse(data);
                if(data && !$.isEmptyObject(data)) {
                  this.setValue(data);
                  if (typeof this.opts.cbFn === 'function') {
                    this.opts.cbFn(data, $(this.elem));
                  }               	
                }

            } catch (e) {}
            this.destroy();
        }
	};		
	
	HotelHotCircle.prototype.markKeyword = function(keyWord, name){
		var raRegExp = new RegExp(keyWord,"g");
        return name.replace(raRegExp, "<i style='color:red;font-style: normal;'>" + keyWord + "</i>");
	};
	
	HotelHotCircle.prototype.display = function(){
        this.setPos();
        $(document.body).append(this.$xzqSqAddressContainer);
        this.$xzqSqAddressContainer.css("visibility", "visible");		
	};
	
	HotelHotCircle.prototype.hide = function(){
		this.destroy();	
	};	
	
	HotelHotCircle.prototype.setPos = function(){
        var point = $(this.elem).offset();
        if(!this.$xzqSqAddressContainer){
        	return ;
        }
        this.$xzqSqAddressContainer.css({
            "left": point.left,
            "top": point.top + $(this.elem).outerHeight()
        });		
	};	
	
	HotelHotCircle.prototype.isBlank = function(s){
		if(s == null){
			return true;
		}
		return $.trim(s) === "";
	};	
	
	HotelHotCircle.prototype.setValue = function(data){
		if(typeof data !== "object" || data == null){
			return ;
		}
		var simple = this.opts.simpleData;
		this.$elem.val(data[simple.name]);
		$("#"+this.opts.hiddenName).val(data[simple.id]);
	};
		
	module.exports = HotelHotCircle;
});
