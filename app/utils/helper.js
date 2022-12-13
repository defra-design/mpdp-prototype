const schemeStaticData = require('../data/schemeStaticData')

const getReadableAmount = (amount) => {
	if(typeof amount !== 'number') {
		return '0'
	}

	return amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

const getSchemeStaticData = (schemeName) => schemeStaticData.find(x => x.name === schemeName)

module.exports = {
	getReadableAmount,
	getSchemeStaticData
}
  