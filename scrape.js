/**
 * Created by rishabhdev on 06/10/17.
 */
var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');
var config = require("./config");

var max_concurrent_requests = config.max_concurrent_requests;
var concurrent_requests = 0;
var queue = [];
var baseUrl = config.url_to_scrape;

function makeApiCall(url){
    if(url) {
        queue.unshift(url);
    }
    while(concurrent_requests<max_concurrent_requests) {
        var nextUrl = queue.pop();
        if(nextUrl) {
            (function(nextUrl){
                concurrent_requests++;
                request(nextUrl, function (error, response, body) {
                    var invalidUrl;
                    concurrent_requests--;
                    if(body) {
                        var $ = cheerio.load(body);
                        var anchors = $("a");
                        var data = "";
                        for (var i = 0; i < anchors.length; i++) {
                            url = $(anchors[i]).attr("href");
                            if(!url || url === "#" || url === "javascript:void(0)"){
                                invalidUrl = true;
                            }
                            else{
                                invalidUrl = false;
                            }
                            if (!invalidUrl) {
                                makeApiCall(url);
                                data += url + ", " + nextUrl + "\n";
                            }
                        }
                        //console.log(data);
                        fs.appendFile('urls.csv',data, function (err) {
                            if (err) throw err;
                        });
                    }
                    else{
                        makeApiCall();
                    }
                });
            })(nextUrl)

        }
        else{
            break;
        }
    }
}


makeApiCall(baseUrl);
