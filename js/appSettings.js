var appSettings = {};

appSettings.ishttps = "false";

// 以下部分只在使用pc端浏览器调试时有用
appSettings.proxyIp = "10.80.38.121"; //'10.80.38.121';
appSettings.proxyPort = "8060"; //'8060';
// 用友MA的地址，浏览器层的代理完成后将移到原生层去配置
appSettings.proxyUrl = "http://" + appSettings.proxyIp + ":" + appSettings.proxyPort + "/umserver/core/";

//仅浏览器调试时模拟使用
appSettings.token = "cbddad46ed47a2f71683d464e80f7056628a52fd3c94452c3aeffcbf468cda3a";

// 以下是应用中用到的URL地址，不同环境的地址不一样
appSettings.urlWaitingList = 'http://kmsbak.chamc.com.cn/docapi/doc/workflow/WaittingList';
appSettings.urlFinishedList = 'http://kmsbak.chamc.com.cn/docapi/doc/workflow/FinishedList';

//生产环境
//appSettings.urlWaitingList = 'http://kms.chamc.com.cn/docapi/doc/workflow/WaittingList';
//appSettings.urlFinishedList = 'http://kms.chamc.com.cn/docapi/doc/workflow/FinishedList';

//开发环境
//appSettings.urlWaitingList = 'http://10.1.8.81/docapi/doc/workflow/WaittingList';
//appSettings.urlFinishedList = 'http://10.1.8.81/docapi/doc/workflow/FinishedList';
appSettings.headerToken = "chamc_mobiletoken";