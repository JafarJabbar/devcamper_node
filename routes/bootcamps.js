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


//include other routes
const courseRoute = require('../routes/courses');
const reviewRoute = require('../routes/reviews');

//Re-route into other resource routers
router.use('/:bootcampId/courses',courseRoute);
router.use('/:bootcampId/reviews',reviewRoute);


router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius);

router
    .route('/')
    .get(advancedResults(Bootcamp,'courses'),getBootcamps)
    .post(protect,authorize('Publisher','Admin'),createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect,authorize('Publisher','Admin'),updateBootcamp)
    .delete(protect,authorize('Publisher','Admin'),deleteBootcamp);


module.exports=router;
