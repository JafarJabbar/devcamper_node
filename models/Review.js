const mongoose=require('mongoose');

const ReviewSchema=new mongoose.Schema({
    title:{
        type: String,
        required: [true,'Please add title.'],
        maxLength: [100,'Review title must be less than 100.'],
    },
    text:{
        type: String,
        required: [true,'Please add some text.'],
    },
    rating:{
        type: Number,
        min:1,
        max:10,
        required: [true,'Please add point between 1 and 10.'],
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
    user:{
        type:String,
        ref:'User',
        required: true
    },

});

ReviewSchema.index({'bootcamp':1,'user':1},{unique:true});

/*
* Static methods
 */

//Calculate average cost
ReviewSchema.statics.getAverageRating=async function(bootcampId){
    console.log('Rating calculated...');
    const obj=await this.aggregate([
        {
            $match:{bootcamp:bootcampId}
        },
        {
            $group:{
                _id:'$bootcamp',
                averageRating:{$avg:'$rating'}
            }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
            averageRating: Math.ceil(obj[0].averageRating)
        });
    }catch (e) {
        console.log(e);
    }
    console.log(obj);
};


/*
* Review model middleware
* */

//Calculate average
ReviewSchema.post('save',function(){
    this.constructor.getAverageRating(this.bootcamp);
});

//Calculate average
ReviewSchema.pre('remove',function(){
    this.constructor.getAverageRating(this.bootcamp);
});


module.exports=mongoose.model('Review',ReviewSchema);
