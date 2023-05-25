const { getReadableAmount, getSchemeStaticData } = require('../utils/helper')
const api = require('../backend/api')

const detailsModel = ({ payeeName, searchString, page }) => {
  const farmerDetails = api.getPaymentDetails(payeeName)
  
  if(!farmerDetails) {
    return {
      searchString: searchString,
      page: page
    }
  }

  const { payee_name, part_postcode, town, county_council, parliamentary_constituency, financial_year } = farmerDetails
  const [startYear, endYear] = farmerDetails.financial_year.split('/')
  const summary = { 
    payee_name, 
    part_postcode, 
    town, 
    county_council,
    parliamentary_constituency,
    financial_year, 
    total: '',
    schemes: [],
    startYear: `20${startYear}`,
    endYear: `20${endYear}`
  }
  
  let farmerTotal = 0
  farmerDetails.schemes.forEach((scheme) => {
    const amount = parseFloat(scheme.amount)
    farmerTotal += amount

    const schemeDetails = {
      name: scheme.scheme_detail,
      amount: getReadableAmount(amount),
    }

    const schemeData = summary.schemes.find(x => x?.name.toLowerCase() === scheme.scheme.toLowerCase())
    if(!schemeData) {
      const schemeData = getSchemeStaticData(scheme.scheme)
      summary.schemes.push({
        name: scheme.scheme,
        description: schemeData?.description || '',
        link: schemeData?.link || '',
        total: amount,
        readableTotal: getReadableAmount(amount),
        schemeTypes: [schemeDetails]
      })
    }
    else {
      schemeData.total += amount
      schemeData.readableTotal = getReadableAmount(schemeData.total)
      schemeData.schemeTypes.push(schemeDetails)
    }
  })

  summary.total = getReadableAmount(farmerTotal)
  return {
		summary,
    searchString: searchString,
    page: page
	}
}

module.exports = {
    detailsModel
}