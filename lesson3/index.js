const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');


const app = express();
const cnodeUrl = "https://cnodejs.org";

app.get('/',(req,resp)=>{
    superagent.get(cnodeUrl).end((err,sresp)=>{
        if(err){
            console.log("some error occured...");
            return;
        }
        // 将获取到的网页内容装在到cheerio中
        let $ = cheerio.load(sresp.text);
        let items = [];

        // 对网页内容进行解析
        $('#topic_list .cell').each((idx,element)=>{
            let $topic = $(element).find('.topic_title');
            let $author = $(element).find('img');
            items.push({
                title: $topic.attr('title'),
                href: $topic.attr('href'),
                author: $author.attr('title')
            });
        });

        resp.send(items);
    });
})

app.listen(3000,()=>{
    console.log("app is listening at port 3000...");
});