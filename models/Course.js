
const mongoose=require('mongoose');

const CourseSchema=new mongoose.Schema({
    title:{
        type: String,
        required: [true,'Please add name.'],
    },
    description:{
        type: String,
        required: [true,'Please add description.'],
        maxLength:[500,'Description can not be  more than 500 characters']
    },
    weeks:{
        type: String,
        required: [true,'Please add number of weeks.'],
    },
    tuition:{
        type:Number,
        required: [true,'Please add tuition cost.'],
    },
    minimumSkill:{
        type:String,
        required: [true,'Please add a minimum skill.'],
        enum:['Beginner','Intermediate','Advanced']
    },
    scholarshipsAvailable:{
        type:Boolean,
        default: false
    },
    createdAt:{
        type:Date,
        default: Date.now()
    },
    bootcamp:{
        type:String,
        ref:'Bootcamp',
        required: true
    },
});

module.exports=mongoose.model('Course',CourseSchema);
