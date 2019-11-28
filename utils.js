var Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.AIRTABLE }).base(process.env.BASE);
var qs = require('qs');
const axios = require("axios")

var getEmoji = () => {
	return new Promise((res,rej) => {
		axios.post("https://slack.com/api/emoji.list",qs.stringify({"token":process.env.OAUTH}))
			.then((data) => {
				res(data.data);
			})
	})
}

var send = (user,text,ts) => {
	return new Promise((res,rej) => {
		axios.post("https://slack.com/api/chat.postMessage",qs.stringify({"token":process.env.OAUTH,"channel":user,"text":text,"thread_ts":ts}))
		.then(() => {
        res();
      })
	})
}
var removeStatus = (user) =>{
	var token = "Bearer "+process.env.OAUTH;
	return new Promise((res,rej) => {
		axios.post("https://slack.com/api/users.profile.set",{"profile":{"status_emoji":"","status_text":""}},{"headers":{"X-Slack-User":user,"Authorization":token}})
		.then((data) => {
        	res(data.data)
      	})
	})
}
var isIn = (text,user) => {
	var emojis = [];
	return new Promise((res,rej) => {
		getEmoji()
		.then((all) => {
		base('Badges')
		.select({
			view: "Grid view"
		}).eachPage((records, fetchNextPage) => {
			records.forEach((record) => {
				let hunk = "alias:"+record.get("Emoji Tag").substring(1, record.get("Emoji Tag").length-1);
				if (text.includes(record.get("Emoji Tag"))) {
						if (!record.get("People Slack IDs").split(",").includes(user)) {
						inside = true;
						emojis.push(record.get("Emoji Tag"))
						}
				} else if (Object.values(all.emoji).indexOf(hunk) != -1) {
					let indices = [];
					let  idx = Object.values(all.emoji).indexOf(hunk);
					while (idx != -1) {
						indices.push(idx);
						idx = Object.values(all.emoji).indexOf(hunk, idx + 1);
					}
					indices.map((key)=> {
						if (text.includes(":"+Object.keys(all.emoji)[key]+":")) {
							if (!record.get("People Slack IDs").split(",").includes(user)) {
									inside = true;
									emojis.push(record.get("Emoji Tag"))
								}
						}
					})
				}
			});
			fetchNextPage();
		}, (err) => {
			if (err) {
				rej(err);
			} else {
				res(emojis);
			}
		});
	})
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
	"del":del,
	"removeStatus":removeStatus
}
