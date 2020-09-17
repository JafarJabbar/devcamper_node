const express = require('express');
const Review = require('../models/Review');
const {
    getReviews,
    getReview,
    createReview,
    deleteReview,
    updateReview
} = require('../controllers/reviews');
const {protect , authorize} = require('../middleware/auth');
const advancedResults= require('../middleware/advancedResult');
const router = express.Router({mergeParams: true});
router
    .route('/')
    .get(advancedResults(Review,{
        path:'bootcamp',
        select:'name description'
    }),getReviews)
    .post(protect, authorize('User','Admin'),createReview);

router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('User','Admin'),updateReview)
    .delete(protect, authorize('User','Admin'),deleteReview);


module.exports=router;
