const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy');
const url = require('url');


const app = express();
const cnodeUrl = "https://cnodejs.org/";

app.get('/',(req,resp)=>{
    superagent.get(cnodeUrl).end((err,sresp)=>{
        if(err){
            console.log("some error occured...");
            return;
        }
        // 将获取到的网页内容装在到cheerio中
        let $ = cheerio.load(sresp.text);
        let topicUrls = [];

        // 对网页内容进行解析，获取前三个主题的url
        let cnt = 1;
        $('#topic_list .topic_title').each((idx,element)=>{
            if(cnt > 3){
                console.log("够了够了，先获取三个主题的URL吧");
                // 终止遍历
                return false;
            }
            let $element = $(element);
            let topicUrl = url.resolve(cnodeUrl, $element.attr('href'));
            topicUrls.push(topicUrl);
            cnt++;
        });

        // 三次请求都完成时才进行处理
        let ep = new eventproxy();
        ep.after('topic_detail', topicUrls.length, (topics)=>{
            topics = topics.map((topic)=>{
                let $ = cheerio.load(topic[1]);
                return ({
                    title: $('.topic_full_title').not('.put_top').text().trim(),
                    href: topic[0],
                    comment1: $('.reply_content').eq(0).text().trim(),
                });
            });
            console.log("获取成功！");
            resp.send(topics);
        });

        // 迭代并行获取以上三个url的网页内容
        topicUrls.forEach((topicUrl)=>{
            superagent.get(topicUrl).end((err,res)=>{
                if(err){
                    console.log("some error occured...");
                    return;
                }
                ep.emit('topic_detail', [topicUrl,res.text]);
            });
        });
    });
})

app.listen(3000,()=>{
    console.log("app is listening at port 3000...");
});