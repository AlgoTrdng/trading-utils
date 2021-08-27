const fetch = require('node-fetch')

/**
 * @param {string} url
 * @param {{ body: string; method: 'POST' | 'GET', signature: string, ts: string }} fetchParams
 * @returns
 */
const fetchData = async (url, {
  body, method, signature, ts,
}) => {
  const res = await fetch(url, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      'x-algotrading-api-secret': signature,
      'x-algotrading-timestamp': ts,
    },
  })
  const data = await res.json()

  if (!res.ok || !data.success) {
    console.log(data)
  }

  return data
}

module.exports = fetchData
