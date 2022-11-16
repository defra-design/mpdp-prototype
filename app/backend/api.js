const dummyResults = require('../data/mockResults.js')

const includes = (string1, string2) => string1.toLowerCase().includes(string2.toLowerCase())

const search = (searchQuery, offset = 0, limit = 50) => {
    const results = dummyResults.filter(x =>
        includes(x.payee_name, searchQuery) ||
        includes(x.town, searchQuery) ||
        includes(x.county_council, searchQuery) ||
        includes(x.part_postcode, searchQuery)
    )
    if(!results) {
        return {
            results: [],
            total: 0
        }
    }

    return { 
        results: results.slice(offset, offset + limit),
        total: results.length
    }
}

module.exports = {
    search
}
