export async function getGeolocation(address) {
  let geolocation = {}

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
  )

  const data = await response.json()

  if (data.status === 'ZERO_RESULTS') {
    // setLoading(false)
    throw new Error('Please enter a correct address')
  }

  geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
  geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

  return geolocation
}
