const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add name.']
    },
    email: {
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please add valid email address.'
        ],
        required: [true, 'Please add email.'],
        unique: [true, 'This email already taken. Please add another email address.'],
        type: String
    },
    role: {
        type: String,
        enum: ['User', 'Publisher', 'Admin'],
        default: 'User'
    },
    password: {
        type: String,
        required: [true, 'Please add password.'],
        minlength: [6, 'Password must be longer than 6 symbols.'],
        select: false
    },
    resetToken: String,
    resetTokenExpiredDate: Date,
    createdAt: {
        type: Date,
        default: new Date()
    }
});


/*
* Hashing password using bcryptjs lib
*/
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


/*
* JWT token after register
*/
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpiredDate=Date.now()+10*60*1000;
    return resetToken;
};

/*
* JWT token after register
*/
UserSchema.methods.getSignedJwtToken = function () {
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRED
    });
    return token;
};

/*
* Check entered password with
* hashed password
*/
UserSchema.methods.verifyPassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);
