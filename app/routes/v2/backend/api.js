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
	const filteredResults = applyFilters(dummyResults, filterBy)

	// Find matching results
	const searchResults = filteredResults.filter(
		(x) =>
			includes(x.payee_name, searchQuery) ||
			includes(x.town, searchQuery) ||
			includes(x.county_council, searchQuery) ||
			includes(x.part_postcode, searchQuery)
	);

	if (!searchResults) {
		return {
			results: [],
			total: 0,
		};
	}

	const sortedResults = getSortedResults(searchResults, sortBy)
	return {
		results: sortedResults.slice(offset, offset + limit),
		total: sortedResults.length,
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
