import { getEmoji } from '../utils.js'

export default {
  async fetch(request) {
    try {
      const data = await getEmoji()
      const emoji = data.emoji || {}
      console.log(`Got ${Object.keys(emoji).length} emoji`)
      return Response.json(emoji)
    } catch (error) {
      console.error(error)
      return Response.json({ error: error.message }, { status: 500 })
    }
  }
}
