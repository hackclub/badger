var Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.AIRTABLE }).base(process.env.BASE);
var qs = require('qs');
const axios = require("axios")

var regex = /:(.*?):/g;

var send = (user,text,ts) => {
	return new Promise((res,rej) => {
		axios.post("https://slack.com/api/chat.postMessage",qs.stringify({"token":process.env.BOT,"channel":user,"text":text,"as_user":true,"thread_ts":ts}))
			.then(() => {
        res();
      })
      .catch((err) => {
        console.log(err)
        rej(err);
      })
	})
}
var isIn = (emoji,user) => {
	return new Promise((res,rej) => {
		let inside = false;
		base('Badges')
		.select({
			view: "Grid view"
		}).eachPage((records, fetchNextPage) => {
			records.forEach((record) => {
				if (record.get("Emoji Tag") == emoji ) {
          if (!record.get("People Slack IDs").split(",").includes(user)) {
					  inside = true; 
				  }
        }
        
			});
			fetchNextPage();
		}, (err) => {
			if (err) {
				rej(err);
			} else {
				res(inside);
			}
		});
	})
}
var del = (ts, channel) => {
  return new Promise((resolve, reject) => {
    axios.post("https://slack.com/api/chat.delete", qs.stringify({ "token": process.env.OAUTH, "channel": channel, "ts": ts }))
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
  });
}

module.exports = {
    "regex":regex,
    "isIn":isIn,
    "send":send,
    "del":del
}