const express = require('express');
const router = express.Router()

const { detailsModel } = require('./models/details')
const { createModel } = require('./models/searchResultsModel')

router.get('/start', function(req, res) {
    res.render('v2/index');
});


router.get('/results', function(req, res) {
    req.query.page = req.query.page ?? 1
    req.query.pageId = req.query.pageId ?? ''
    req.query.schemes = req.query.schemes ?? [] 
    req.query.amounts = req.query.amounts ?? [] 
    req.query.counties = req.query.counties ?? [] 
    req.query.sortBy = req.query.sortBy ?? 'score' 

    res.render('v2/results', createModel(req.query));
});

router.get('/details', function(req, res) {
    res.render('v2/details', detailsModel(req.query));
});

module.exports = router
