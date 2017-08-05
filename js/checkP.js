var dataUrl;
var transId;
var id;
var email = ""; //选人工具返回的cuserid
var redirectName;
var redirectUser;
var smtPam = {};
var sparam = "";
var selectType; // 选人方式
var isBack; //提交的mustback
var showOrder; //返回的ShowOrder
var isSubmited = false; //是否已经点过提交按钮
var backDetailArgs = {}; //返回详情页的参数
var progress; //进度条
var isFirstIn = true;
var error = "服务器发生内部错误";
var badNetwork = "请求超时，请检查网络";

document.addEventListener("deviceready", function() {
	//此页面物理返回键监听
	document.addEventListener("backbutton", function() {
		//如果提交了，返回到代办
		if(isSubmited){
			window.location.href = "../index.html?approvalState=1";
		}else{
			//没有提交回到详情
			var args = backDetailArgs;
			var id = args.arg1;
			var title = args.arg3;
			var nextUrl = args.arg4;
			
			var url = "detail1.html?title="+title+"&id="+id+"&nextUrl="+nextUrl+"&approvalState=1";
			url = decodeURI(url);
			window.location.href = url;
		}
	}, false);
}, false);

$(document).on("summerready",function() {
	//document.addEventListener("backbutton",onBackKeyDown,false);
	/*summer.openHTTPS({
		"ishttps" : "true" //是否开启https传输
	});*/
	progress = getBusyOverlay('viewport', 
						{color : 'white',opacity : 0.75,text : '正在加载，请稍后......',style : 'text-shadow: 0 0 3px black;font-weight:bold;font-size:16px;color:white'}, 
						{color : '#175499',size : 50,type : 'o'}
			);
	var cpData = $cache.read("cpData");
	cpData = $stringToJSON(cpData);
	
	var data = cpData.msg;
	data = data.Data;
	
	id = cpData.id;
	var title = cpData.title;
	var nextUrl = cpData.nextUrl;
	
	backDetailArgs = {"arg1":id,"arg3":title,"arg4":nextUrl};
	$("#backToDetail").on("click",backDetailArgs,backtodetail);
	

	transId = data.transField;
	var au = data.AvailableUsers;
	dataUrl = data.SubmitDataUrl;
	var nextStep = data.NextStepName;
	selectType = data.SelectionType;
	var nextType = data.NextStepType;
	if(data.ShowOrder == null || !data.ShowOrder){
		showOrder = -1;
	}else{
		showOrder = data.ShowOrder;
	}
	
	var reMode = data.RedirectMode;
	isBack = reMode == 1?true:false;
	smtPam["url"] = dataUrl;

	var list = $("#peopleList");
	var flag = selectType == 0 || !au || au.length == 0;
	if (flag) {
		redirectUser = data.RedirectUser;
		email = redirectUser;
		email = isNull(email)?"":email;
		//email = "yujing@chamc.com.cn@3711";
		redirectName = data.RedirectUserName;
		var color = "#c7c7cd";
		if(isNull(redirectName)){
			redirectName = "请选择办理人";
		}else{
			color = "#4F89CB";
		}
		var sparam = "";
		var su = conappend(email,showOrder,"");
		sparam += "selectedUsers=" +su;
		sparam +="&redirectUserId=" +email;
		sparam +="&transField=" +transId;
		sparam +="&instanceId=" +id;
		sparam +="&mustBack=" +isBack;
		smtPam["type"] = "Y";
		smtPam["ssubmit"] = sparam;

		var cnt = $("<li>");
		cnt.attr("id","hint");
		cnt.addClass("um-listview-row");
		var text = "<div class='um-list-item-inner pl20'><div class='um-list-item-body'>";
		text += "<h4 class='um-media-heading fb f120 um-text-overflow'><p class='um-gray text1' style='color: #000;font-size:15px;'>办理人</p>";
		text += "</div><div style='float: right;padding-right: 2rem'><span id='task' style='color: "+color+"'>"+ redirectName +"</span><span class='um-rightArw'></span></div>";
		cnt.html(text);
		cnt.on('click', function() {
			var staffName = $("#task").html();
			var nativeUsers = [];
			if(staffName!="请选择办理人"){
				nativeUsers.push({contactCode:email,contactName:staffName});
			}else{
				nativeUsers = [];
			}
			var users = $jsonToString(nativeUsers);
			var params = {
				"params" : {
					"transtype" : "ref_contacts",
					"isselectsingle" : true,
					"selectusers" : users,
					"selUserArray" : nativeUsers,
					"isFirstIn" : isFirstIn
				},
				"callback" : chooseback
			};
			summer.callService("SummerService.gotoNative", params, false);
		});
		$("#peopleList").append(cnt);
	}else{
		smtPam["type"] = "N";
		var cmode = data.CheckMode;
		var list = $("#peopleList");
		 
		if ((cmode == 1 && !selectType) || nextType == 2) {//单选
			smtPam["cmode"] = 1;
			var text = "";
			var leaderName = "";
			for(var j=0; j<au.length; j++){
				leaderName = au[j].BelongLeaderName;
				leaderName = isNull(leaderName)?"无":leaderName;
				text += "<li class='um-listview-row borderli'>";
				text += "<label class='um-check-group-item'  ><input name='check' type='radio' class='li-right'  leaderId='"+au[j].BelongLeaderId+"' value='"+au[j].UserId+"'>";
				text += "<span class='um-icon-check um-css3-vc'></span><span class='um-black weizhi' >"+au[j].UserName+"</span>";
				text += "<div class='um-gray weizhi'>所属领导: "+leaderName+"</div></label>";
				text += "</li>";
			}
			list.html(text);
			//list.addClass("borderli");
		}else if (cmode == 2 && !selectType){//多选
			smtPam["cmode"] = 2;
			for(var j=0; j<au.length; j++){
				var cnt = $("<li>");
				cnt.addClass("um-listview-row");
				var text = "";
				text += "<div class='um-list-item-inner pl20'><div class='um-list-item-body'>";
				text += "<h5 class='um-media-heading fb f120 um-text-overflow' >"+au[j].UserName+"</h5>";
				text += "<p class='um-gray f6 um-text-overflow' >"+au[j].FullDepartment+"</p></div><div><label class='um-check-inline  mr20'>";
				text += "<input name='um-checkbox-inline' type='checkbox' leaderId='"+au[j].BelongLeaderId+"' class='li-right' value='"+au[j].UserId+"'>";
				text += "<span class='um-icon-checkbox um-css3-vc'></span></label></div></div>";
                cnt.html(text);
				list.append(cnt);
            }
		}else if (cmode == 3 && !selectType){//展示
			smtPam["cmode"] = 3;
			var orderInput = "";
			if((showOrder == 1 || showOrder == 2) && au.length > 1){
				orderInput += "<input type='text' class='orderbox' value='1'>";
			}
			for(var j=0; j<au.length; j++){
				var cnt = $("<li>");
				cnt.addClass("um-listview-row");
				var text = "";
				text += "<div class='um-list-item-inner pl20'>"+orderInput+"<div class='um-list-item-body'>";
				text += "<h5 class='um-media-heading fb f120 um-text-overflow' >"+au[j].UserName+"</h5>";
				text += "<p class='um-gray f6 um-text-overflow' >"+au[j].FullDepartment+"</p></div><div><label class='um-check-inline  mr20'>";
				text += "<input name='um-checkbox-inline' type='checkbox' leaderId='"+au[j].BelongLeaderId+"' class='li-right' value='"+au[j].UserId+"' checked disabled>";
				text += "<span class='um-icon-checkbox um-css3-vc'></span></label></div></div>";
				cnt.html(text);
				list.append(cnt);
			}
		}
	}
	$("#smt").on('click', smt);
	progress.remove();
});
//提交按钮事件
function smt() {
	var multi = $("#peopleList .li-right:checked");
	
	var isEmail = $("#email").prop("checked");
	var isImm = $("#mesg").prop("checked");
	var type = smtPam["type"];
	var checkedP = "";
	if (type == "N") {
		var cmode = smtPam["cmode"];
		if(multi.length < 1){
			showMsg("请选择办理人",close);
			//alert("请选择办理人");
			return;
		}
		if(cmode == 1){
			var val = multi.val();
			var leadId = multi.attr("leaderId");
			if(leadId=="null" || leadId =="undefined"){
				leadId="";
			}
			checkedP = conappend(val,showOrder,leadId);
		}else if(cmode == 2){
			if(multi.length < 1){
				//alert("请选择办理人");
				showMsg("请至少选择一位办理人",close);
				return;
			}
			multi.each(function(i,ele){
				var val = $(ele).val();
				var leadId = multi.attr("leaderId");
				if(leadId=="null" || leadId =="undefined"){
					leadId="";
				}
				checkedP += conappend(val,showOrder,leadId);
			});
		}else if(cmode == 3){
			var exitFlag = false;
			multi.each(function(i,ele){
				var val = $(ele).val();
				var leadId = multi.attr("leaderId");
				if(leadId=="null" || leadId =="undefined"){
					leadId="";
				}
				var orderbox = $(ele).parent().parent().siblings(".orderbox");
				if(orderbox.length > 0){
					var boxval  = orderbox.val();
					 if(isNull(boxval)){
						showMsg("序号不能为空",close);
						exitFlag = true;
					}else if(boxval < 1){
						showMsg("序号必须大于零",close);
						exitFlag = true;
					}else if(!parseInt(boxval)){
						showMsg("序号必须是数字",close);
						exitFlag = true;
					}
				}else{
					boxval="1";
				}
				
				checkedP += conappend(val,boxval,leadId);
			});
			if(exitFlag){
				return;
			}
		}
		var csubmit = "";
		
		csubmit +="transField=" +transId;
		csubmit += checkedP;
		csubmit +="&redirectUserId=" +email;
		csubmit +="&instanceId="+id;
		csubmit +="&mustBack=" +isBack;
		csubmit+="&isSendIMMessage="+ isImm;
		csubmit+="&isSendMailMessage="+isEmail;
		smtPam["csubmit"] = csubmit;
	}
	
	var axp = "";
	if (type == "N") {
		axp = smtPam["csubmit"];
	} else if (type == "Y") {
		axp = smtPam["ssubmit"];
		axp +="&isSendIMMessage="+isImm;
		axp +="&isSendMailMessage ="+isEmail;
	}
	if((!type || type == "Y") && email ==""){
		showMsg("请选择办理人",close);
		//alert("请选择办理人");
		return;
	}
	var url = smtPam["url"];
	//alert("axp:\n"+axp);
	$.post(url,{
        "reqparam": axp,
	}).done(successCallback).fail(myErrCallBack)
};
//提交成功的回调
function successCallback(Message){
	if(Message == "" || Message == null){
		//alert("请求服务器时发生内部错误");
		showMsg(error,close);
	}else if(Message.Code==0){
	  	isSubmited = true;
	  	showMsg("办理成功",backtowaitByLayer);
	}else if(Message.Code==1){
		alert(Message.Message);
	}else if(Message.Code==-1){
		alert("会话无效");
	}
};
function myErrCallBack() {
	showMsg(badNetwork,close);
};

//拼接selectUsers参数
function conappend(str1,str2,str3){
	return "&selectedUsers="+str1 + "," + str2 + "," + str3;
}

//回到详情
function backtodetail(event){
	var args = event.data;
	var id = args.arg1;
	var title = args.arg3;
	var nextUrl = args.arg4;
	
	var url = "detail1.html?title="+title+"&id="+id+"&nextUrl="+nextUrl+"&approvalState=1";
	url = decodeURI(url);
	window.location.href = url;
}

//选人工具回调
function chooseback(data) {
	var resultStr = data.result;
	resultStr = $stringToJSON(resultStr);
	var result = resultStr.data;
	result = $stringToJSON(result);
	var peos = $("<li>");
	peos.addClass("um-listview-row");
	if (result.length > 0) {
		$("#task").css("color","#4F89CB");
		$("#task").html(result[0].contactName);
		email = result[0].contactCode;
		
	}else if(!isNull(redirectName)){
		$("#task").html(redirectName);
		email = redirectUser;
	}else{
		$("#task").css("color","#c7c7cd");
		$("#task").html("请选择办理人");
	}

	var su = conappend(email,showOrder,"");
	var sparam = "";
	sparam += "selectedUsers=" +su;
	sparam +="&redirectUserId=" +email;
	sparam +="&transField=" +transId;
	sparam +="&instanceId=" +id;
	sparam +="&mustBack=" +isBack;
	smtPam["type"] = "Y";
	smtPam["ssubmit"] = sparam;
	
	isFirstIn = false;
};
