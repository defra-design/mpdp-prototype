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
  let schemeTotal = 0
  farmerDetails.schemes.forEach((scheme) => {
    const amount = parseFloat(scheme.amount)
    
    farmerTotal += amount
    schemeTotal += amount

    const schemeDetails = {
      name: scheme.scheme_detail,
      activityLevel: scheme.activity_detail,
      amount: getReadableAmount(amount),
    }

    const index = summary.schemes?.findIndex(x => x?.name === scheme.scheme)
    if(index === -1) {
      const schemeData = getSchemeStaticData(scheme.scheme)
      schemeTotal = amount;
      summary.schemes.push({
        name: scheme.scheme,
        description: schemeData?.description || '',
        link: schemeData?.link || '',
        total: getReadableAmount(schemeTotal),
        schemeTypes: [schemeDetails]
      })
    }
    else {
      summary.schemes[index].total = getReadableAmount(schemeTotal)
      summary.schemes[index].schemeTypes.push(schemeDetails)
    }
  })

  summary.total = getReadableAmount(farmerTotal)
	
  return {
		summary,
		searchString: searchString,
		page
  }
}

module.exports = {
    detailsModel
}