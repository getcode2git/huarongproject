//url中的请求参数值，形如：xx=1，返回1
function getQueryByName(name){
	var params = decodeURI(location.search);
	var result = params.match(
			new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
	if (result == null || result.length < 1)
	{
		return "";
	}
	return result[1];
}
//跳转到代办列表页面
function backtowait() {
	window.location.href = "../index.html?approvalState=1";
}

//在layer的关闭回调中跳转到代办列表页面
function backtowaitByLayer(index){
	layer.close(index);
	window.location.href = "../index.html?approvalState=1";
}

//格式化日期为：17-04-02 17:22的形式，Format无效，暂时截取
function formateDate(date){
	var reg = /\//g;
	date = date.replace(reg,"-");
	var last = date.lastIndexOf(":");
	date = date.substring(2,last);
	return date;
}

/** 判断空值 */
function isNull(data){
	if(!data || null == data  ||  "null" == data ||  "" == data  ||  [] == data ||  "[]" == data ){
		return true;
	}else{
		return false;
	}
}

//使用layer弹框提示消息
function showMsg(msg,sure){
	layer.open({
	    content: msg,
	    btn: "确定",
	    style:"width:60%;color:#000",
	    shadeClose: false,
	    yes:sure
	});
}

//默认的关闭layer回调
function close(index){
	layer.close(index);
}