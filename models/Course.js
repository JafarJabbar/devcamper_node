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
/*
* Static methods
 */
//Calculate average cost
CourseSchema.statics.getAverageCost=async function(bootcampId){
    console.log('Average calculated...');
    const obj=await this.aggregate([
        {
            $match:{bootcamp:bootcampId}
        },
        {
            $group:{
                _id:'$bootcamp',
                averageCost:{$avg:'$tuition'}
            }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
            averageCost: Math.ceil(obj[0].averageCost/10)*10
        });
    }catch (e) {
        console.log(e);
    }
    console.log(obj);
};


/*
* Course model middleware
* */

//Calculate average
CourseSchema.post('save',function(){
    this.constructor.getAverageCost(this.bootcamp);
});

//Calculate average
CourseSchema.pre('remove',function(){
    this.constructor.getAverageCost(this.bootcamp);
});


module.exports=mongoose.model('Course',CourseSchema);
