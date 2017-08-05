var jsonArray = []; // 稿纸页签数据
var attachments = []; //附件页签数据
var arr3; //流转明细页签数据
var nextUrl; //下个页面的ready请求
var id; //instanceId
var nextParam; //传给选人页面的数据
var progress; //进度条
var unt, uit; //选人工具的参数名
var title, url;
var error = "服务器发生内部错误";
var badNetwork = "请求超时，请检查网络";
var userId;
var isFirstIn = true;
document.addEventListener("deviceready", function() {
	document.addEventListener("backbutton", function() {
		var approvalState = getQueryByName("approvalState");
		backWithState(approvalState);
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
		//alert("网络异常, 点击确定刷新页面");
	}, false);
}, false);
$(document).on("summerready",function () {
    loadData();
})
function backWithState(xx) {
	window.location.href = "../index.html?approvalState="+xx;
}

function loadData(){
	progress = getBusyOverlay('viewport', 
						{color : 'white',opacity : 0.75,text : '正在加载，请稍后......',style : 'text-shadow: 0 0 3px black;font-weight:bold;font-size:16px;color:white'}, 
						{color : '#175499',size : 50,type : 'o'}
						);
	$("#content").css("display","block");
	$("#next").css("display","block");
	$("#file").css("display","none");
	$("#third").css("display","none");
	url = getQueryByName("nextUrl");
	id = getQueryByName("id");
	//id = $cache.read("id");
	//清空数据
	var arrText = doT.template($("#list").text());
	$("#listview").html(arrText(""));
	$.post(url,{
        "reqmethod":"POST",
        "reqparam":"instanceid="+id,
	}).done(myCallBack).fail(myErrCallBack)
};
function myErrCallBack() {
	progress.remove();
	showMsg(badNetwork,close);
	//alert("请求服务器失败，请检查网络");
};

function myCallBack(Message){
	// 判空处理
	if(isNull(Message)){
		progress.remove();
		showMsg(error,close);
		//alert("数据为空");
		return;
	}
	
	//alert($jsonToString(Message));
	if(Message.Code != 0){
		//alert(Message.Message);
		progress.remove();
		showMsg(Message.Message,close);
		return;
	}
	data = Message.Data;
 	//3个info
 	var arr1 = data.FormInfos;
 	var arr2 = data.Operations;
	arr3 = data.TransInfos;
 	
 	//防止登录后第一次打开代办数据没有按钮
 	var xx = getQueryByName("approvalState");
 	//var isNg = getQueryByName("state");
 	//$cache.write("approvalState", xx);
 	$("#um-back").on("click",function(){
 		window.location.href = "../index.html?approvalState="+xx;
 	});
 	/*if(xx=="1" && isNull(arr2) && isNg=="N"){
 		location.reload();
 	}*/
 	
 	
 	//初始化稿纸页签数据
 	//var title = $cache.read("title");
 	title = getQueryByName("title");
 	//$("#header h3")[0].style.color="#FFF";
 	$("#header h3").css("color","#FFF");
 	$("#header h3").html(title);
 	var paper = arr1[0].Value;
 	$("#content_header h4").html(paper);
	for (var i = 1; i < arr1.length; i++) {
		var name = arr1[i].Name;
		var val = arr1[i].Value;
		jsonArray.push({
			"name" : name,
			"val": val
		});
	}
	var arrText = doT.template($("#list").text());
	$("#listview").html(arrText(jsonArray));
 	
 	
 	//初始化底部按钮
 	var next = $("#next");
 	var args = $("#args");
 	if(arr2.length != 0 && arr2 != null){
	 	var btns = "";
	 	//计算按钮宽度
	 	var elen = parseInt(100/arr2.length); //每个按钮宽度
		var twid =0; //临时变量，暂存已使用的宽度百分比
	 	for(var j=0; j<arr2.length; j++){
	 		var bt = $("<button>");
			var items = arr2[j].FormItems;
			var code = arr2[j].Code;
			
			//封装下个页面初始化请求参数
			var pam = {};
			var nUrl = arr2[j].Url;
			var bid = "btn" + j;
			pam["component"] = items;
			pam["nUrl"] = nUrl;	
			pam["code"] = code;		
			pam["transtype"] = "ref_contacts";
			
			//计算按钮宽度
			bt.attr("id",bid);
			bt.html(arr2[j].Name);
			if(j == arr2.length-1){
				var k = 100-twid;
				bt.css("width",k+"%");
			}else{
				bt.css("width",elen+"%");
			}
			//绑定每个按钮事件
			bt.on('click',pam,Open_message);
			next.append(bt);
			twid += elen;
		}
 	}else{
 		//没有Operations，隐藏按钮区
 		//next.css("display","none");
 		next.css("background-color","#F7F7F7");
 	}
 	//进度条消失
	progress.remove();
	
 	//暂存附件列表数据
 	attachments = data.Attachments;
};


//点击稿纸页签
function paper(){
	$("#content").css("display","block");
	$("#next").css("display","block");
	$("#file").css("display","none");
	$("#third").css("display","none");
};

//点击附件页签
function attcachs(){
	$("#content").css("display","none");
	$("#file").css("display","block");
	$("#third").css("display","none");
	$("#next").css("display","none");
	
	if(attachments != null && attachments.length >0){
		var fli = "";
		var flag;
		for (var i = 0; i < attachments.length; i++) {
			var pamn = attachments[i];
			pamn["transtype"] = "load_pdf"; //请求后台的transtype
			pamn = $jsonToString(pamn);
			var filename = attachments[i].Filename;
			var title = attachments[i].Title;
			var fileflag = attachments[i].FileFlag;
			fileflag = isNull(fileflag)?"其它":fileflag;
			if( i != 0 ){
			    flag = attachments[i-1].FileFlag;
			}
			//每种附件类型对应的图片
			var imgSrc = "../img/";
			var ext = filename.substr(filename.lastIndexOf(".")+1).toLowerCase();
			if(ext == "pdf"){
				imgSrc +="pdf.png";
			}else if(ext == "xls" || ext == "xlsx"){
				imgSrc +="xls.png";
			}else if(ext == "ppt" || ext == "pptx"){
				imgSrc +="ppt.png";
			}else if(ext == "doc" || ext == "docx"){
				imgSrc +="doc.png";
			}else if(ext == "rar"){
				imgSrc +="rar.png";
			}else if(ext == "zip"){
				imgSrc +="zip.png";
			}else if(ext == "txt"){
				imgSrc +="txt.png";
			}else{
				imgSrc +="other.png";
			}
			if( fileflag == flag){
				fli += "<li onclick='download("+pamn+");'><div class='dfile'><div class='dicon'><img width='30px' height='35px' src='"+imgSrc+"'/></div>";
				fli += "<div class='dname'><span>";
				fli += title +"</span></div></div></li>";
			}else{
				fli += "<div class='fileFlag'><span style='margin-left: 10px;'>"+fileflag+"</span></div>";
				fli += "<li onclick='download("+pamn+");'><div class='dfile'><div class='dicon'><img width='30px' height='35px' src='"+imgSrc+"'/></div>";
				fli += "<div class='dname'><span>";
				fli += title +"</span></div></div></li>";
			}
		}
		$("#file .ul-detail").html(fli);
	}else if(isNull(attachments)){
		//没有附件显示暂无附件
		var text = "";
		text += "<div id='nofiles' style='display: none'>";
		text += "<img src='../img/nofiles.png' width='300px' style='position: absolute; top: 100px; left: 80px'/>";
		text += "<span style='position:absolute;top:300px; left: 170px; color:#666666; font-family: .PingFangSC-Regular; font-size: 16px'>";
		text += "暂无附件信息!</span></div>";
		$("#file").html(text);
	}
};

//点击流转明细页签数据
function chantods(){
	$("#content").css("display","none");
	$("#file").css("display","none");
	$("#third").css("display","block");
	$("#next").css("display","none");
	
	//流转明细页面
	var transUl = $("#third .dul");
	var text = "";
	//alert("格式化："+ formateDate(arr3[0].ArriveTime));
 	for (var i = arr3.length-1; i >= 0; i--) {
		var sname = arr3[i].StepName;
		var username = isNull(arr3[i].UserName)? "":arr3[i].UserName;
		var atime = arr3[i].ArriveTime;
		var acctime = arr3[i].AcceptTime;
		var status = arr3[i].Status;
		atime = formateDate(atime);
		
		//未接收，办理中，已完成
		var statusSpan = "<div class='mingxi-content-status unreceive'>"+status+"</div></div></div></li>";
		var timeSpan = "<p class='mingxi-content-time'>任务到达时间："+atime+" </p>";
		
		if(status=="办理中"){
			acctime = formateDate(acctime);
			timeSpan += "<p class='mingxi-content-time'>任务接收时间："+acctime+" </p>";
			statusSpan = "<div class='mingxi-content-status handing'>"+status+"</div></div></div></li>";
		}else if(status=="已完成"){
			acctime = formateDate(acctime);
			timeSpan += "<p class='mingxi-content-time'>任务接收时间："+acctime+" </p>";
			statusSpan = "<div class='mingxi-content-finished'><img src='../img/finished.png'/></div></div></div></li>";
		}
		
		text += "<li class='mingxi-list'><div class='mingxi-title'>"+sname+"</div>";
		text += "<div class='mingxi-content'><div class='mingxi-content-left'>";
		text += "<div class='mingxi-content-img'><img src='../img/tx1.png'/></div></div><div class='mingxi-content-middle'>";
		text += "<p class='mingxi-content-head'>"+username+"</p>";
		text += timeSpan;
		text += "</div><div class='mingxi-content-right'>";
		text += statusSpan;
	}
	transUl.html(text);
};



//附件下载
function download(paramstr){
	var params = {
        "params":paramstr,
         "callback":"downback()"
      };
	summer.callService("SummerService.gotoNative", params, false);
};

//下载的回调
function downback(){
	alert("完成回调，下载成功");
};

//点击底部按钮
function Open_message(event) {
	nextParam = event.data;
	var nUrl = nextParam.nUrl;
	var code = nextParam.code;
	var ajax ="instanceId="+id+"&operationCode="+code;
	var formInfo = {};
	formInfo["nUrl"] = nUrl;
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
			request(nUrl,ajax);
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
			var tan = $("#light");
			
			for(var i = 0; i<itemLen; i++){
				var name = items[i].name;
				var value = items[i].value;
				var isValnull =  value== undefined||value== null;
				value  = isValnull ? '':value;
				var type = items[i].type;
				var labelName = items[i].label;
				
				
				var li = $("<li>");
				var text = "";		
				if(type=='textbox'){
					text += "<div class='args' id='args'><div class='ldrnum'>";
					text += "<span class='leader'>"+labelName+"</span></div>";
					text += "<textarea class='view' name='"+name+"' placeholder='请输入"+labelName+"'>"+value+"</textarea></div>";
				}else if(type == 'textarea'){
					text += "<div class='args' id='args'><div class='ldrnum'>";
					text += "<span class='leader'>"+labelName+"</span></div>";
					text += "<textarea class='view' name='"+name+"' placeholder='请输入"+labelName+"'>"+value+"</textarea></div>";
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
					var extendInfo = items[i].extendInfo;
					var only = extendInfo.only;
					unt = extendInfo.userNameTo;
					uit = extendInfo.userIdTo;
					
					text += "<div class='pick-div'><span class='deal-label' >部门领导</span>";
					text += "<div id='chooseDiv' onclick='choose("+only+");' class='deal-name'><span id='dealer' class='deal-person'>请选择部门领导</span>";
					text += "<a><img  src='../img/next.png' width='10'/>";
					text += "</a></div></div>";
				}else if(type=='datepicker'){
					value = value.replace(/\//g,"-").replace(/(?=\b\d\b)/g, '0');
					text += "<div class='args' id='args'><div class='ldrnum'>";
					text += "<span class='leader'>"+labelName+"</span></div>";
					text += "<input type='date' class='argdate' name='"+name+"' value='"+value+"'/></div>";
				}
				li.html(text);
				argsul.append(li);
			}
			
			//确定，取消的事件
			$("#yes").on('click',formInfo ,sure);
			$("#no").on('click',hide);
		}
	}else{
		request(nUrl,ajax);
	}
};
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
	$("body").css("overflow","hidden");
	var formInfo = event.data;
	var nUrl = formInfo.nUrl;
	var ajax = formInfo.ajax;
	var items = formInfo.items;
	
	for(var i = 0; i<items.length; i++){
		var type = items[i].type;
		var name = items[i].name;
		if(type=='radio'){
			var len = $(":radio[name='"+name+"']:checked").length;
			if(len<1){
				//alert("请选择下一步操作");
				showMsg("请选择下一步操作",close);
				return;
			}
		}else if(type == 'textarea'){
			var noArg = $("textarea[name='Ss_Memo']");
			if(noArg.length>0 && noArg.val() == ""){
				//alert("请输入意见");
				showMsg("请输入意见",close);
				return;
			}
		}else if(type=='datepicker'){
			var date = $("input[type='date']").val();
			if(isNull(date)){
				//alert("请选择日期");
				showMsg("请选择日期",close);
				return;
			}
		}else if(type=='userselector'){
			var dealer = $("#dealer").html();
			if(dealer == "请选择办理人"){
				//alert("请选择办理人");
				showMsg("请选择办理人",close);
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
						//alert("请输入"+label);
						showMsg("请输入"+label,close);
						exitFun = true;
					}else if(number != "" && !number.match(reg)){
						//alert(label+"必须是数字");
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
	request(nUrl,ajax);
}

function hide(){
	$("body").css("overflow","auto");
	document.getElementById('light').style.display='none';
	document.getElementById('fade').style.display='none';
}

function request(nUrl,ajax){
	ajax = decodeURI(ajax);
	$.post(nUrl,{
        "reqparam": ajax,
	}).done(nextCallback).fail(myErrCallBack)
}

function nextCallback(msg){
	if(msg == "" || msg == null){
		//alert("请求服务器时发生内部错误");
		showMsg(error,close);
	}else if(msg.Code==0 && (msg.Data == null || !msg.Data)){
		showMsg(msg.Message,backtowaitByLayer);
		//alert(msg.Message);
	}else if(msg.Code==0 && msg.Data != null){

		var data = {};
		data["id"] = id;
		data["msg"] = msg;
		data["component"] = nextParam.component;
		data["title"] = title;
		data["nextUrl"] = url;
		data = $jsonToString(data);
		$cache.write("cpData",data);
		setTimeout("window.location.href = 'checkoutPople.html'", 500);
		
	}else if(msg.Code==1){
		alert(Message.Message);
	}else if(msg.Code==-1){
		alert("会话无效");
	}
};
