
const mongoose=require('mongoose');
const slugify=require('slugify');
const GeoCoder=require('../utils/geocoder');

const BootcampSchema=new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please add name.'],
        unique:[true,'Name field must be unique.'],
        trim:true,
        maxLength:[50,'Name can not be  more than 50 characters']
    },
    slug:String,
    description:{
        type: String,
        required: [true,'Please add description.'],
        maxLength:[500,'Description can not be  more than 500 characters']
    },
    website:{
        match:[
            /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
            'Please add valid url.'
        ],
        type:String
    },
    phone:{
      type:String,
        maxLength:[20,"Phone number can not be longer than 20 characters. "]
    },
    email:{
        match:[
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,            'Please add valid url.'
        ],
        type:String
    },
    address:{
        type:String,
        required:[true,"Please add an address."]
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
            type: [Number],
            index:'2dsphere'
        },
        formattedAddress:String,
        street:String,
        city:String,
        state:String,
        zipcode:String,
        country:String,
    },
    careers:{
        type:[String],
        required:true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating:{
        type:String,
        min:[1,'Rating must be at least 1'],
        max:[10,'Rating can not be more than 10'],
    },
    averageCost:Number,
    photo:{
        type:String,
        default:'no-photo.jpg'
    },
    housing:{
        type:Boolean,
        default: false
    },
    jobAssistance:{
        type:Boolean,
        default: false
    },
    jobGuarantee:{
        type:Boolean,
        default: false
    },
    acceptGi:{
        type:Boolean,
        default: false
    },
    createdAt: {
        type:Date,
        default:Date.now()
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals: true}
});


/*
*
* Create Virtuals for table
*
* */
//Courses virtuals

BootcampSchema.virtual('courses',{
   ref:'Course',
   localField:'_id',
    foreignField:'bootcamp',
    justOne:false
});




/*
*
* Mongodb middleware functions
*
 */


//Slugify function
BootcampSchema.pre('save',function(next){
   this.slug=slugify(this.name,{lower:true});
   next();
});

//Cascade delete for bootcamp and courses
BootcampSchema.pre('remove',async function(next){
    console.log(`Courses deleted from bootcamp id=${this._id} `)
    await this.model('Course').deleteMany({bootcamp:this._id});
    next();
});


//Gecocoder function
BootcampSchema.pre('save',async function (next){
    const loc = await GeoCoder.geocode(this.address);
    console.log(loc);
    this.location={
        type:'Point',
        coordinates: [loc[0].longitude,loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].street,
        city: loc[0].city,
        state: loc[0].state,
        zipcode: loc[0].zipcode,
        country: loc[0].country,
    };
    next();
});



 module.exports=mongoose.model('Bootcamp',BootcampSchema);
