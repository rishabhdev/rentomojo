/**
 * Created by rishabhdev on 11/10/17.
 */
/**
 * Created by rishabhdev on 06/10/17.
 */
var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');
var config = require("./config");
var async = require("async");

var max_concurrent_requests = config.max_concurrent_requests;
var baseUrl = config.url_to_scrape;
var store = {};


function scrapeUrls(urls){
    var tempArray = [];
    if(urls.length) {
        async.eachLimit(urls, max_concurrent_requests, function (nextUrl, callback) {
            request(nextUrl, function (error, response, body) {
                var invalidUrl, url;
                if (body) {
                    var $ = cheerio.load(body),data;
                    var anchors = $("a");
                    for (var i = 0; i < anchors.length; i++) {
                        url = $(anchors[i]).attr("href");
                        if (!url || url === "#" || url === "javascript:void(0)") {
                            invalidUrl = true;
                        }
                        else {
                            invalidUrl = false;
                        }
                        if (!invalidUrl && !store[url]) {
                            store[url] = true;
                            data+=url+"\n";
                            console.log(url);
                            tempArray.push(url);
                        }
                    }
                    fs.appendFile('urls.csv', data, function (err) {
                        if (err) throw err;
                    });
                    callback();

                }
                else {
                    callback();
                }
            });
        }, function (err) {
            // if any of the saves produced an error, err would equal that error
            scrapeUrls(tempArray);
            console.log(tempArray);

        });
    }

}

scrapeUrls([baseUrl]);
