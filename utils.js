export const getEmoji = async () => {
  const res = await fetch('https://slack.com/api/emoji.list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token: process.env.OAUTH })
  })
  return res.json()
}

export const send = async (user, text, ts) => {
  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      token: process.env.OAUTH,
      channel: user,
      text,
      ...(ts && { thread_ts: ts })
    })
  })
}

export const removeStatus = async (user) => {
  const token = 'Bearer ' + process.env.OAUTH
  const res = await fetch('https://slack.com/api/users.profile.set', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Slack-User': user,
      Authorization: token
    },
    body: JSON.stringify({ profile: { status_emoji: '', status_text: '' } })
  })
  return res.json()
}

export const isIn = async (text = '', user = '') => {
  const resp = await fetch(
    'https://airbridge.hackclub.com/v0.1/Operations/Badges?cache=true'
  )
  let list = await resp.json()
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
}

export const del = async (ts, channel) => {
  const res = await fetch('https://slack.com/api/chat.delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token: process.env.OAUTH, channel, ts })
  })
  return res.json()
}
