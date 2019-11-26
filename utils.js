var Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.AIRTABLE }).base(process.env.BASE);
var qs = require('qs');
const axios = require("axios")


var send = (user,text,ts) => {
	return new Promise((res,rej) => {
		axios.post("https://slack.com/api/chat.postMessage",qs.stringify({"token":process.env.OAUTH,"channel":user,"text":text,"thread_ts":ts}))
		.then(() => {
			console.log("the ts is: "+ts+" || and the channel is : "+user)
        res();
      })
	})
}
var isIn = (text,user) => {
  var emojis = [];
	return new Promise((res,rej) => {
		let inside = false;
		base('Badges')
		.select({
			view: "Grid view"
		}).eachPage((records, fetchNextPage) => {
			records.forEach((record) => {
				if (text.includes(record.get("Emoji Tag"))) {
          if (!record.get("People Slack IDs").split(",").includes(user)) {
					  inside = true;
            emojis.push(record.get("Emoji Tag"))
				 	}
        }
			});
			fetchNextPage();
		}, (err) => {
			if (err) {
				rej(err);
			} else {
				res(inside,emojis);
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
    "isIn":isIn,
    "send":send,
    "del":del
}
