var progress; //进度条
var unt, uit; //选人工具的参数名
var title,id,nextUrl;
var userId;
var isFirstIn = true;
var badNetwork = "请求超时，请检查网络";

document.addEventListener("deviceready", function() {
	document.addEventListener("backbutton", function() {
		var state = getQueryByName("approvalState");
		window.location.href = "../index.html?approvalState="+state;
	}, false);
	document.addEventListener("offline", function(){
		layer.open({
		    content: "网络异常, 点击确定刷新页面",
		    btn: "确定",
		    style:"width:60%;color:#000",
		    shadeClose: false,
		    yes:function(index){
		    	layer.close(index);
		    	location.reload();
		    }
		});
	}, false);
}, false);
$(document).on("summerready",function () {
    loadData();
})

function loadData() {
	// body...
	$("#paper").on("click",paper);
	$("#files").on("click",files);
	$("#details").on("click",details);

	$("#second li:first-child").addClass("hit");
	$("#second li").on("click",function(){
		$(this).css({"background-color": "#175499",color: "#FFF"});
		$(this).siblings().css({"background-color": "#FFF",color: "#337AB7"});
	});

	var state = getQueryByName("approvalState");
 	$("#backArr").on("click",function(){
 		window.location.href = "../index.html?approvalState="+state;
 	});
 	if(state == 0){
 		$(".content").css("height","13rem");
 	}

	$(".attachments").css("display","none");
	$(".details").css("display","none");
	progress = getBusyOverlay('viewport', 
					{color : 'white',opacity : 0.75,text : '正在加载，请稍后......',style : 'text-shadow: 0 0 3px black;font-weight:bold;font-size:16px;color:white'}, 
					{color : '#175499',size : 50,type : 'o'}
				);

	title = getQueryByName("title");
	nextUrl = getQueryByName("nextUrl");
	id = getQueryByName("id");
	$("#title").html(title);
	$.post(nextUrl,{
        "reqmethod":"POST",
        "reqparam":"instanceid="+id,
	}).done(success).fail(error).always(function(){
		hidePB();
	});
}

function error() {
	showMsg(badNetwork,close);
};

function hidePB(){
	progress.remove();
}

var attachments;
var details;

function success(msg){
 	

	var data = msg.Data;
	var formInfos = data.FormInfos;
	attachments = data.Attachments;
	details = data.TransInfos;
	var actions = data.Operations;

	var paperArray = [];
	for (var i = 1; i < formInfos.length; i++) {
		var name = formInfos[i].Name;
		var value = formInfos[i].Value;
		
		paperArray.push({
			"name":name,
			"value":value
		});
	}
	var arrText = doT.template($("#paperScript").text());
	$("#paperList").html(arrText(paperArray));
	$("#fname").html(formInfos[0].Value);

	if(!isNull(actions)){
		var btnarea = $("#btns");
	 	//计算按钮宽度
	 	var eachLen = parseInt(100/actions.length); //每个按钮宽度
		var usedWidth =0; //临时变量，暂存已使用的宽度百分比
	 	for(var i=0; i<actions.length; i++){
			
			//封装下个页面初始化请求参数
			var param = {};
			param["component"] = actions[i].FormItems;
			param["btnUrl"] = actions[i].Url;
			param["code"] = actions[i].Code;	

			//计算按钮宽度
	 		var action = $("<button>");
			action.html(actions[i].Name);
			if(i == actions.length-1){
				var k = 100-usedWidth;
				action.css("width",k+"%");
			}else{
				action.css("width",eachLen+"%");
			}
			//绑定每个按钮事件
			action.on('click',param,execute);
			btnarea.append(action);
			usedWidth += eachLen;
		}
	}
	hidePB();
}

function execute(event){
	var nextParam = event.data;
	var btnUrl = nextParam.btnUrl;
	var code = nextParam.code;
	var ajax ="instanceId="+id+"&operationCode="+code;
	var formInfo = {};
	formInfo["btnUrl"] = btnUrl;
	formInfo["ajax"] = ajax;
	var items = nextParam.component;
	formInfo["items"] = items;
	
	/* items不为null，弹框并且构建控件 */
	if(items != null){
		/* 判断items!=null但里面都是hidden的情况，此时弹框需要隐藏*/
		var needHide = true;
		for(var h = 0; h<items.length; h++){
			if(items[h].type != "hidden"){
				needHide = false;
				break;
			}
		}
		if(needHide){
			for(var i = 0; i<items.length; i++){
				var name = items[i].name;
				var value = items[i].value;
				//hidden的name，value需要拼上去
				ajax += "&"+name+"="+value;
			}
			//不弹框，直接请求
			request(btnUrl,ajax);
		}else{
			
			$("#yes").off('click',sure);
			$("#no").off('click',hide);
			//显示遮罩和弹框
			$("body").css("overflow","hidden");
			document.getElementById('light').style.display='block';
			document.getElementById('fade').style.display='block';
			
			
			//初始化form表单
			var argsul = $("#argsul");
			argsul.html(""); //清空以前的数据
			var itemLen = items.length;
			
			for(var i = 0; i<itemLen; i++){
				var name = items[i].name;
				var value = items[i].value;
				var isValnull =  value== undefined||value== null;
				value  = isValnull ? '':value;
				var type = items[i].type;
				var labelName = items[i].label;
				
				
				var scanner = $("<li>");
				var text = "";		
				if(type=='textbox'){
					scanner.addClass("argli");
					text += "<p>"+labelName+"</p>";
					text += "<textarea class='view' name='"+name+"' placeholder='请输入"+labelName+"'>";
					text += value+"</textarea>";
				}else if(type == 'textarea'){
					scanner.addClass("argli");
					text += "<p>"+labelName+"</p>";
					text += "<textarea class='view' name='"+name+"' placeholder='请输入"+labelName+"'>";
					text += value+"</textarea>";
				}else if(type=='radio'){
					var extendInfo = items[i].extendInfo;
					extendInfo = $stringToJSON(extendInfo);
					text += "<div class='um-check-group um-check-group-left'>";
					$.each(extendInfo.items, function (n, values) {
						var lableT  = values.label;
						var valueT = values.value;
						var isChecked = valueT==value ? 'checked="checked"' :'';
						var radios = "";
						
						radios += "<label class='um-check-group-item'>";
						radios += "<input type='radio' name='"+name+"' value='"+valueT+"'  "+isChecked+"><span class='um-icon-ISO um-vc-ISO'></span>";
						radios += "<span class='um-black'>"+lableT+"</span></label>";
						text += radios;
					});
					text += "</div>";
				}else if(type=='hidden' && name!="Ct_ISO9000ManagerId"){
					text += "<input type='hidden'  name='"+name+"' value='"+value+"'>";
				}else if(type=='userselector'){
					scanner.addClass("dealerli");
					var extendInfo = items[i].extendInfo;
					var only = extendInfo.only;
					unt = extendInfo.userNameTo;
					uit = extendInfo.userIdTo;
					
					text += "<p>部门领导</p>";
					text += "<div id='chooseDiv' onclick='choose("+only+");'><span id='dealer'>请选择部门领导</span>";
					text += "<img src='../img/next.png'></div>";
				}else if(type=='datepicker'){
					scanner.addClass("timeli");
					value = value.replace(/\//g,"-").replace(/(?=\b\d\b)/g, '0');

					text += "<p>"+labelName+"</p>";
					text += "<input class='pick-date' type='date' name='"+name+"' value='"+value+"'>";
				}
				scanner.html(text);
				argsul.append(scanner);
			}
			
			//确定，取消的事件
			$("#yes").on('click',formInfo,sure);
			$("#no").on('click',hide);
		}
	}else{
		request(btnUrl,ajax);
	}
}


function choose(only){
	var staffName = $("#dealer").html();
	var nativeUsers = [];
	if(staffName!="请选择部门领导"){
		nativeUsers.push({contactCode:userId,contactName:staffName});
	}else{
		nativeUsers = [];
	}
	var users = $jsonToString(nativeUsers);
	var params = {
		"params" : {
			"transtype" : "ref_contacts",
			"isselectsingle" : only==1,
			"selectusers" : users,
			"selUserArray" : nativeUsers,
			"isFirstIn" : isFirstIn
		},
		"callback" : chooseback
	};
	summer.callService("SummerService.gotoNative", params, false);
}


function chooseback(data) {
	var resultStr = data.result;
	resultStr = $stringToJSON(resultStr);
	var result = $stringToJSON(resultStr.data);
	if(!isNull(result)){
		var $inputs = $("#argsul~input");
		if($inputs.length > 0){
			$inputs.remove();
		}
		var dealer = $("#dealer");
		dealer.css("color","#000");
		dealer.html(result[0].contactName);
		var userName = result[0].contactName;
		userId = result[0].contactCode;
		var text = "";
		text += "<input type='hidden' name='"+unt+"' value='"+userName+"' />";
		text += "<input type='hidden' name='"+uit+"' value='"+userId+"'/>";
		
		$("#argsform").append(text);
	}
	isFirstIn = false;
};

function sure(event){
	var formInfo = event.data;
	var btnUrl = formInfo.btnUrl;
	var ajax = formInfo.ajax;
	var items = formInfo.items;
	
	for(var i = 0; i<items.length; i++){
		var type = items[i].type;
		var name = items[i].name;
		if(type=='radio'){
			var len = $(":radio[name='"+name+"']:checked").length;
			if(len<1){
				showMsg("请选择下一步操作",close);
				return;
			}
		}else if(type == 'textarea'){
			var noArg = $("textarea[name='Ss_Memo']");
			if(noArg.length>0 && noArg.val() == ""){
				showMsg("请输入意见",close);
				return;
			}
		}else if(type=='datepicker'){
			var date = $("input[type='date']").val();
			if(isNull(date)){
				showMsg("请选择日期",close);
				return;
			}
		}else if(type=='userselector'){
			var dealer = $("#dealer").html();
			if(dealer == "请选择部门领导"){
				showMsg("请选择部门领导",close);
				return;
			}
		}else if(type=='textbox'){
			var Nos = $("textarea[name='Ss_No'],textarea[name='Gs_No']");
			var reg = /^[0-9]*$/g;
			var label = items[i].label;
			var exitFun = false;
			
			if(Nos.length>0){
				Nos.each(function(i,ele){
					var number = $(ele).val();
					if(number == ""){
						showMsg("请输入"+label,close);
						exitFun = true;
					}else if(number != "" && !number.match(reg)){
						showMsg(label+"必须是数字",close);
						exitFun = true;
					}/*else if(parseInt(number) > 2000000000){
						showMsg("编号过长",close);
						exitFun = true;
					}*/
				});
			}
			if(exitFun){
				return;
			}
		}
	}
	var formPams = $("#argsform").serialize();
	ajax = ajax + "&" + formPams;
	request(btnUrl,ajax);
}

function hide(){
	document.getElementById('light').style.display='none';
	document.getElementById('fade').style.display='none';
}

function request(btnUrl,ajax){
	ajax = decodeURI(ajax);
	$.post(btnUrl,{
        "reqmethod":"POST",
        "reqparam":ajax,
	}).done(nextCallback).fail(nextError)
}

function nextError() {
	showMsg(badNetwork,close);
};

function nextCallback(msg){
	if(msg == "" || msg == null){
		showMsg(error,close);
	}else if(msg.Code==0 && (msg.Data == null || !msg.Data)){
		showMsg(msg.Message,backtowaitByLayer);
	}else if(msg.Code==0 && msg.Data != null){

		var data = {};
		data["id"] = id;
		data["msg"] = msg;
		data["title"] = title;
		data["nextUrl"] = nextUrl;
		data = $jsonToString(data);
		$cache.write("cpData",data);
		setTimeout("window.location.href = 'checkoutPople.html'", 500);
		
	}else if(msg.Code==1){
		alert(Message.Message);
	}else if(msg.Code==-1){
		alert("会话无效");
	}
};


function paper() {
	// body...
	$(".paper").css("display","block");
	$(".attachments").css("display","none");
	$(".details").css("display","none");
}

function files() {
	// body...
	$(".paper").css("display","none");
	$(".attachments").css("display","block");
	$(".details").css("display","none");

	if (!isNull(attachments)) {
		var attachArray = [];
		var frontType = "";
		for (var i = 0; i < attachments.length; i++) {
			var fileTitle = attachments[i].Title;
			var filename = attachments[i].Filename;
			var ext = filename.substr(filename.lastIndexOf(".")+1).toLowerCase();
			var imgSrc = "../img/"+ext+".png";
			var fileType = isNull(attachments[i].FileFlag)? "其它":attachments[i].FileFlag;

			if(i > 0){
				frontType = attachments[i-1].FileFlag;
			}

			var titleText = "";
			if(fileType != frontType){
				titleText = "<div class='fileType'>"+fileType+"</div>";
			}

			var nativeParam = attachments[i];
			nativeParam["transtype"] = "load_pdf"; //请求后台的transtype
			nativeParam = $jsonToString(nativeParam);

			var event = "onclick='download("+nativeParam+");'"
			attachArray.push({
				title:fileTitle,
				event:event,
				imgSrc:imgSrc,
				titleText:titleText
			});
		}
		var arrText = doT.template($("#attachScript").text());
		$("#fileList").html(arrText(attachArray));
	}
}

//附件下载
function download(paramstr){
	var params = {
        "params":paramstr,
         "callback":"downback()"
      };
	summer.callService("SummerService.gotoNative", params, false);
};
function downback(){};

function details() {
	// body...
	$(".paper").css("display","none");
	$(".attachments").css("display","none");
	$(".details").css("display","block");

	var detailsArray = [];
	if(!isNull(details)){
		for (var i = details.length - 1; i >= 0; i--) {
			var stepname = details[i].StepName;
			var username = isNull(details[i].UserName)? "":details[i].UserName;
			var arriveTime = formateDate(details[i].ArriveTime);
			var acceptTime = formateDate(details[i].AcceptTime);
			var status = details[i].Status;

			detailsArray.push({
				stepname:stepname,
				username:username,
				arriveTime:arriveTime,
				acceptTime:acceptTime,
				status:status
			});
		}
		var arrText = doT.template($("#detailsScript").text());
		$("#detailsList").html(arrText(detailsArray));
	}
}