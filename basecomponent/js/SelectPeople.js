/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define(function(require,exports,module){
    var Common = require("../js/Common");

    var defaultOpts = {
        hiddenPeople:null,
        hiddenChild:null,
        hiddenYear:null,
        qxCbFn:function(){},
        data:{"people":"5","child":"3","year":"17"}
    };

    function SelectPeople(elem,options,cbFn){
        this.id = Common.cid("CallCenter");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend({},defaultOpts,options);
        this.data=this.opts.data;
        this.cbFn = cbFn || $.noop;
        this.isShow = false;//默认隐藏
        this.people=2;
        this.child=0;
        this.year=[];
        this.$hiddenPeople =$('#'+this.opts.hiddenPeople);
        this.$hiddenChild =$('#'+this.opts.hiddenChild);
        this.$hiddenYear =$('#'+this.opts.hiddenYear);
        this.init();
    }

    var fn = SelectPeople.prototype;

    //初始化容器
    fn.init = function(){
        this.$container = $('<div class="vetech-xzperson-container" style="z-index:999"></div>');
        this.$navbox = $('<div class="navbox"></div>');
        this.$sortbox = $('<div class="sortbox"></div>');
        this.$childContent=$('<div class="xzperson-group clearfix"></div>');
        this.$container.append(this.$navbox);
        this.$container.append(this.$sortbox);
        $(document.body).append(this.$container);
        this.renderData();
    };

    //渲染数据
    fn.renderData = function(){
        var people=parseInt(this.data.people,10);
        var child=parseInt(this.data.child,10);
        if(people>0){
            var $ul=$("<ul></ul>");
            for(var i=1;i<people+1;i++){
                var data={"people":i,"child":"0","year":[]};
                var $li=$('<li title='+i+'成人+0儿童/间><span>'+i+'</span>成人+0儿童/间</li>');
                $li.data("liData",data);
                $ul.append($li);
            }
            var $more=$('<a class="xzperson-more" href="javascript:;">更多选择》</a>');
            this.$navbox.append($ul);
            this.$navbox.append($more);
            var html='<div class="xzperson-group clearfix">' +
                '<label>每间入住</label>'+
                '<div class="group-right"><div class="xzperson-input"><input type="text" id="peoplenum" value="2成人" data="2" readonly></div>'+
                '<div class="xzperson-input"><input type="text" id="childnum" value="0儿童" data="0" readonly></div>'+
                '</div></div>' +
                '<div class="group-foot">' +
                '<a class="xzperson-more" href="javascript:;">《常用选择 </a>' +
                '<div class="foot-btn">' +
                '<button class="btn-sure">确定</button>' +
                '<button class="btn-cancle">取消</button>' +
                '</div></div>';
                '</div></div>';
            this.$sortbox.append(html);
            this.createSelectNum("peoplenum",people);
            this.createSelectNum("childnum",child);
            this.bindEvent();
        }
    };

    //绑定事件
    fn.bindEvent = function(ev){
        var _this=this;
        //绑定navbox下的li元素点击事件
        this.$navbox.find("ul li").on('click', function(){
        	_this.liClickhandler($(this));
        });

        //绑定more元素点击事件
        this.$container.find(".xzperson-more").on('click', function(){
        	_this.moreClickhandler();
        });

        this.$sortbox.find(".xzperson-input input").on('click',function(){
            _this.$sortbox.find(".select-nav").hide();
            $(this).siblings(".select-nav").show();
            return false;
        });

        /*绑定sortbox下的li元素点击事件*/
        this.$sortbox.find(".xzperson-input .select-nav li").on('click',function(){
            _this.setValuehandler($(this));
        });

        /*确定按钮*/
        this.$sortbox.find(".btn-sure").on('click',function(){
            _this.year=[];
            _this.people=_this.$sortbox.find("#peoplenum").attr("data");
            _this.child=_this.$sortbox.find("#childnum").attr("data");
            var yearNum=_this.$childContent.find(".xzperson-input").length;
            if(yearNum>0){
                for(var i= 0;i<yearNum;i++){
                    _this.year.push(_this.$childContent.find(".xzperson-input").eq(i).find("input").attr("data"));
                }
            }else{
                _this.year=[];
            }

            _this.$elem.val(_this.people+"成人+"+_this.child+"儿童/间");
            _this.$hiddenPeople.val(_this.people);
            _this.$hiddenChild.val(_this.child);
            _this.$hiddenYear.val(_this.year);
            var cbfnData={"people":_this.people,"child":_this.child,"year":_this.year};

            if(_this.cbFn)_this.cbFn(cbfnData);
            _this.hide();
        });

        /*取消按钮*/
        this.$sortbox.find(".btn-cancle").on('click',function(){
            _this.opts.qxCbFn.call(_this);
            _this.hide();
        });

        //点击document关闭窗口
        $(document).on("click",function(ev){
      		var event=ev || window.event;
        	var target =event.target;
        	if(_this.elem !== target){
            	_this.hide();
        	}
        });
        //容器阻止冒泡
        this.$container.on("click",function(){return false;});
        this.$sortbox.on("click",function(){
            $(this).find(".select-nav").hide();
        });

    };


    /*展开伸缩的事件*/
    fn.moreClickhandler = function(){
        if(this.$navbox.is(":hidden")){
            this.$navbox.show();
            this.$sortbox.hide();
        }else{
            this.$navbox.hide();
            this.$sortbox.show();
        }
    };

    /*nav的下拉列表点击*/
    fn.liClickhandler = function(obj){
        var $this=$(obj);
        this.$elem.val($this.text());
        this.$hiddenPeople.val($this.data("liData").people);
        this.$hiddenChild.val($this.data("liData").child);
        this.$hiddenYear.val($this.data("liData").year);
        if(this.cbFn)this.cbFn($this.data("liData"));
        this.hide();
    };

    /**
     * 创建选择人数下拉列表
     * @param obj 作用的元素
     * @param num 需要循环的num
     */

    fn.createSelectNum=function(obj,num){
        var _this=this;
        var $select=$("<ul class='select-nav'></ul>");
        var text="",qdvalue= 0;
        if(obj==='peoplenum'){
            text="成人";qdvalue=1;
        }else{
            text="儿童";qdvalue=0;
        }
        for(var i=qdvalue;i<num+1;i++){
            var $li=$('<li data="'+i+'">'+i+text+'</li>');
            $select.append($li);
        }
        this.$sortbox.find("#"+obj).parent().append($select);
        $select.hide();
    };

    /**
     * 创建儿童个数
     * @param num 创建儿童年龄下拉列表个数
     */

    fn.createChildNum=function(num){
        var _this=this;
        num=parseInt(num,10);
        var year=parseInt(this.data.year,10);
        if(num>0){
            var $childLabel=$("<label>儿童年龄</label>");
            var $groupright=$('<div class="group-right"></div>');
            this.$childContent.append($childLabel);
            for(var i=0;i<num;i++){
                $groupright.append('<div class="xzperson-input" id="child'+i+'"><input type="text" value="≤1岁"  data="1" readonly></div>');
                var $select=$("<ul class='select-nav'></ul>");
                var text="";
                for(var j=1;j<year+1;j++){
                    if(j===1){
                        text="≤1岁";
                    }else{
                        text=j+"岁";
                    }
                    var $li=$('<li data="'+j+'">'+text+'</li>');
                    $select.append($li);
                }
                $groupright.find("#child"+i).append($select);
                $select.hide();
            }

            this.$childContent.append($groupright);

            /*绑定$childContent下的input点击事件*/
            this.$childContent.find(".xzperson-input input").on('click',function(){
                _this.$sortbox.find(".select-nav").hide();
                $(this).siblings(".select-nav").show();
                return false;
            });
            /*绑定$childContent下的li元素点击事件*/
            this.$childContent.find(".xzperson-input .select-nav li").on('click', function(){
            	
                _this.setValuehandler($(this));
            });

            this.$sortbox.find(".group-foot").before(this.$childContent);
        }

    };


    /**
     * 选择人数回填到下拉输入框
     * @param obj
     */
    fn.setValuehandler=function(obj){
        var $this=$(obj);
        if($this.parent().siblings().attr("id")==="childnum"){
            this.$childContent.children().remove();
            this.createChildNum($this.attr("data"));
        }
        $this.parents(".xzperson-input").find("input").val($this.text()).attr("data",$this.attr("data"));
        $this.parent().hide();
        return false;
    };


    /**
     * 显示
     */
    fn.show = function(){
        if(this.isShow) return;
        this.setPos();
        this.$container.css("visibility","visible");
        this.isShow = true;
    };

    /**
     * 隐藏
     */
    fn.hide = function(){
        if(!this.isShow) return;
        this.$container.css({"left":"-1000px","top":"-1000px","visibility":"hidden"});
        this.isShow = false;
    };


    /**
     * 计算控件出现的位置
     */
    fn.setPos = function(){
        var pointer = this.$elem.offset();
        this.$container.css({"left":pointer.left,"top":pointer.top + this.$elem.outerHeight()});
    };

    /**
     * 阻止冒泡
     * @param {Object} ev
     */
    fn.stopEvent = function(ev){
        ev = ev || window.event;
        if(ev.stopPropagation) ev.stopPropagation();
        else ev.cancelbubble = true;
    };
	
    return SelectPeople;
});