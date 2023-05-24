const dummyResults = require('../data/mockResults.js');
const dummyDetails = require('../data/mockDetails.js');
const config = require('../config/config')

const includes = (string1, string2) =>
	string1.toLowerCase().includes(string2.toLowerCase());

const getPaymentData = (
	searchQuery,
	offset = 0,
	filterBy = {schemes: [], counties: [], amounts: []},
	sortBy = '',
	limit = config.search.limit
) => {
	// Find matching results
	const searchResults = dummyResults.filter(
		(x) =>
			includes(x.payee_name, searchQuery) ||
			includes(x.town, searchQuery) ||
			includes(x.county_council, searchQuery) ||
			includes(x.part_postcode, searchQuery)
	);

	const filteredResults = applyFilters(searchResults, filterBy)

	if (!filteredResults.length) {
		return {
			results: [],
			total: 0,
			filterOptions: getFilterOptions(searchResults) 
		};
	}

	const sortedResults = getSortedResults(filteredResults, sortBy)
	return {
		results: sortedResults.slice(offset, offset + limit),
		total: sortedResults.length,
		filterOptions: getFilterOptions(searchResults) 
	};
};

const applyFilters = (
	searchResults,
	{ schemes = [], counties = [], amounts = [] }
) => {
	let results = filterBySchemes(searchResults, schemes);
	results = filterByCounties(results, counties);
	results = filterByAmounts(results, amounts);
	return results;
};

const filterBySchemes = (results, schemes) => {
	if (!schemes || !schemes.length) {
		return results;
	}
	return results.filter((x) =>
		schemes
			.map((scheme) => scheme?.toLowerCase())
			.includes(x.scheme?.toLowerCase())
	);
};

const filterByAmounts = (results, amounts) => {
	if (!amounts || !amounts.length) {
		return results;
	}
	const amountRanges = amounts.map((range) => {
		const [_from, _to] = range.split('-');
		return { from: parseFloat(_from), to: parseFloat(_to) };
	});

	return results.filter((row) => {
		return amountRanges.some(({ from, to }) => {
			const totalAmount = parseFloat(row.total_amount);
			return !to
				? totalAmount >= from
				: totalAmount >= from && totalAmount <= to;
		});
	});
};

const filterByCounties = (searchResults, counties) => {
	if (!counties || !counties.length) return searchResults;
	const lowerCaseCounties = counties.map((county) => county.toLowerCase());
	return searchResults.filter((x) =>
		lowerCaseCounties.includes(x.county_council.toLowerCase())
	);
};

const getFilterOptions = (searchResults) => {
	if (!searchResults || !searchResults.length) {
	  return { schemes: [], amounts: [], counties: [] }
	}
  
	return {
	  schemes: getUniqueFields(searchResults, 'scheme'),
	  counties: getUniqueFields(searchResults, 'county_council'),
	  amounts: getUniqueFields(searchResults, 'total_amount')
	}
  }
  
  const getUniqueFields = (searchResults, field) => {
	try {
	  return searchResults.reduce((acc, result) => {
		if (!acc.length || acc.findIndex((y) =>
		  y?.toString().toLowerCase() === result[field]?.toString().toLowerCase()) === -1) {
		  acc.push(result[field].toString())
		}
		return acc
	  }, [])
	} catch (error) {
	  console.error(error)
	  return []
	}
  }

const getSortedResults = (records, sortBy) => {
  if (sortBy && sortBy !== 'score') {
    if (config.search.fieldsToSearch.includes(sortBy)) {
      return records.sort((r1, r2) => r1[sortBy] > r2[sortBy] ? 1 : -1)
    }
  }
  return records
}

const getPaymentDetails = (payee_name) => {
	return dummyDetails.find((x) =>
		x.payee_name.toLowerCase().includes(payee_name.toLowerCase())
	);
};

module.exports = {
	getPaymentData,
	getPaymentDetails,
};
