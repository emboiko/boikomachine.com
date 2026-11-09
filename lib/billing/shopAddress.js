import { BUSINESS } from '@/lib/constants'

export const formatShopMailingAddress = () => {
  const address = BUSINESS.mailingAddress
  const lines = []

  if (address.line1) {
    lines.push(address.line1)
  }

  if (address.line2) {
    lines.push(address.line2)
  }

  const cityParts = []

  if (address.city) {
    cityParts.push(address.city)
  }

  if (address.region) {
    cityParts.push(address.region)
  }

  let cityLine = cityParts.join(', ')

  if (address.postalCode) {
    if (cityLine) {
      cityLine = `${cityLine} ${address.postalCode}`
    } else {
      cityLine = address.postalCode
    }
  }

  if (cityLine) {
    lines.push(cityLine)
  }

  return lines.join('\n')
}
