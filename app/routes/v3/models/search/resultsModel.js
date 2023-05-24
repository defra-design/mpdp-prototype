const { getPaymentData } = require('../../backend/api') 
const { amounts: staticAmounts } = require('../../data/filters/amounts')
const { counties: staticCounties } = require('../../data/filters/counties')
const { sortByItems } = require('../../data/sortByItems')
const config = require('../../config/config')

const { getReadableAmount, getAllSchemesNames, getMatchingStaticAmounts } = require('../../utils/helper')

const getTags = (query) => {
  const tags = {
    Scheme: getAllSchemesNames().reduce((acc, scheme) => {
      if(query.schemes?.includes(scheme)) {
        acc.push({
					text: scheme,
					value: scheme
        })
      }
      
      return acc
    }, []),
    Amount: staticAmounts?.reduce((acc, amount) => {
      if((typeof query.amounts === 'string')? query.amounts === amount.value : query.amounts?.includes(amount.value)) {
        const amountParts = amount.text.split('to')
        const text = (amountParts[1] === undefined) ? amountParts[0] : `Between ${amountParts[0].trim()} and ${amountParts[1].trim()}`
        acc.push({
					text,
					value: amount.value
				})
      }

      return acc
    }, []),
    County: staticCounties?.reduce((acc, county) => {
      if((typeof query.counties === 'string')? query.counties === county : query.counties?.includes(county)) {
        acc.push({
					text: county,
					value: county
				})
      }

      return acc
    }, [])
  }
  
  for(let key in tags) {
    if(tags[key].length == 0) {
      delete tags[key]
    }
  }

  return tags;
}

const getFilters = (query, filterOptions) => {
  const schemesLength = !query.schemes? 0 : (typeof query.schemes === 'string'? 1: query.schemes?.length)
  const amountsLength = !query.amounts? 0 : (typeof query.amounts === 'string'? 1: query.amounts?.length)
  const countiesLength = !query.counties? 0 : (typeof query.counties === 'string'? 1: query.counties?.length)
  const attributes = {
    onchange: "this.form.submit()"
  }

  return {
    schemes: {
      name: 'Scheme',
      items: getSchemes(filterOptions.schemes).map(scheme => ({ 
        text: scheme, 
        value: scheme,
        checked: isChecked(query.schemes, scheme),
        attributes
      })).sort((a, b) => a.text.localeCompare(b.text)),
      selected: schemesLength
    },
    amounts: {
      name: 'Amount',
      items: getAmounts(filterOptions.amounts).map(({text, value}) => ({
        text,
        value,
        checked: isChecked(query.amounts, value),
        attributes
      })),
      selected: amountsLength
    },
    counties: {
      name: 'County',
      items: getCounties(filterOptions.counties).map((county) => ({
        text: county,
        value: county,
        checked: isChecked(query.counties, county),
        attributes
      })),
      selected: countiesLength
    }
  }
}

const getSchemes = (schemes) => schemes?.length ? schemes : getAllSchemesNames()

const getAmounts = (amounts) => amounts?.length ? amounts : staticAmounts

const getCounties = (counties) => counties?.length ? counties : staticCounties

const isChecked = (field, value) => (typeof field === 'string')? field === value : field?.includes(value)

const getSortByModel = (query) => ({
    selected: decodeURIComponent(query.sortBy),
    items: sortByItems
})

const getPaginationAttributes = (totalResults, requestedPage, searchString, filterBy, sortBy) => {
  const encodedSearchString = encodeURIComponent(searchString)
  const totalPages = Math.ceil(totalResults / config.search.limit)

  let prevHref = `/v3/results?searchString=${encodedSearchString}&page=${requestedPage - 1}`
  let nextHref = `/v3/results?searchString=${encodedSearchString}&page=${requestedPage + 1}`
  for(let key in filterBy) {
    if(filterBy[key]?.length) {
      const urlParam = `&${key}=`
      const urlPart = `${urlParam}${filterBy[key].join(urlParam)}`
      prevHref += urlPart
      nextHref += urlPart 
    }
  }

  if(sortBy) {
    const encodedSortBy = encodeURIComponent(sortBy)
    prevHref += `&sortBy=${encodedSortBy}`
    nextHref += `&sortBy=${encodedSortBy}`
  }
  
  const previous = requestedPage <= 1 ? null : {
    href: prevHref,
    labelText: `${requestedPage - 1} of ${totalPages} `,
    attributes: {
      id: 'prevOption',
      "aria-label": "Go to previous page of results: " + `${requestedPage - 1} of ${totalPages} `
    }
  }

  const next = totalPages <= 1 || totalPages === requestedPage ? null : {
    href: nextHref,
    labelText: `${requestedPage + 1} of ${totalPages} `,
    attributes: {
      id: 'nextOption',
      "aria-label": "Go to next page of results: " + `${requestedPage + 1} of ${totalPages} `
    }
  }

  return { previous, next }
}

const performSearch = (searchString, requestedPage, filterBy, sortBy) => {
  const offset = (requestedPage - 1) * config.search.limit
  const paymentData = getPaymentData(searchString, offset, filterBy, sortBy)
  const results = paymentData.results?.map((x) => ({...x, amount: getReadableAmount(parseFloat(x.total_amount))}))
  return {
    ...paymentData,
    results
  }
}

const resultsModel = (query, error) => {
  const searchString = decodeURIComponent(query.searchString)
  const defaultReturn = {
    hiddenInputs: [
      { id: 'pageId', name: 'pageId', value: 'results' },
      { id: 'sortBy', name: 'sortBy', value: 'score' }
    ],
    tags: getTags(query),
    sortBy: getSortByModel(query)
  }
  
  if(error) {
    return {
      ...defaultReturn,
      filters: getFilters(query, {
        schemes: getAllSchemesNames(),
        amounts: staticAmounts,
        counties: staticCounties
      }),
      errorList: [{
        text: "Enter a search term",
        href: "#resultsSearchInput"
      }],
      headingTitle: `Results for ‘${searchString}’`,
      total: 0
    }
  }

  const sortBy = decodeURIComponent(query.sortBy)
  const requestedPage = parseInt(query.page)
  const filterBy = {
    schemes: typeof query.schemes === 'string' ? [query.schemes]: query.schemes,
    amounts: typeof query.amounts === 'string' ? [query.amounts]: query.amounts,
    counties: typeof query.counties === 'string' ? [query.counties]: query.counties
  }

  const { results, total, filterOptions } = performSearch(searchString, requestedPage, filterBy, sortBy)
  
  return {
    ...defaultReturn,
    searchString,
    ...getPaginationAttributes(total, requestedPage, searchString, filterBy, sortBy),
    filters: getFilters(query, {...filterOptions, amounts: getMatchingStaticAmounts(filterOptions?.amounts)}),
    results,
    total,
    currentPage: requestedPage,
    headingTitle: `${total ? 'Results for' : 'We found no results for'} ‘${searchString}’`
  }
}

module.exports = {
  resultsModel
}