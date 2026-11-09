// Persisted money is integer cents. All conversion and arithmetic stays in this module.

export const assertCents = (cents) => {
  if (typeof cents !== 'number' || !Number.isSafeInteger(cents)) {
    throw new Error('Money amounts must be integer cents.')
  }

  return cents
}

export const dollarsToCents = (dollarInput) => {
  if (typeof dollarInput !== 'string') {
    throw new Error('Dollar amounts must be strings.')
  }

  const trimmed = dollarInput.trim().replace(/[$,]/g, '')

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error('Enter a dollar amount with up to two decimal places.')
  }

  const pieces = trimmed.split('.')
  const dollarText = pieces[0]
  const fractionText = pieces[1] || ''
  const dollars = Number(dollarText)
  const paddedFraction = `${fractionText}00`.slice(0, 2)
  const fraction = Number(paddedFraction)
  const cents = dollars * 100 + fraction

  return assertCents(cents)
}

export const centsToDollarInput = (cents) => {
  const safeCents = assertCents(cents)
  let sign = ''
  let absoluteCents = safeCents

  if (safeCents < 0) {
    sign = '-'
    absoluteCents = -safeCents
  }

  const dollars = Math.floor(absoluteCents / 100)
  const remainder = absoluteCents % 100
  const remainderText = String(remainder).padStart(2, '0')

  return `${sign}${dollars}.${remainderText}`
}

export const formatCents = (cents) => {
  const safeCents = assertCents(cents)
  let sign = ''
  let absoluteCents = safeCents

  if (safeCents < 0) {
    sign = '-'
    absoluteCents = -safeCents
  }

  const dollars = Math.floor(absoluteCents / 100)
  const remainder = absoluteCents % 100
  const dollarText = dollars.toLocaleString('en-US')
  const remainderText = String(remainder).padStart(2, '0')

  return `${sign}$${dollarText}.${remainderText}`
}

export const addCents = (leftCents, rightCents) => {
  const total = assertCents(leftCents) + assertCents(rightCents)

  return assertCents(total)
}

export const sumCents = (amounts) => {
  let total = 0

  for (const amount of amounts) {
    total = addCents(total, amount)
  }

  return total
}

export const subtractCents = (leftCents, rightCents) => {
  const difference = assertCents(leftCents) - assertCents(rightCents)

  return assertCents(difference)
}
