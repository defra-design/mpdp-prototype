const express = require('express');
const router = express.Router()

const { detailsModel } = require('./models/details')
const { resultsModel } = require('./models/search/resultsModel')
const { getSearchSuggestions } = require('./backend/api')

router.get('/start', function(req, res) {
    res.render('v3/index');
});


router.get('/results', function(req, res) {
    req.query.page = req.query.page ?? 1
    req.query.pageId = req.query.pageId ?? ''
    req.query.schemes = req.query.schemes ?? [] 
    req.query.amounts = req.query.amounts ?? [] 
    req.query.counties = req.query.counties ?? [] 
    req.query.sortBy = req.query.sortBy ?? 'score' 

    res.render('v3/results', resultsModel(req.query));
});

router.get('/details', function(req, res) {
    req.query.page = req.query.page ?? 1
    res.render('v3/details', detailsModel(req.query));
});

router.get('/suggestions', function(req, res) {
    res.status(200).send(getSearchSuggestions(req.query.searchString))
});

module.exports = router
