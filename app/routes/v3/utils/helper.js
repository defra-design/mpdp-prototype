const schemeStaticData = require('../data/schemeStaticData')
const { amounts: staticAmounts } = require('../data/filters/amounts')

const getReadableAmount = (amount) => {
	if(typeof amount !== 'number') {
		return '0'
	}

	return amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

const getSchemeStaticData = (schemeName) => schemeStaticData.find(x => x.name === schemeName)

const getAllSchemesNames = () => schemeStaticData.map(x => x.name)

const getMatchingStaticAmounts = (amounts) => {
	if(!amounts || !amounts.length) {
	  return []
	}
  
	const _amounts = amounts?.map(x => parseFloat(x))
  
	const returnAmounts = staticAmounts.filter(range => {
	  const [from, to] = range.value.split('-')
	  return _amounts?.some(amount => {
		if(!to) {
		  return amount > parseFloat(from);
		}
  
		return amount >= parseFloat(from) && amount <= parseFloat(to)
	  })
	})
  
	return returnAmounts
  }

module.exports = {
	getReadableAmount,
	getSchemeStaticData,
	getAllSchemesNames,
	getMatchingStaticAmounts
}
  