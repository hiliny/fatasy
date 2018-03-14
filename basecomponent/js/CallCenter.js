/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define(function(require,exports,module){
    var Common = require("../js/Common");
    /**
     * 共公属性
     */
    var defaultOpts = {
    	setPosition:[-20,150],
        width:154, //宽度
        stateWidth:2, //数据状态一排展示的个数;
        itemWidth:3, //图标展示的一排展示的个数
        phoneNum:"", //电话号码
        defaultItems:[
        	//默认的图标展示个数
        	{"id":"callcenter1","icon":"&#xe650;","value":"签入"},
		    {"id":"callcenter2","icon":"&#xe64d;","value":"签出"},
		    {"id":"callcenter3","icon":"&#xe671;","value":"示忙"},
		    {"id":"callcenter4","icon":"&#xe658;","value":"保持"},
		    {"id":"callcenter5","icon":"&#xe657;","value":"静音"},
		    {"id":"callcenter6","icon":"&#xe675;","value":"呼转"},
		    {"id":"callcenter7","icon":"&#xe6ea;","value":"拨打"},
		    {"id":"callcenter8","icon":"&#xe651;","value":"监听"},
		    {"id":"callcenter9","icon":"&#xe66f;","value":"回复"},
		    {"id":"callcenter10","icon":"&#xe64c;","value":"外呼"},
		    {"id":"callcenter11","icon":"&#xe686;","value":"评价"},
		    {"id":"callcenter12","icon":"&#xe68a;","value":"自动催单"} 
        ],
        addItems:[], //添加的图标展示个数
        setRadioState:[0,0], //设置两个小圆点的状态，0红色，1绿色
        setStates:{},  //默认的title展示个数
        setSelectData:[
        	//select下拉框的值
        	{id:"s001",value:"选择"},
        	{id:"s002",value:"后续"},
        	{id:"s003",value:"小休"},
        	{id:"s004",value:"培训"},
        	{id:"s005",value:"会议"},
        	{id:"s006",value:"面谈"},
        	{id:"s007",value:"用餐"}
        ],
        changeRestFn:null,//对外提供select选择里状态的方法
        btnClickFn:null,//对外提供点击图标的方法
        alertLayerFn:null//对外提供双击电话号码的方法
    };

    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function CallCenter(options) {
        this.id = Common.cid("CallCenter");
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.phoneNum=this.opts.phoneNum;
        if($.type(this.opts.changeRestFn) !== "function"){
            this.opts.changeRestFn = null;
        }
        if($.type(this.opts.btnClickFn) !== "function"){
            this.opts.btnClickFn = null;
        }
        if($.type(this.opts.alertLayer) !== "function"){
            this.opts.alertLayer = null;
        }
        this.init();
    }

    /**
     * 初始化加载
     */
    CallCenter.prototype.init = function() {
    	this.$container=$('<div class="vetech-call-center"></div>');
    	this.$ccIcon=$('<div class="cc-header layui-clear"></div>');
        this.$container.append(this.$ccIcon);
        var lr=this.opts.setPosition[0]+"px";
        var lt=this.opts.setPosition[1]+"px";
        this.$container.css({right:lr,top:lt});
        $(document).find("body").append(this.$container);
    };


    /**
     * 加载数据
     * @param callback
     */
    CallCenter.prototype.load = function(callback) {
    	if(this.opts.setStates.state){
    		this.titleData=this.opts.setStates.value ||[];
    	}else{
    		this.titleData=[];
    	}
        if(this.opts.addItems){
        	var array=this.opts.defaultItems.concat(this.opts.addItems);
        	this.items = array;
        }else{
        	this.items = this.opts.defaultItems;
        }
        
        this.selectData=this.opts.setSelectData || [];
        this.render();
    };
    
    /**
     * 渲染数据
     */
    CallCenter.prototype.render = function() {
    	this.$ccContent=$('<div class="cc-content"></div>');
    	var $ccTelHeader=$('<div class="cc-tel-head">'+
						'<div class="cc-tel-search">'+
						'<div class="layui-inline cc-color-state">'+
						'<div class="cc-tel-default"></div>'+
						'<div class="cc-tel-default" style="margin-top: 6px;"></div>'+
						'</div>'+
						'<input type="text" placeholder="来电号码…" class="layui-inline input-phone">'+
						'<a href="javascript:;" class="cc-close layui-inline"></a>'+
						'</div>'+
						'</div>');
		var $ccTelCon=$('<div class="cc-tel-con"></div>');
		
    	var swidth=(100/this.opts.itemWidth).toFixed(2)+"%";
    	var $ul2=$('<ul class="ctc-sort layui-clear"></ul>');
    	for(var j = 0 , len1 = this.items.length;j<len1;j++){
        	var icon=this.items[j].icon,
        		id=this.items[j].id,
        		name=this.items[j].value;
            var $li=$('<li id="'+id+'" style="width:'+swidth+'"><i class="icon iconfont">'+icon+'</i><p>'+name+'</p></li>');
            $li.data("data2",this.items[j]);
            $ul2.append($li);
       	}
    	
    	$ccTelCon.append($ul2);
    	var $selectRest=$('<div class="cc-select"></div>');
    	var $select=$('<select></select>');
    	for(var k=0,len2=this.selectData.length;k<len2;k++){
    		var sid=this.selectData[k].id,
    		    sname=this.selectData[k].value,
                $option=$('<option value='+sid+'>'+sname+'</option>');
            $option.data(this.selectData[k]);
            $select.append($option);
    	}
    	$selectRest.append($select);
    	$ccTelCon.append($selectRest);
    	this.$ccContent.append($ccTelHeader).append($ccTelCon);
    	this.$container.append(this.$ccContent);
    	this.reloadRender(); 
    	this.setPhoneNumber(this.phoneNum);
        this.bindEvent(); 
    };
    

    /**
     * 绑定事件
     */
    CallCenter.prototype.bindEvent=function(){
        var _this=this;
        this.$ccContent.find(".input-phone").on("dblclick",function(){
        	if($(this).val()){
        		$(this).select();
        		if(_this.opts.alertLayerFn){
					_this.opts.alertLayerFn($(this).val());
				}
        	} 
        });
        /*调用小圆点当前显示状态的方法*/
        this.setRadioState(this.opts.setRadioState);
        this.$container.find(".cc-select").on("change","select",function(){
            _this.setRestValue($(this).children('option:selected').data());
        });
        
        /*点击没有disabled类的图标*/
        this.$container.find(".ctc-sort").on("click","li:not(.disabled)",function(){
            _this.clickBtn($(this).data("data2"));
        });
        
		/*点击关闭的效果*/
		this.$container.find(".cc-close").on("click",function(){
			_this.$ccContent.find(".cc-tel-con").slideUp("fast").end().find(".cc-tel-head").animate({
	            width:"0px",
	            opacity:"0"
	        },500).fadeOut("1000");
	        _this.$ccIcon.show();
	        _this.phoneCallIn(_this.opts.telCalling);
		});
		
		this.$container.on("mouseenter",function(){
			if(_this.$ccIcon.is(":visible")){
				_this.$container.animate({
		            right:"2px"
		        },100);
			}
			
		}).on("mouseleave",function(){
			if(_this.$ccIcon.is(":visible")){
				_this.$container.animate({
		            right:"-20px"
		        },100);
			}
			
		});
		
		/*点击展开的效果*/
		this.$ccIcon.on("click",function(){
			_this.$ccIcon.removeClass("active").hide();
			_this.$ccContent.find(".cc-tel-head").show().animate({
	            width:_this.opts.width+"px",
	            opacity:"1"
	        },500).end().find(".cc-tel-con").animate({
	            width:_this.opts.width+"px"
	        },500).slideDown("slow");
			
		});	
    };

    /**
     * 重新渲染标题title数据
     */
    CallCenter.prototype.reloadRender = function() {
    	var _this=this;
    	if(this.$ccContent.find(".ctc-title").length>0){
    		this.$ccContent.find(".ctc-title").remove();
    	}
    	if(this.opts.setStates.state){
    		this.titleData=this.opts.setStates.value ||[];
    	}else{
    		this.titleData=[];
    	}
    	if(this.titleData.length>0){
    		var $li2=null;
    		var twidth=(100/this.opts.stateWidth).toFixed(2)+"%";
    		var $ul1=$('<ul class="ctc-title layui-clear"></ul>');
	        for(var i = 0 , len = this.titleData.length;i<len;i++){
	        	var name=this.titleData[i].name,
	        		num=this.titleData[i].num,
	        		alink=this.titleData[i].alick ||"";
	        		if(alink){
	        			$li2=$('<li style="width:'+twidth+'">'+name+'：<a href="javascript:;" class="tt-alink">'+num+'</span></li>');
	        		}else{
	        			$li2=$('<li style="width:'+twidth+'">'+name+'：<span>'+num+'</span></li>');
	        		}
	        	$li2.data("data1",this.titleData[i]);
	            $ul1.append($li2);
	        }
	        this.$ccContent.find(".cc-tel-con").prepend($ul1);
    	}
    	
    	this.$container.find(".ctc-title").on("click",".tt-alink",function(){
			_this.clickBtn($(this).parent().data("data1"));
		});
    };
    
    
   /**
    * 设置输入框里的电话号码
    * @param {Object} number 手机号码
    */
    CallCenter.prototype.setPhoneNumber = function(number){
		this.phoneNum = number;
		this.$ccContent.find(".input-phone").val(this.phoneNum);
	};
	
	/**
	 * 设置小圆点的状态
	 * @param {Object} array 默认[0,0]
	 */
    CallCenter.prototype.setRadioState = function(array){
        for(var i=0,len=array.length;i<len;i++){
        	if(array[i]===1){
				this.$container.find(".cc-color-state").children().eq(i).addClass("active");
			}else{
				this.$container.find(".cc-color-state").children().eq(i).removeClass("active");
			}
        }
	};

   /**
    * 改变select下拉框的值并给予回调函数赋值
    * @param {Object} data //当前对象值
    */
    CallCenter.prototype.setRestValue = function(data){
		if(this.opts.changeRestFn){
			this.opts.changeRestFn(data);
		}
	};

	/**
	 * 点击容器上的li
	 * @param {Object} //当前对象值
	 */
	CallCenter.prototype.clickBtn = function(data){
		if(this.opts.btnClickFn){
			this.opts.btnClickFn(data);
		}
	};
	
	/**
	 * 正在时通话时需要调用的方法
	 * @param {Object} boolen//true 或者false
	 */
	CallCenter.prototype.phoneCallIn = function(boolen){
		if(boolen){
			this.$ccIcon.addClass("active");
		}else{
			this.$ccIcon.removeClass("active");
		}
		
	};
	
    return CallCenter;
});