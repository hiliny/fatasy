/**
 * @作者:hejie
 * @描述: 航班号搜索控件
 * @linc: MIT
 *
 */

define(function(require,exports,module){
	var defaultOptions = {
        optData : {},
        title:"输入接机航班号，如CZ6143",
        simpleData : {
            "flightNum" : "hbh",
            "cfcsmc" : "cfcsmc",
            "ddcsmc" : "ddcsmc",
            "cfjcmc":"qfjcmc",
            "ddjcmc":"jljcmc",
            "cfsj":"cftime",
            "ddsj":"ddtime",
            "cfhzl":"cfhzl",
            "ddhzl":"ddhzl"
        }
   };
   
   function FlightSearch(elem,options,cbFn){
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true,{},defaultOptions,options);
        this.cbFn = cbFn || $.noop;
        this.timerId = null;  		
        this.init();
   }
   
   FlightSearch.prototype = {
   		init:function(){
            var _this = this;
            this.$container = $('<div class="vetech-userCar-container"></div>');
            this.$container.append('<p>'+this.opts.title+'</p>'+'<p class="noValue">未能查询到相关航班</p>'+'<ul></ul>');
            $(document.body).append(this.$container);
            this.$noVal = this.$container.find(".noValue");
            this.$ul = this.$container.find("ul"); 
            this.bindEvent();
   		},
   		loadData:function(keySearchData){
            var _this = this,
            sjId = this.opts.sjId,
            cfcity = this.opts.cfcity,
            ddcity = this.opts.ddcity,
            sjData = $('#'+sjId).val()||"",
            typeValue = this.opts.typeValue;
            var loadDatas = $.extend({},this.opts.optData,{
                "hbh":keySearchData.toUpperCase(),
                "cfcity": cfcity?cfcity.toUpperCase():"",
                "ddcity": ddcity?ddcity.toUpperCase():"",
                "qfsj":sjData,
                "pt":_this.opts.pt
            });
            if(this.opts.type === 1){ 
                this.data = typeValue;
            }else{
                $.ajax({
                    type: "get",
                    url: _this.opts.dataUrl,
                    data:loadDatas,
                    dataType: "json",
                    success:function(data){
                        _this.data = data.result;
                        _this.$ul.empty();
                        _this.keySearchData = keySearchData;
                        _this.render();
                    }
                });
            }   			
   		},
   		render:function(){
   			var _this = this,sd = this.opts.simpleData; 
   			var setColData,reg,changeStyle,cfhzl,ddhzl,cfsj,ddsj,cfcsmc,ddcsmc,cfcsbt,ddcsbt;
   			if($.type(this.data)!=="array") throw new Error("数据格式错误");
   			if(this.data.length === 0){
   				_this.hide();
   				_this.cbFn({});
   				return ;
   			}else{
   				this.$noVal.hide();
   			}
   			this.$ul.empty();
   			for(var i=0,len=this.data.length;i<len;i++){
   				this.$li = $('<li></li>');
   				if(this.keySearchData){
   					this.newkeySearchData = this.keySearchData;
                    if(this.keySearchData.substr(0,1)==="*"){
                        this.newkeySearchData=this.keySearchData.replace(/\*/,"\\*");
                    }
                    reg = new RegExp(this.newkeySearchData,"ig");
                    changeStyle = "<i>"+this.keySearchData.toUpperCase() +"</i>";   					
   				}
                setColData = this.data[i][sd.flightNum].replace(reg,changeStyle);
                cfhzl = this.data[i][sd.cfhzl]||"";
                ddhzl = this.data[i][sd.ddhzl]||"";
                cfsj = this.data[i][sd.cfsj]||'';
                ddsj =this.data[i][sd.ddsj]||'';
                cfcsmc = this.data[i][sd.cfcsmc];
                ddcsmc = this.data[i][sd.ddcsmc];
                cfcsbt = (cfcsmc.length>4 && cfcsmc.indexOf("（")>0)?(cfcsmc.slice(0,cfcsmc.indexOf("（"))):cfcsmc;
                ddcsbt =  (ddcsmc.length>4 && ddcsmc.indexOf("（")>0)?(ddcsmc.slice(0,ddcsmc.indexOf("（"))):ddcsmc;
                this.dl = '<dl class="left">'+
                    '<dt><em title="{ctitle}">'+cfcsbt+'</em><em>'+cfsj+'</em></dt>'+
                '<dd>'+this.data[i][sd.cfjcmc]+cfhzl+'</dd>'+
                '</dl>'+
                '<dl class="mid">'+
                    '<dt>'+setColData+'</dt>'+
                    '<dd></dd></dl><dl class="right"><dt><em title="{dtitle}">'+ddcsbt+'</em><em>'+ddsj+'</em></dt>'+
                '<dd>'+this.data[i][sd.ddjcmc]+ddhzl+'</dd></dl>';
                this.dl = this.dl.replace(/\{ctitle\}/g,cfcsmc).replace(/\{dtitle\}/g,ddcsmc);
                this.$dl = $(this.dl);
                this.$li.append(this.$dl);
                this.$li.data("data",this.data[i]);			
                this.$ul.append(this.$li);
   			}
            this.$container.append(this.$ul);  				
   		},
   		bindEvent:function(){
            var _this = this;
            this.$container.on("mouseover","ul>li",$.proxy(this.itemMouseOver,this));
            this.$container.on("click","ul>li",$.proxy(this.itemClick,this));
            this.$container.on("mousedown",$.proxy(this.containerMouseDown,this));
            this.$container.on("mouseup",$.proxy(this.containerMouseUp,this));
            this.$container.on("click",$.proxy(this.stopEvent,this));          
            $(document).on("mousedown",$.proxy(this.bodyClick,this));
   		},
   		show:function(){
            this.containerPos();
            this.$container.show();   			
   		},
   		hide:function(){
            this.$container.hide();
            //this.$ul.empty();   			
   		},
   		stopEvent:function(ev){
			return false;			
   		},
   		waitDo:function(fn, wait){
            var _this = this;
            if (this.timerId) {
                window.clearTimeout(this.timerId);
                this.timerId = null;
            }
            this.timerId = window.setTimeout(function() {
                fn();
                _this.timerId = null;
            },wait);  
            return this.timerId;
   		},
        containerPos:function(){
            var elemPos = this.$elem.offset(),
            elemHeight = this.$elem.outerHeight(false);
            this.$container.css({"width":this.opts.width,height:"auto",maxHeight:260});
            this.$container.css("left",elemPos.left+ "px");
            this.$container.css("top",elemPos.top + elemHeight + "px");
        },   		
   		itemClick:function(ev){
   			var dataVal = $(ev.currentTarget).data("data"),
   			flightNum = this.opts.simpleData.flightNum,
   			wValData = dataVal[flightNum];
            this.stopEvent(ev);
            this.$elem.val(wValData);
            this.hide();
            this.cbFn(dataVal);
   		},
   		itemMouseOver:function(ev){
   			$(ev.currentTarget).addClass("active").siblings().removeClass("active");
   		},
   		containerMouseDown:function(ev){
            if(document.all && !document.addEventListener){
                this.$container[0].setCapture && this.$container[0].setCapture();
            }
            return false;  			
   		},
   		containerMouseUp:function(){
   			this.$container[0].releaseCapture && this.$container[0].releaseCapture();
   		},
   		bodyClick:function(ev){
   			var target = ev.target;
   			if(target !== this.elem) this.hide();
   		}
   };
   
   module.exports = FlightSearch;
   		
});
