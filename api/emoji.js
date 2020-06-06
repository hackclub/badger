const { getEmoji } = require('../utils')

module.exports = (req, res) =>
  getEmoji()
    .then(({ emoji }) => {
      console.log(`Got ${Object.keys(emoji || {}).length} emoji`)
      return res.json(emoji)
    })
    .catch(error => console.error(error) || res.status(500).json({ error }))
