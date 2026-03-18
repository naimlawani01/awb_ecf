/**
 * Convert a number to French words (for invoice amounts).
 * Supports numbers up to 999 999 999.
 */
const UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']
const TEN_UNITS = ['', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']

function toWordsUnder100(n) {
  if (n === 0) return ''
  if (n < 10) return UNITS[n]
  if (n < 20) return TEN_UNITS[n - 10]
  const tens = Math.floor(n / 10)
  const units = n % 10
  if (tens === 7) return 'soixante-' + (units === 0 ? 'dix' : (TEN_UNITS[units] || UNITS[units]))
  if (tens === 9) return 'quatre-vingt-' + (units === 0 ? '' : UNITS[units])
  return TENS[tens] + (units > 0 ? '-' + UNITS[units] : '')
}

function toWordsUnder1000(n) {
  if (n === 0) return ''
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  let result = ''
  if (hundreds > 0) {
    result = hundreds === 1 ? 'cent' : UNITS[hundreds] + ' cent'
    if (rest > 0) result += ' '
  }
  if (rest > 0) result += toWordsUnder100(rest)
  return result
}

export function numberToFrenchWords(n) {
  const intPart = Math.floor(n)
  if (intPart === 0) return 'zéro'
  if (intPart >= 1e9) return n.toString()

  const millions = Math.floor(intPart / 1e6)
  const thousands = Math.floor((intPart % 1e6) / 1e3)
  const units = intPart % 1e3

  const parts = []
  if (millions > 0) {
    const m = millions === 1 ? 'million' : 'millions'
    parts.push(toWordsUnder1000(millions) + ' ' + m)
  }
  if (thousands > 0) {
    const t = toWordsUnder1000(thousands)
    parts.push(t === 'un' ? 'mille' : t + ' mille')
  }
  if (units > 0) {
    parts.push(toWordsUnder1000(units))
  }

  return parts.join(' ')
}
