const express = require('express');
const utility = require('utility');

const app = express();

app.get('/',(req,resp)=>{
    // 获取get请求url中的请求参数
    let param = req.query.param;
    let md5Value = utility.md5(param);
    resp.send("md5 value : " + md5Value);
})

app.listen(3000,()=>{
    console.log("app is listening at port 3000...");
});