/**
 * @作者:hejie
 * @描述: 文件上传控件
 * @linc: MIT
 */

define(function(require,exports,module){
	var $ = window.jQuery;
	var layui = window.layui;
	
	var defaultOptions = {
		autoUpload:false,
		formAcceptCharset:"UTF-8",
		minFileSize:0,
		maxFileSize:3072000,
		dataType: 'json',
		url:'/webcomponent/fileupload/save?notitle=1',
		acceptFileTypes:'',
		messages:{
			acceptFileTypes:'请选择正确的文件格式',
			maxFileSize:'文件太大，上传文件不能超过3072000字节',
			minFileSize:'文件太小，上传文件不能小于0字节'
		}
	};
	
	function uploadFiles(elem,options){
		this.elem = elem;
		this.$elem = $(elem);
		this.opts = $.extend(true, {}, defaultOptions,options);
		this.init();
	}
	
	uploadFiles.prototyp.init = function(){
		
	};
	
	uploadFiles.prototyp.render = function(){
		
	};	
	
	uploadFiles.prototyp.show = function(){
		
	};
	
	uploadFiles.prototyp.destroy = function(){
		
	};	
	
	
	
});
