import { getEmoji } from '../utils.js'

export default async (req) => {
  try {
    const { emoji } = await getEmoji()
    console.log(`Got ${Object.keys(emoji || {}).length} emoji`)
    return Response.json(emoji)
  } catch (error) {
    console.error(error)
    return Response.json({ error }, { status: 500 })
  }
}
