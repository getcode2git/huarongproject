var _tokenInfo = {};

(function($) {

    var ua = navigator.userAgent.toLowerCase();
    //设备信息
    var regexp = /(android|os) (\d{1,}(\.|\_)\d{1,})/;
    //匹配版本号
    var platForm = "";
    //操作系统 ios or android
    var osversion = "";
    //系统的版本号
    var categroyModel = "";
    var isMobile = true;
    if (/iphone|ipad|ipod/.test(ua)) {
        platForm = "ios";
        osversion = regexp.exec(ua)[2].replace("_", ".");
        categroyModel = "iPhone";
    } else if (/android/.test(ua)) {
        platForm = "android";
        osversion = regexp.exec(ua)[2];
    } else {
        isMobile = false;
    }
    var evaluateMobilePlatform = function() {
        // 辅助方法，将形如 a=1&b=2&c=3这样的queryString恢复成数据对象
        var deparam = function(param) {
                if (param == null)
                    return {};
                var pairs,
                    i,
                    keyValuePair,
                    key,
                    value,
                    map = {};
                // remove leading question mark if its there
                if (param.slice(0, 1) === '?') {
                    param = param.slice(1);
                }
                if (param !== '') {
                    pairs = param.split('&');
                    for (i = 0; i < pairs.length; i++) {
                        keyValuePair = pairs[i].split('=');
                        key = decodeURIComponent(keyValuePair[0]);
                        value = (keyValuePair.length > 1) ? decodeURIComponent(keyValuePair[1]) : undefined;
                        map[key] = value;
                    }
                }
                return map;
            }
            // 模拟设备信息
        var appid = "HRMeap";
        var viewid = "com.chamc.ydsp.controller.HRYdspController";
        var actionName = "handler";
        var deviceHeight = window.screen.height;
        //设备的高度
        var deviceWidth = window.screen.width;
        //设备的宽度

        var evalData = {
            "serviceid": "umCommonService",
            "appcontext": {
                "appid": appid,
                "tabid": "",
                "funcid": "",
                "funcode": appid,
                "userid": "",
                "forelogin": "",
                "token": "",
                "pass": "",
                "sessionid": "",
                "devid": "C3474B8E-888D-4937-BDBA-025D8DAE3AE4",
                "groupid": "",
                "massotoken": "",
                "user": ""
            },
            "servicecontext": {
                "actionid": "",
                "viewid": viewid,
                "contextmapping": {
                    "result": "result"
                },
                "params": {
                    "chamc_mobiletoken": appSettings.token,
                    "transtype": "urlparamrequest",
                    "contextmapping": '{"result" : "result"}',
                    "reqmethod": "POST",
                    "header": {
                        "chamc_mobiletoken": appSettings.token
                    }
                },
                "actionname": actionName,
                "callback": ""
            },
            "deviceinfo": {
                "firmware": "",
                "style": platForm,
                "lang": "zh-CN",
                "imsi": "",
                "wfaddress": "C3474B8E-888D-4937-BDBA-025D8DAE3AE4",
                "imei": "",
                "appversion": "1",
                "uuid": "C3474B8E-888D-4937-BDBA-025D8DAE3AE4",
                "bluetooth": "",
                "rom": "",
                "resolution": "",
                "name": "kl",
                "wifi": "",
                "mac": "C3474B8E-888D-4937-BDBA-025D8DAE3AE4",
                "ram": "",
                "model": "iPhone",
                "osversion": osversion,
                "devid": "C3474B8E-888D-4937-BDBA-025D8DAE3AE4",
                "mode": "kl",
                "pushtoken": "",
                "categroy": categroyModel,
                "screensize": {
                    "width": deviceWidth,
                    "heigth": deviceHeight
                }
            }

        };
        $.ajaxSetup({
            // 构造发送数据
            beforeSend: function(xhr, settings) {
                // 附加上代理参数，浏览器底层代理功能完成后可去掉
                var params = deparam(settings.data);
                evalData.servicecontext.params = $.extend(evalData.servicecontext.params, params);
                // 模拟token
                xhr.setRequestHeader("Accept", 'application/json, text/javascript, */*; q=0.01');
                xhr.setRequestHeader("chamc_mobiletoken", appSettings.token);
                // 设置代理地址为appSettings.proxyUrl，真实访问地址放在参数中去
                var realUrl = settings.url;
                settings.url = appSettings.proxyUrl;
                evalData.servicecontext.params.requrl = realUrl;
                var jsonData = {
                    "tip": "none",
                    data: JSON.stringify(evalData)
                };
                settings.data = $.param(jsonData);
            },
            // 去掉移动平台的底层数据封装
            dataFilter: function(response, type) {
                var realData = $.parseJSON(response);
                response = (response && realData && realData.data && realData.data.resultctx && realData.data.resultctx) ? realData.data.resultctx.result.data : {};
                try {
                    response = JSON.parse(response);
                } catch (e) {}
                return JSON.stringify(response);
            }
        });
        $(document).ready(function() {
            $(document).trigger('summerready');
        })
    };

    var mobileWrapper = function() {
            //获取：token和ip
            //返回：{ip, port, token}

            function _getTokenInfo(data) {
                var info = $.parseJSON(data.result);
                if (info == null || info.token == null) {
                    alert("获取token失败, info or info.token is null！");
                    return;
                }
                summer.writeConfig({
                    "host": info.ip, //向configure中写入host键值
                    "port": info.port //向configure中写入port键值
                });
                _tokenInfo = info;

                $(document).trigger('summerready');
                _summerInitialized = true;
            };

            var _summerInitialized = false;
            summerready = function() {
                if (_summerInitialized)
                    return;

                var params = {
                    "params": {
                        "transtype": "request_token"
                    },
                    "callback": _getTokenInfo,
                    "error": function(err) {
                        alert(err);
                    }
                };
                //调用原生做初始化
                summer.callService("SummerService.gotoNative", params, false);
                summer.openHTTPS({
                    "ishttps": appSettings.ishttps //是否开启https传输
                });

            };
            $.ajax = function(url, options) {
                if (typeof url === "object") {
                    options = url;
                    url = undefined;
                }
                options = options || {};
                url = url || options.url;
                // mobile wrap
                var dfd = $.Deferred();

                function _callActionSuccess(response) {
                    //原生和ajax对数据的包裹不一样
                    _summerInitialized = false;
                    try {
                        var response = JSON.parse(response.result);
                    } catch (e) {
                        var response = response.result;
                    }
                    try {
                        var data = JSON.parse(response.result.data);
                    } catch (e) {
                        var data = response.result.data;
                    }
                    if (response.status === "success") {
                        if (options.success && typeof(options.success) == 'function') {
                            options.success(data);
                        }
                        dfd.resolve(data);

                    } else {
                        if (options.error && typeof(options.error) == 'function') {
                            options.error(data);
                        }
                        dfd.reject(data);
                    }

                };

                function _callActionError(err) {
                    dfd.reject(err);
                };
                var innerParams = {
                    "transtype": "urlparamrequest",
                    "requrl": url,
                    "reqmethod": "POST",
                    "chamc_mobiletoken": _tokenInfo.token,
                    "appid": _tokenInfo.appid
                }
                var optionsData = options.data || options;
                for (var key in optionsData) {
                    innerParams[key] = optionsData[key]
                }
                // var paramsObj = {
                //     "viewid": options.viewid || "com.chamc.ydsp.controller.HRYdspController", //部署在MA上的Controller的包名
                //     "action": options.action || "handler", //后台Controller的方法名,
                //     "params": innerParams,
                //     "contextmapping": {
                //         result: "result"
                //     },
                //     "isalerterror": "true",
                //     "callback": _callActionSuccess,
                //     "error": _callActionError,
                //     "header": {
                //         "chamc_mobiletoken": _tokenInfo.token
                //     }
                // }
                var params = {
                    "params": {
                        "transtype": "serviceCall",
                        "innerParams": innerParams,
                        "controllerId": "com.chamc.ydsp.controller.HRYdspController",
                        //"appid":安卓拿不到appid需要传，这里在配置文件里面新增一个变量，以便于修改
                    },
                    "callback": _callActionSuccess,
                    "error": _callActionError,
                };
                //调用原生做初始化
                summer.callService("SummerService.gotoNative", params, false);
                // summer.callAction(paramsObj);
                return dfd.promise();

            };
        }
        //mobileWrapper();
    if (isMobile) {
        mobileWrapper();
    } else {
        evaluateMobilePlatform();
    }
})(jQuery);