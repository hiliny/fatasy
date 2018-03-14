/**
 * Created by sing on 2017/12/25.
 * @描述：旅游目的地控件模板
 */
define(function(require,exports,module){
    require("ztree");
    var util = require("/static/plugins/core/util/VeUtil.js");
    var zTreeObj,setting,zNodes;
    var cbFn,choosedFn,choosedData = null;
    //存储前一次的搜索结果
    var preSearchNodes = [];
    setting ={
        async:{
            enable: true,
            url:"/travel/cpsa/mdddatatreecontroller/getTreeData",
            type:"GET",
            dataFilter:function(treeId, parentNode, responseData){
                return JSON.parse(responseData.result);
            }
        },
        view:{
            showLine:true,
            showIcon:false,
            fontCss:getSearchColor
        },
        check:{
            enable:true,
            chkStyle: "checkbox",
            chkboxType: { "Y": "p", "N": "p" }
        },
        callback:{
            onCheck:function(event, treeId, treeNode){
                tryCheckItem(treeNode);
            },
            onClick:function(event, treeId, treeNode){
                var dom = event.target||event.srcElement;
                $(dom).closest("li").find(".chk").trigger("click");
            },
            onAsyncSuccess:function(event, treeId, treeNode, msg){
                setTimeout(function(){
                    fillSelectedNodeBefore();
                },20);
            }
        }
    };
    /*
    zNodes =[{
        "name":"欧洲",
        "open":false,
        "id":"1",
        "children":[{
            "name":"法国",
            "id":"2",
            "open":false,
            "children":[{
                "name":"巴黎",
                "id":"10",
                "children":[{
                    "name":"卢浮宫",
                    "id":"12"
                }]
            }]
        },{
            "name":"德国",
            "id":"3"
        },{
            "name":"意大利",
            "id":"4"
        }]
    },{
        "name":"阿根廷",
        "open":false,
        "id":3
    }];*/
    //选择或反选路线
    function tryCheckItem(treeNode){
        var checkedNodes = zTreeObj.getCheckedNodes(true),leafNodes = [];
        //$.each(checkedNodes,function(i,n){
        //    if(n && !n.isParent) leafNodes.push(n);
        //});
        asyncTreeandItemsList(checkedNodes);
        $.each(checkedNodes,function(i,n){
            createLiItem(n,checkedNodes);
        });
    }

    //去掉右侧值列表中已被去掉的项
    function asyncTreeandItemsList(nodeList){
        var nowIds = [];
        $.each(nodeList,function(i,n){
            nowIds[nowIds.length] = n.id;
        });
        $("#itemUl li").each(function(){
            var id = $(this).data("data").id;
            if($.inArray(id,nowIds)<0){
                $(this).removeData("data");
                $(this).remove();
            }
        });
    }

    //构造选中项
    function createLiItem(node,checkedNodes){
        var isExit = false,tpl,$li,lineName;
        $("#itemUl li").each(function(){
            if($(this).data("data").id === node.id) isExit = true;
        });
        if(isExit) return ;
        tpl = "<li title='{line}'>{line}<a href='javascript:;' class='layui-inline red iconfont icon-close-circle'></a>";
        //lineName = recursionAncestorsNames(node,checkedNodes);
        lineName = node.name;
        tpl = tpl.replace(/\{line\}/g,lineName);
        $li = $(tpl);
        $li.data("data",node);
        $("#itemUl").append($li);
    }

    //递归查询子节点的祖先的名字
    function recursionAncestorsNames(node,checkNodes){
        var parentNode = null;
        if(!node.parentTId){
            return node.name;
        }else{
            parentNode = getparentNodeByParentTId(node,checkNodes);
            return recursionAncestorsNames(parentNode,checkNodes)+"/"+node.name;
        }
    }

    //从已选择的节点中查找子节点的直接父节点
    function getparentNodeByParentTId(node,nodeList){
        var ret = null;
        $.each(nodeList,function(i,n){
            if(node.parentTId === n.tId) ret =  n;
        });
        return ret;
    }

    //递归查找某节点的祖先节点以便搜索展开
    function recursionNeedExpandNodes(node){
        var ret = [],parentNode = null;
        if(node.parentTId){
            parentNode = zTreeObj.getNodeByTId(node.parentTId);
            ret.push(parentNode);
            return recursionNeedExpandNodes(parentNode).concat(ret);
        }else{
            return ret;
        }
    }

    //设置关键字搜索目标节点的颜色
    function getSearchColor(treeId, treeNode){
        return treeNode.hightLight?{"color":"#FEB902"}:{"color":"#333"};
    }

    //更新节点的属性
    function updateNodes(nodeList,flag){
        $.each(nodeList,function(i,node){
            node.hightLight = flag;
            zTreeObj.updateNode(node);
        });
    }
    //初始化树后，回填已经选择的目的地数据
    function fillSelectedNodeBefore(){
        var selectedNodes = [],perNode = null;
        //var allNodes = zTreeObj.transformToArray(zTreeObj.getNodes());
        $.each(choosedData,function(i,n){
            perNode = zTreeObj.getNodesByParam("id",n,null);
            if(perNode.length>0){
                selectedNodes[selectedNodes.length] = perNode[0];
            }
        });
        if(selectedNodes.length === 0) return ;
        $.each(selectedNodes,function(i,element){
            zTreeObj.checkNode(element,true,false,false);
            createLiItem(element,selectedNodes);
        });
    }

    $(function(){
        cbFn = $("#cbFn").val();
        choosedFn = $("#choosedFn").val();
        window.parent[choosedFn] &&(choosedData = window.parent[choosedFn]());
        //初始化树结构
        zTreeObj = $.fn.zTree.init($("#treeBox"), setting);
        //删除选择项
        $("#itemUl").on("click","a.icon-close-circle",function(e){
            var node =  $(this).parent().data("data");
            zTreeObj.checkNode(node, false,true, true);
            $(this).parent().removeData("data");
            $(this).parent().remove();
        });
        //全部清除
        $("#clearAll").on('click',function(e){
            $("#itemUl li").each(function(){
                $(this).find("a.icon-close-circle").trigger("click");
            });
        });
        //搜索
        $("#searchBtn").on("click",function(e){
            var matchName = $("#country").val(),lineNodes = null;
            var index = util.load();
            var matchNodes = zTreeObj.getNodesByParamFuzzy("name",matchName);
            //第二次搜索的时候，对前一次的搜索结果把字体颜色还原回去
            updateNodes(preSearchNodes,false);
            if(!$.trim(matchName)||!matchNodes.length) {
                util.unload(index);
                return ;
            }
            //zTreeObj.expandAll(false);
            preSearchNodes = matchNodes;
            updateNodes(matchNodes,true);
            util.unload(index);
            //滚动到第一个匹配节点并取消选中
            zTreeObj.selectNode(matchNodes[0],false,false);
            zTreeObj.cancelSelectedNode(matchNodes[0]);
            $.each(matchNodes,function(i,node){
                if(i > 0){
                    lineNodes = recursionNeedExpandNodes(node);
                    $.each(lineNodes,function(i,dd){
                        !dd.open && zTreeObj.expandNode(dd,true,false,false);
                    });
                }
            });
        });
        //确定
        $("#sureBtn").on("click",function(e){
            var callData = [],liCache = null;
            $("#itemUl li").each(function(index,el){
                liCache = $(this).data("data");
                callData[callData.length] = liCache;
            });
            cbFn && window.parent[cbFn](callData);
        });
        //重置
        $("#resetBtn").on("click",function(e){
            window.location.reload();
        });
        //enter搜索
        $("#country").on("keyup",function(e){
            if(e.keyCode == 13)  $("#searchBtn").click();
        });

    });

});


