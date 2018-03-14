/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 常用工具类
 * @linc: MIT
 *
 */
define(function(require,exports,module){

	function log(msg){
		if(console && console.log) console.log(msg);
	}
	
	function error(msg){
		if(console && console.error) console.error(msg);
	}
	
	function cid(prefix){
		return (prefix + "VComponents") + String(Math.random()).replace(/\D/g,""); 
	}
	
	function nodeError($node){
		error("[" + $node.selector + "] can't find element,ensure page loaded!");
	}

	function tplError(msg){
		throw new Error("模板加载异常。" + (msg||""));
	}

    /**
	 * 触发input的事件
     * @param dom
     */
	function triggerInput(dom){
		if(!dom) return;
        var originalDom = dom,
            tagName = originalDom.tagName.toUpperCase(),
            userAgent = window.navigator.userAgent.toLowerCase(),
            ie =  /(msie\s|trident.*rv:)([\w.]+)/.test(userAgent),
            firefox = userAgent.indexOf("firefox")>=0,
            eventType = (tagName === "SELECT")?"change":"click",
            ev = document.createEvent("HTMLEvents");
        if((ie || firefox) && (tagName==="INPUT")) eventType = "change";
        ev.initEvent(eventType,true,true);
        originalDom.dispatchEvent(ev);
	}


	function loadTpl(url,callback){
		$.ajax({
			type:"get",
			url:url,
			dataType:"html",
			success:function(data){
				callback("success",data);
			},
			error:function(msg){
				callback("error");
			}
		});
	}
	
	return {
		log:log,
		error:error,
		cid:cid,
		nodeError:nodeError,
		tplError:tplError,
        loadTpl:loadTpl,
        triggerInput:triggerInput
	};
	
});