/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 酒店城市省份多选控件
 * @linc: MIT
 */
define(function(require,exports,module){

    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        simpleData: {
            id: "id",
            name: "name"
        },
        splitStr: "," //分割符
    };

    /**
     * 构造函数
     * @param {Object} options
     * @param {Object} cbFn 回调函数
     */
    function ProvinceAndCity(elem, options, cbFn) {
        this.id = "vetech-provinceAndCity-" + String(Math.random()).replace(/\D/g, "");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.callback = cbFn || $.noop; //回调函数
        this.$hiddenInput = $("#" + (this.opts.hiddenName || ""));
        this.init();
    }

    /**
     * 初始化整个容器
     */
    ProvinceAndCity.prototype.init = function () {
        //外层容器
        this.$container = $('<div class="vetech-provinceAndCity-container">');
        //toolbar
        this.$toolbar = $('<div class="toolbar"></div>');
        this.$toolbar.append('<strong>选择地区</strong><input type="button" value="确定" />');
        //checkedArea
        this.$checkedArea = $('<div class="checkedArea clear">');
        //content
        this.$content = $('<div class="content clear">');
        //cityPanel
        this.$cityPanel = $('<div class="cityPanel">');

        this.$container.append(this.$toolbar).append(this.$checkedArea).append(this.$content);

        $(document.body).append(this.$container);

        this.addEvent();
        this.bindEvent();

    };

    /**
     * 加载数据
     * @param url  可以传一个url地址，也可以传一个数据对象
     * @param callback 回调函数
     */
    ProvinceAndCity.prototype.load = function(url,callback){
        callback = (callback && $.type(callback) === "function") ? callback :function(){};
        var _this = this;
        if($.type(url) === "string"){
            $.ajax({
                url:url,
                data:this.opts.qDatas,
                success:function(data){
                    _this.opts.data = data;
                    callback.call(_this);
                }
            });
        }else{
            this.opts.data = url;
            callback.call(_this);
        }
    };

    /**
     * 渲染
     */
    ProvinceAndCity.prototype.render = function () {
        var provinceData = this.opts.data || [];
        var _this = this;
        $.each(provinceData, function (i, item) {
            var $span = $(addItem.call(_this, item));
            $span.data("citys", item.citys || []); //省对应的城市数据
            $span.find(".province").data("data", item); //省的数据
            _this.$content.append($span);

        });
    };

    ProvinceAndCity.prototype.writeValue = function () {
        var _this = this;
        if (this.$hiddenInput.length && this.$hiddenInput.val()) {
            var value = this.$hiddenInput.val();
            value = value.split(this.opts.splitStr);
            //过滤数据，先找出省份，再找出城市
            var provinceDatas = [],
                cityDatas = {}, //城市的用对象字面量来表示
                values = [], //文本框中要显示的信息
                indexName = this.opts.simpleData.id;

            for (var i = 0, len = value.length; i < len; i++) {
                var id = value[i];

                innerNoop://命名内圈语句
                    for (var j = 0, len2 = this.opts.data.length; j < len2; j++) {
                        var provinceItem = this.opts.data[j];
                        if (id === provinceItem[indexName]) {
                            provinceDatas.push(provinceItem);
                            _this.addCheckedItem.call(_this, provinceItem, "province");
                            values.push(provinceItem[_this.opts.simpleData.name]);
                            break;
                        } else {
                            var citys = provinceItem.citys; //城市
                            for (var k = 0, len3 = citys.length; k < len3; k++) {
                                var city = citys[k];
                                if (id === city[indexName]) {
                                    cityDatas[city.pid] = cityDatas[city.pid] || [];
                                    cityDatas[city.pid].push(city);
                                    _this.addCheckedItem.call(_this, city, "city");
                                    values.push(city[_this.opts.simpleData.name]);
                                    break innerNoop;
                                }
                            }
                        }
                    }
            }

            this.$elem.val(values.join(this.opts.splitStr));

            //省份回调
            $.each(provinceDatas, function (i, provinceValue) {
                var $span = $("#" + provinceValue[_this.opts.simpleData.id]),
                    $input = $span.find(".province");
                $span.css("color", "orange");
                setChecked($input,true);
                _this.$container.trigger("choose.provinceAndCity", $input);
            });

            //城市进行回调
            $.each(this.$container.find(".province"), function (i, input) {
                var $input = $(input),
                    currData = $input.data("data"),
                    $span = $input.parents(".item"),
                    checkedCitys = cityDatas[currData[_this.opts.simpleData.id]];
                if (checkedCitys) {
                    $span.data("checkedData", checkedCitys);
                    $span.css("color", "orange");
                }
            });
        }
    };

    ProvinceAndCity.prototype.bindEvent = function () {
        var _this = this;
        this.$container.on("click.provinceAndCity", "span.item", function (ev) {
            //由于cityPanel加在span中,所以点击cityPanel中的内容时，也会出发该事件，所以在这里要判断一下
            if ($(ev.target).hasClass("item") || $(ev.target).hasClass("collapse")) {
                _this.$container.find(".detail").hide();
                _this.$container.trigger("expand.provinceAndCity", this);
            }
        }).on("mouseleave.provinceAndCity", "span.item", function () {
            _this.$container.trigger("collapse.provinceAndCity", this);
        }).on("click.provinceAndCity", "input[type='checkbox']", function () {
            _this.$container.trigger("choose.provinceAndCity", this);
        }).on("click.provinceAndCity", ".expand", function () {
            _this.$container.trigger("collapse.provinceAndCity", $(this).parents(".item"));
        });

        this.$checkedArea.on("click.provinceAndCity", ".close", function () {
            _this.$container.trigger("delete.provinceAndCity", $(this).parent());
        });

        this.$toolbar.on("click.provinceAndCity", "input", function () {
            _this.$container.trigger("sure.provinceAndCity");
            _this.hide();
        });


    };

    /**
     * 添加自定义事件
     */
    ProvinceAndCity.prototype.addEvent = function () {
        var _this = this;
        //自定义展开函数(点击省份，展开城市)
        this.$container.on("expand.provinceAndCity", function (e, span) {
            var $span = $(span);
            $span.find(".detail").show();
            _this.$cityPanel.html("");
            $.each($span.data("citys"), function (i, item) {
                var $label = $('<label id="' + item[_this.opts.simpleData.id] + '" class="ellipsis" title="' + item[_this.opts.simpleData.name] + '"><input type="checkbox" />' + item[_this.opts.simpleData.name] + '</label>');
                $label.find("input").data("data", item);
                _this.$cityPanel.append($label);
            });
            //展开城市的时候，要进行回填
            if ($span.find(".province").is(":checked")) {
                var $inputs = _this.$cityPanel.find("input");
                setChecked($inputs,true);
                $inputs.attr("disabled","disabled");
            } else {
                var tempData = $span.data("checkedData") || [];
                $.each(tempData, function (i, item) {
                    setChecked(_this.$cityPanel.find("#" + item[_this.opts.simpleData.id]).find("input"),true);
                });
            }

            $span.append(_this.$cityPanel.show());
        });

        //自定义折叠函数（点击折叠，关闭城市弹出层）
        this.$container.on("collapse.provinceAndCity", function (e, span) {
            var $span = $(span);
            $span.find(".detail").hide().end().find(".cityPanel").hide();
        });

        //input checked事件
        this.$container.on("choose.provinceAndCity", function (e, input) {
            var $span = $(input).parents(".item"),
                $input = $(input),
                currData = $input.data("data"), //当前选择的input框对应的数据值
                $inputs;
            if ($input.hasClass("province")) {
                if ($input.is(":checked")) {
                    $inputs = _this.$cityPanel.find("input");
                    setChecked($inputs,true);
                    $inputs.attr("disabled","disabled");
                    $span.data("checkedData", []); //清除选中的data
                    _this.addCheckedItem.call(_this, currData, "province");
                } else {
                    $inputs = _this.$cityPanel.find("input");
                    setChecked($inputs,false);
                    $inputs.removeAttr("disabled");
                    $.each(_this.$checkedArea.find(".checkedItem"), function (i, item2) {
                        var $item = $(item2),
                            td = $item.data("data");
                        if (currData[_this.opts.simpleData.id] === td[_this.opts.simpleData.id]) $item.remove();
                    });
                }

            } else {
                var tempData = $span.data("checkedData") || [];
                if ($input.is(":checked")) {
                    //把选择的城市放入缓存
                    tempData.push(currData);
                    _this.addCheckedItem.call(_this, currData, "city");
                } else { //当没有选中的时候，要在数据缓存中过滤掉被取消勾选的数据
                    var newData = tempData;
                    tempData = [];
                    $.each(newData, function (i, item) {
                        if (currData[_this.opts.simpleData.id] !== item[_this.opts.simpleData.id]) {
                            tempData.push(item);
                        } else {
                            $.each(_this.$checkedArea.find(".checkedItem"), function (i, item2) {
                                var $item = $(item2),
                                    td = $item.data("data");
                                if (item[_this.opts.simpleData.id] === td[_this.opts.simpleData.id]) $item.remove();
                            });
                        }
                    });
                }
                $span.data("checkedData", tempData);
            }
        });

        //删除操作（拿到所有省的节点，判断当前删除的是不是省的数据，如果是省的数据，直接删除已经选择的节点，把该省对应的checkbox设置为不选中并执行choose.provinceAndCity函数，如果不是省的数据，则要遍历每个省下面的缓存已选中的城市，并踢出该城市）
        this.$container.on("delete.provinceAndCity", function (e, span) {
            var currData = $(span).data("data");
            $.each(_this.$container.find(".province"), function (i, input) {
                var $input = $(input);
                var tempData = $input.data("data");
                if (currData[_this.opts.simpleData.id] === tempData[_this.opts.simpleData.id]) {
                    setChecked($input,false);
                    _this.$container.trigger("choose.provinceAndCity", input);
                }

                var $pSpan = $input.parents(".item");
                var newData = [];
                $.each($pSpan.data("checkedData") || [], function (i, itemValue) {
                    if (itemValue[_this.opts.simpleData.id] !== currData[_this.opts.simpleData.id]) {
                        newData.push(itemValue);
                    }
                });
                $pSpan.data("checkedData", newData);
            });
            $(span).remove();
        });

        //确认操作
        this.$container.on("sure.provinceAndCity", function () {
            var resultData = [],
                ids = [],
                values = [];
            $.each(_this.$checkedArea.find(".checkedItem ") || [], function (i, item) {
                var itemValue = $(item).data("data");
                ids.push(itemValue[_this.opts.simpleData.id]);
                values.push(itemValue[_this.opts.simpleData.name]);
                resultData.push(itemValue);
            });

            _this.$elem.val(values.join(_this.opts.splitStr));
            _this.$hiddenInput.length && _this.$hiddenInput.val(ids.join(_this.opts.splitStr));
            //执行回调
            _this.callback(resultData);
        });

    };

    /**
     * 添加选择的项目
     * @param {Object} data
     * @param {Object} type
     */
    ProvinceAndCity.prototype.addCheckedItem = function (data, type) {
        var needAdd = true; //标记是否需要添加
        if (type === "province") {
            //先检查已经选择的数据中，是否有省内的城市，如果有省内城市，则清除
            var id = this.opts.simpleData.id;
            $.each(this.$checkedArea.find(".checkedItem"), function (i, item) {
                var $item = $(item),
                    tempData = $item.data("data");
                if (tempData.pid === data[id]) {
                    $item.remove();
                }else if(tempData[id] === data[id]){
                    needAdd= false;
                    return false;
                }
            });
        }
        needAdd &&  this.$checkedArea.append(createCheckedItem.call(this, data));
    };

    function createCheckedItem(data) {
        var $span = $('<span class="checkedItem ellipsis">' + data[this.opts.simpleData.name] + '<i class="close"></i></span>');
        $span.data("data", data);
        return $span;
    }

    /**
     *显示
     */
    ProvinceAndCity.prototype.show = function () {
        this.setPos();
        this.$container.css("visibility", "visible");
    };


    ProvinceAndCity.prototype.setPos = function () {
        var pointer = this.$elem.offset();
        this.$container.css({"left": pointer.left, "top": pointer.top + this.$elem.outerHeight()});
    };

    ProvinceAndCity.prototype.hide = function () {
        this.$container.css({"visibility": "hidden", "left": "-1000px", "top": "-1000px"});
    };

    ProvinceAndCity.prototype.destroy = function () {
        //移除该控件绑定的所有的事件
        this.clear();
        this.$container.remove();
    };

    ProvinceAndCity.prototype.clear = function(){
        this.$container.off(".provinceAndCity");
        this.$checkedArea.off(".provinceAndCity");
        this.$toolbar.off(".provinceAndCity");
    };


    /**
     * 添加item
     * @param {Object} item
     */
    function addItem(item) {
        return '<span class="item" id="' + item[this.opts.simpleData.id] + '">' +
            '<i class="collapse"></i>' + item[this.opts.simpleData.name] + '' +
            '<div class="detail">' +
            '<i class="expand"></i>' +
            '<label class="ellipsis"><input type="checkbox" class="province"  value="' + item[this.opts.simpleData.id] + '" />' + item[this.opts.simpleData.name] + '</label>' +
            '</div>' +
            '</span>';
    }

    /**
     * 设置选中
     * @param $inputs
     * @param state
     */
    function setChecked($inputs,state){
        $.each($inputs, function(i,input) {
            input.checked = state;
        });
    }
    
   return ProvinceAndCity;

});