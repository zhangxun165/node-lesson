const express = require('express');

const app = express();

app.get('/',(req,resp)=>{
    resp.send("Hello Node!");
})

app.listen(3000,()=>{
    console.log("app is listening at port 3000...");
});