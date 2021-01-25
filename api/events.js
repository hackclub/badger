const { isIn, send, del, removeStatus } = require('../utils')

module.exports = async (req, res) => {
  // Prevent non-POST requests
  if (req.method !== 'POST') {
    console.error('Non-POST request')
    return res.status(405).json({ error: 'Method not allowed, use POST' })
  }
  // Prevent non-Slack requests
  if (process.env.TOKEN !== req.body.token) {
    console.error('Token missing')
    console.log('Expected:', process.env.TOKEN, 'Received:', req.body.token)
    return res.status(403).json({ error: 'Token missing or incorrect' })
  }
  // For Slack verification
  if (req.body.challenge && !req.body.event) {
    console.log('Received challenge but no event')
    return res.send(req.body.challenge)
  }
  // Parse Slack events
  try {
    const { event } = req.body
    if (
      event.type === 'message' &&
      event.subtype !== 'message_deleted' &&
      event.subtype !== 'channel_join'
    ) {
      let { ts, text, user, message, channel, thread_ts } = event
      if (!user && message) {
        user = message.user
        ts = message.ts
        text = message.text
        thread_ts = message.thread_ts
      }
      if (!message && event.attachments) {
        message = event.attachments[0]
        if (!text) text = message.text
      }
      // add block text
      if (message.blocks) {
        for (const block of message.blocks) {
          if (block.type === "section") {
            if (block.text && (block.text.type === "mrkdwn" || block.text.emoji === true)) {
              text += block.text.text
            }
            if (block.fields) {
              for (const field of block.fields) {
                if (field.text.type === "mrkdwn" || field.text.emoji === true) {
                  text += field.text.text
                }
              }
            }
          }
        }
      }
      // text = JSON.stringify(event)
      if (!message && !user) return res.json({})
      const emojis = await isIn(text, user)
      console.log('MESSAGE', text, user, emojis)
      if (emojis.length > 0) {
        console.log(
          `Grrr… <@${user}> has been naughty and emoji in a message the wrong way! The bad bad message was \n> ${text} \n in the channel <#${channel}>`
        )
        send(
          process.env.LOGS,
          `Grrr… <@${user}> has been naughty and emoji in a message the wrong way! The bad bad message was \n> ${text} \n in the channel <#${channel}>`
        )
        send(
          user,
          `Grrr…your message \n> ${
            event.text || 'Attchment sent by bot…'
          } \n was taken down in violation of using the restricted emoji ${emojis.join(
            ' '
          )}! Grrr…don’t do this again!`
        ).catch(err => console.error(err))
        del(ts, channel)
      }
    }
    /*
    else if (event.type == 'reaction_added') {
      let { user, reaction } = event
      isIn(`:${reaction}:`, user).then(emojis => {
        if (emojis.length > 0) {
          send(
            process.env.LOGS,
            `Grrr..... <@${user}> has been naughty and emoji in a reaction the wrong way! The bad bad emoji was :${reaction}: in channel <#${event.item.channel}>`
          )
          send(
            user,
            `Grrr..... a reaction you posted has had a restricted emoji. The admins will be contacted. The emoji you used was :${reaction}:! Grrr..... don't do this again!`
          )
        }
      })
    }
    */
  } finally {
    res.send(req.body.challenge)
  }
}
