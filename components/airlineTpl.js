/**
 * Created by sing on 2018/3/1.
 * @描述:机票航线选择控件
 */
define(function(require,exports,module){
    require("vue2");
    var veUtil = require("/static/plugins/core/util/VeUtil.js");
    var lv = require("/static/plugins/vue/LVForm.js");
    var queryUrl = "/cdsbase/kj/cds/cityhzl/getGnGjCity?";
    var app = null,queryObj = {
        gngj:"1",
        cityName:""
    };
    var cbFn,choosedFn,choosedData;
    var _choosedList = [],_cityList = [];
    $(function(){
        cbFn = $("#cbFn").val();
        choosedFn = $("#choosedFn").val();
        window.parent[choosedFn] &&(choosedData = window.parent[choosedFn]());
        app = new Vue({
            el:"#app",
            data:{
                tid:null,
                lastCondition:'',
                q:queryObj,
                choosedCity:[],
                cityList:_cityList,
                filterCityList:[]
            },
            watch:{
                "q.gngj":function(){
                    this.filterCityList.splice(0,this.filterCityList.length);
                    $("#weiXuan").empty();
                    getCityList();
                }
            },
            mounted:function(){
                layui.form.render();
                lv.listenFormEvent(this);
                initSelectedData();
                getCityList();
            },
            updated:function(){
                layui.form.render();
            },
            methods:{
                chooseItem:function(){
                    var id = $("#weiXuan").val();
                    $("#yiXuan").prepend($("#weiXuan option:selected").clone());
                    $("#weiXuan option:selected").remove();
                    this.updateChoosedData();
                },
                removeItem:function(){
                    var id = $("#yiXuan").val(),one = null,_this = this;
                    $("#yiXuan option:selected").each(function(i,n){
                         var tp = JSON.parse($(n).attr("ogg"));
                         if(tp.gngj === _this.q.gngj){
                             $("#weiXuan").prepend($(this).clone());
                         }
                    });
                    $("#yiXuan option:selected").remove();
                    this.updateChoosedData();
                },
                emptyChoose:function(){
                    var _this = this;
                    $("#yiXuan option").each(function(i,n){
                        var tp = JSON.parse($(n).attr("ogg"));
                        if(tp.gngj === _this.q.gngj){
                            $("#weiXuan").prepend($(this).clone());
                        }
                    });
                    $("#yiXuan option").remove();
                    this.updateChoosedData();
                },
                updateChoosedData:function(){
                    var choose = [];
                    $("#yiXuan option").each(function(i,n){
                        var item = JSON.parse($(this).attr("ogg"));
                        choose[choose.length] = item.nbbh;
                    });
                    choosedData = choose.length?choose.join(","):"";
                },
                sureBack:function(){
                    var choose = [];
                    $("#yiXuan option").each(function(i,n){
                        var item = JSON.parse($(this).attr("ogg"));
                        choose[choose.length] = item;
                    });
                    window.parent[cbFn] && (window.parent[cbFn](choose));
                },
                keySearch:function(){
                    var _this = this;
                    var _filterList = [],keyWord = _this.q.cityName,tempArray = _this.cityList.slice();
                    var city,citybh;
                    if(this.lastCondition == keyWord){
                        return ;
                    }
                    if(this.tid){
                        window.clearTimeout(this.tid);
                        this.tid = null;
                    }
                    $("#weiXuan").empty();
                    this.tid = setTimeout(function(){
                        if(keyWord === ""){
                            _filterList = tempArray;
                        }else{
                            for(var i= 0,len = tempArray.length;i<len;i++){
                                city = tempArray[i].dlmc||"";
                                citybh = tempArray[i].nbbh||"";
                                if((city.indexOf(keyWord)>-1 || citybh.indexOf(keyWord.toUpperCase())>-1)){
                                    _filterList[_filterList.length] = tempArray[i];
                                }
                            }
                        }
                        if(choosedData !==""){
                            for(var j=_filterList.length-1;j>=0;j--){
                                if(choosedData.indexOf(_filterList[j].nbbh)>=0){
                                    _filterList.splice(j,1);
                                }
                            }
                        }
                        _this.renderItems(_filterList);
                        _this.lastCondition = keyWord;
                    },400);
                },
                renderItems:function(arr){
                    var dom = document.createDocumentFragment();
                    var $dom = $(dom);
                    var tmpl = "<option value='{value}' ogg='{ogg}'>{dlmc}({dlmcjp})</option>",temp = null;
                    for(var i=0,len=arr.length;i<len;i++){
                        temp = tmpl.replace(/\{value\}/g,arr[i].bh).replace(/\{ogg\}/g,JSON.stringify(arr[i])).replace(/\{dlmc\}/g,arr[i].dlmc||"").replace(/\{dlmcjp\}/g,arr[i].dlmcjp||"");
                        $dom.append(temp);
                    }
                    $("#weiXuan").append($dom);
                }
            }
        });
    });

    //获取 国内|国际城市的列表
    function getCityList(){
        //nbbh 三字码 dlmc 城市名称
        var toUrl = queryUrl +"gngj="+queryObj.gngj+"&nbbh="+"&dlmc="+"&_mid="+Math.floor(Math.random()*1000);
        var index = veUtil.load();
        $.ajax({
            type:"GET",
            url:toUrl,
            dataType:"json",
            success:function(resposne){
                veUtil.unload(index);
                _cityList = resposne.result||[];
                var _filterList = _cityList.slice();
                for(var i=_filterList.length-1;i>=0;i--){
                    if(_filterList[i].nbbh && choosedData.indexOf(_filterList[i].nbbh)>-1){
                        _filterList.splice(i,1);
                    }
                }
                Vue.set(app,"cityList",_cityList);
                Vue.set(app,"filterCityList",_filterList);
            },
            error:function(a,b,c){
                veUtil.unload(index);
            }
        });
    }

    //回显初始化数据
    function initSelectedData(){
        if(!choosedData) return ;
        var toUrl = queryUrl +"gngj="+"&nbbh="+choosedData+"&dlmc="+"&_mid="+Math.floor(Math.random()*1000);
        $.ajax({
            type:"GET",
            url:toUrl,
            dataType:"json",
            success:function(resposne){
                var _selectList = resposne.result||[];
                Vue.set(app,"choosedCity",_selectList);
            },
            error:function(a,b,c){
            }
        });
    }

});
