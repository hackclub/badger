const fetch = require('isomorphic-unfetch')
const qs = require('qs')
const axios = require('axios')

export const getEmoji = () =>
  new Promise((res, rej) => {
    axios
      .post(
        'https://slack.com/api/emoji.list',
        qs.stringify({ token: process.env.OAUTH })
      )
      .then(resp => resp.data)
      .then(data => res(data))
  })

export const send = (user, text, ts) =>
  new Promise((res, rej) => {
    axios
      .post(
        'https://slack.com/api/chat.postMessage',
        qs.stringify({
          token: process.env.OAUTH,
          channel: user,
          text,
          thread_ts: ts
        })
      )
      .then(() => res())
  })

export const removeStatus = user => {
  const token = 'Bearer ' + process.env.OAUTH
  return new Promise((res, rej) => {
    axios
      .post(
        'https://slack.com/api/users.profile.set',
        { profile: { status_emoji: '', status_text: '' } },
        { headers: { 'X-Slack-User': user, Authorization: token } }
      )
      .then(resp => resp.data)
      .then(data => res(data))
  })
}

export const isIn = async (text = '', user = '') => {
  let list = await fetch(
    'https://airbridge.hackclub.com/v0.1/Operations/Badges?cache=true'
  ).then(resp => resp.json())
  list = list.map(({ fields }) => ({
    label: fields['Emoji Tag'] || '',
    people: (fields['People Slack IDs'] || '').split(',') || []
  }))
  const emojis = []
  list.forEach(badge => {
    if (!badge.people.includes(user) && text.includes(badge.label)) {
      emojis.push(badge.label)
    }
  })
  return emojis
  /*
    getEmoji().then(all => {
      base('Badges')
        .select({ view: 'Grid view' })
        .eachPage(
          (records, fetchNextPage) => {
            records.forEach(record => {
              let hunk =
                'alias:' +
                record
                  .get('Emoji Tag')
                  .substring(1, record.get('Emoji Tag').length - 1)
              if (text.includes(record.get('Emoji Tag'))) {
                if (!record.get('People Slack IDs').split(',').includes(user)) {
                  inside = true
                  emojis.push(record.get('Emoji Tag'))
                }
              } else if (Object.values(all.emoji).indexOf(hunk) != -1) {
                let indices = []
                let idx = Object.values(all.emoji).indexOf(hunk)
                while (idx != -1) {
                  indices.push(idx)
                  idx = Object.values(all.emoji).indexOf(hunk, idx + 1)
                }
                indices.map(key => {
                  if (text.includes(':' + Object.keys(all.emoji)[key] + ':')) {
                    if (
                      !record.get('People Slack IDs').split(',').includes(user)
                    ) {
                      inside = true
                      emojis.push(record.get('Emoji Tag'))
                    }
                  }
                })
              }
            })
            fetchNextPage()
          },
          err => {
            if (err) {
              rej(err)
            } else {
              res(emojis)
            }
          }
        )
    })
  */
}

export const del = (ts, channel) =>
  new Promise((resolve, reject) => {
    axios
      .post(
        'https://slack.com/api/chat.delete',
        qs.stringify({ token: process.env.OAUTH, channel, ts })
      )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
