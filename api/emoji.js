import { getEmoji } from '../utils.js'

export default {
  async fetch(request) {
    try {
      const { emoji } = await getEmoji()
      console.log(`Got ${Object.keys(emoji || {}).length} emoji`)
      return Response.json(emoji)
    } catch (error) {
      console.error(error)
      return Response.json({ error: String(error) }, { status: 500 })
    }
  }
}
