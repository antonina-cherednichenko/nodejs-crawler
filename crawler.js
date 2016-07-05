#!/usr/bin/env node

var request = require("request");
var cheerio = require("cheerio");
var url = "http://edition.cnn.com/2016/06/29/opinions/make-the-uk-the-51st-state/index.html";

//main function - get comments for given URL
retrieveComments(url);

function retrieveComments(url) {
  //request for getting article id
  request(url, function(error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      $('div').each(function(i, elem) {
        var articleId = $(this).attr('data-article-id');
        if (articleId) {
          var reqURL = formRequestURL(articleId);

          //request for getting comments
          request(reqURL, function(error, response, body) {
            if (!error) {
              var json = JSON.parse(body);
              printComments(json.headDocument.content)
            } else {
              console.log("We’ve encountered an error: " + error);
            }
          });
        }
      });
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
}

function printComments(comments) {
  comments.forEach(function(comment) {
    var commentBody = comment.content.bodyHtml;
    if (commentBody) {
      console.error("Comment = ", commentBody);
    }
  });
}

//TODO - network, networkName, siteId can be obtained from url html body together with articleID,
//wasn't mentioned in the task
function formRequestURL(articleId) {
  var networkName = "cnn";
  var network = "cnn.fyre.co";
  var siteId = "353270";
  var base64ArticleId = new Buffer(articleId).toString('base64');
  var templateURL = "https://{networkName}.bootstrap.fyre.co/bs3/v3.1/{network}/{siteId}/{b64articleId}/init";
  return templateURL.replace("{networkName}", networkName).replace("{network}", network)
    .replace("{siteId}", siteId).replace("{b64articleId}", base64ArticleId);
}

