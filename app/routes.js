const api = require('./backend/api')

const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
router.get('/results', function(req, res) {
    const { searchString } = req.query
    const { results, total } = api.search(searchString)
    res.render('results', { 
        total,
        results,
        searchQuery: searchString
    });
});

module.exports = router
