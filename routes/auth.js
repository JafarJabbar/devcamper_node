const express = require('express');

const {register, login, getMe, forgotPassword, resetPassword,updateUser,updatePassword, logout} = require('../controllers/auth');
const router = express.Router();
const {protect} = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/me').get(protect, getMe);
router.route('/forgot').post(forgotPassword);
router.route('/reset/:token').put(resetPassword);
router.route('/update').put(protect,updateUser);
router.route('/password').put(protect,updatePassword);

module.exports = router;
