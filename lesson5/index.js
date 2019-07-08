const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy');
const url = require('url');
const async = require('async');


const app = express();
const cnodeUrl = "https://cnodejs.org/";

let concurrentCnt = 0;
let currentCnt = 0;

app.get('/', (req, resp) => {
    superagent.get(cnodeUrl).end((err, sresp) => {
        if (err) {
            console.log("some error occured...");
            return;
        }
        // 将获取到的网页内容装在到cheerio中
        let $ = cheerio.load(sresp.text);
        let topicUrls = [];

        // 对网页内容进行解析，获取所有主题的URL
        $('#topic_list .topic_title').each((idx, element) => {
            let $element = $(element);
            let topicUrl = url.resolve(cnodeUrl, $element.attr('href'));
            topicUrls.push(topicUrl);
        });

        // 获取所有url的内容，但是控制并发数不超过3
        async.mapLimit(topicUrls, 3, (url, callback) => {
            concurrentCnt++;
            currentCnt++;
            console.log("这是" + currentCnt + "个请求，当前并发数是：" + concurrentCnt);
            superagent.get(url).end((err, res) => {
                // 请求完成一个，则并发数减一
                concurrentCnt--;
                callback(null, url);
            });
        }, (err, result) => {
            // 等到所有请求完成，执行该处回调
            console.log(result);
            resp.send(result);
        });
    });
})

app.listen(3000, () => {
    console.log("app is listening at port 3000...");
});