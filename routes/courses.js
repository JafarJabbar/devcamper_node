const express = require('express');
const Course = require('../models/Course');
const {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');
const {protect , authorize} = require('../middleware/auth');
const advancedResults= require('../middleware/advancedResult');
const router = express.Router({mergeParams: true});
router
    .route('/')
    .get(advancedResults(Course,{
        path:'bootcamp',
        select:'name description'
    }),getCourses)
    .post(protect, authorize('Publisher','Admin'),addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('Publisher','Admin'),updateCourse)
    .delete(protect, authorize('Publisher','Admin'),deleteCourse);


module.exports=router;
