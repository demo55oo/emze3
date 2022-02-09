const formatter = Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export default function formatMoney(price) {
  return formatter.format(price)
}
