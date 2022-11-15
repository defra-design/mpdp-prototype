const dummyResults = require('../data/mockResults.js')

const search = (searchQuery, offset = 0, limit = 50) => {
    const results = dummyResults.filter(x => x.payee_name.toLowerCase().includes(searchQuery.toLowerCase()))
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
