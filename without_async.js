/**
 * Created by rishabhdev on 06/10/17.
 */
var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');
var config = require("./config");

var concurrent_requests = 0;
var queue = [];
var baseUrl ="https://angularjs.org/";

function makeApiCall(url){
    if(url) {
        queue.unshift(url);
    }
    while(concurrent_requests<5) {
        var nextUrl = queue.pop();
        if(nextUrl) {
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
        }
        else{
            break;
        }
    }
    if(concurrent_requests<5)
     console.log(concurrent_requests);
}


makeApiCall(baseUrl);
