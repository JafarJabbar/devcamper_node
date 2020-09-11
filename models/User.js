const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add name.']
    },
    email:{
        match:[
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please add valid email address.'
        ],
        required: [true,'Please add email.'],
        unique:[true,'This email already taken. Please add another email address.'],
        type:String
    },
    role:{
        type:String,
        enum:['User','Publisher'],
        default:'User'
    },
    password:{
        type:String,
        required:[true,'Please add password.'],
        minlength:[6,'Password must be longer than 6 symbols.'],
        select:false
    },
    rememberToken:String,
    rememberTokenExpiredDate:Date,
    createdAt:{
        type:Date,
        default: new Date()
    }
});


/*
* Hashing password using bcryptjs lib
*/
UserSchema.pre('save',async function(next){
    const salt = await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    next()
});


/*
* JWT token after register
*/
UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRED_DATE
    })
};


module.exports = mongoose.model('User',UserSchema);