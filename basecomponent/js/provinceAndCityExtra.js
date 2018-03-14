/**
 * Created by zh on 2017/8/11.
 * @desc:酒店身份城市多选控件封装
 */
define(function(require,exports,module){
	/**
	 * 初始化模块
	 */
	function init(){
		
		var ProvinceAndCity = require("../js/ProvinceAndCity.js");
		
	    var data = window.ssqx;
	    if(!data) console.log("ssqx数据获取失败");
	    
	    var provinceData = data[0].data,
	        cityData = data[1].data;
	
	    var newData = [];
	    $.each(provinceData, function(i,item) {
	        item.type = "p";
	        item.citys = getCitysByProvinceId(item.id,cityData);
	        newData.push(item);
	    });
	    data = null;
	    provinceData=null;
	    cityData=null;
	
	
	    $.fn.showProvinceAndCity = function(options,cbFn){
	
	        var pc = new ProvinceAndCity(this.get(0),options,cbFn);
	
	        pc.load(newData,function(){
	            this.render();
	            this.writeValue();
	        });
	
	        this.on("click",function(){
	            pc.show();
	        });
	    };
		
	}
	


    function getCitysByProvinceId(pId,cityData){
        var cityDatas = [];
        $.each(cityData, function(i,item) {
            if(item.pid === pId){
                item.type ="c";
                cityDatas.push(item);
            }
        });
        return cityDatas;
    }
    
    
    exports.init = init;

});
