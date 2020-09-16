const express = require('express');
const User = require('../models/User');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} =require('../controllers/users');
const {protect,authorize}=require('../middleware/auth');
const advancedResults=require('../middleware/advancedResult');
const router=express.Router();
router.use(protect);
router.use(authorize('Admin'));

router.route('/').get(advancedResults(User),getUsers);
router.route('/:id').get(getUser);
router.route('/').post(createUser);
router.route('/:id').put(updateUser);
router.route('/:id').delete(deleteUser);





module.exports = router;