const express = require('express');
const router = express.Router()

const api = require('../../backend/api')
const { detailsModel } = require('../../models/details')

router.get('/start', function(req, res) {
    res.render('v1/index');
});

router.get('/results', function(req, res) {
    const { searchString } = req.query
    const { results, total } = api.search(searchString)
    res.render('v1/results', { 
        total,
        results,
        searchQuery: searchString
    });
});

router.get('/details', function(req, res) {
    res.render('v1/details', detailsModel(req.query));
});

module.exports = router
