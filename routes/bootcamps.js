    const express = require('express');
const {
    getBootcamp,
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius
} = require('../controllers/bootcamps');

const Bootcamp=require('../models/Bootcamp');
const advancedResults=require('../middleware/advancedResult');
const router = express.Router();
const {protect,authorize} = require('../middleware/auth');

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius);

router
    .route('/')
    .get(advancedResults(Bootcamp,'Course'),getBootcamps)
    .post(protect,authorize('Publisher','Admin'),createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect,authorize('Publisher','Admin'),updateBootcamp)
    .delete(protect,authorize('Publisher','Admin'),deleteBootcamp);


module.exports=router;
