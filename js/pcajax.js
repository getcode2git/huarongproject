//TaskId: {4:'处室负责人审核',6:'会签',7:'拟稿人办理',9:'领导人签发'}
//modelId: 437  modelName:股份有限公司部门发文
jquery.extend({
    _getModelData:function () {
        var modelData = null;
       $.ajax({
           url:"model.detail.json",
           type:"POST",
           async:false,
           success:function (data) {
               modelData = data
           }
       })
        return modelData;
    },
    _getHRData: function (data) {
        var modelId = data.WorkFlowInfo.ModelId;
        var taskId = data.WorkFlowInfo.TaskId;
        var modelData = $._getModelData();
        var modelContent = modelData["ModelId-"+modelId]["TaskId-"+taskId];
        var Context = data.Context;
        var newContext = []
        //[{name:"AuthorName",ch:"拟稿人",type:"null",content:""李青}]
        for (var key in Context) {
            var value = Context[key];
            if (value) {
                var temp = Object.assign({},modelContent[key])
                temp.name = key;
                temp.content = Context[key];
                newContext.push(temp)
            }
        }
        data.Context = newContext;
        return data;
    }
})



