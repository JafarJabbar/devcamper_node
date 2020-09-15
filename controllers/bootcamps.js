const Bootcamp =require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const GeoCoder = require('../utils/geocoder');
const AsyncHandler=require('../middleware/async');







//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps =AsyncHandler(async (req, res, next) => {
   return res.status(200).json(res.advancedResults);
});

//@desc Create new bootcamp
//@route POST /api/v1/bootcamps
//@access Private

exports.createBootcamp =AsyncHandler(async (req, res, next) => {
    //add user to req.body
    req.body.user=req.user.id;

    console.log(req);

    // check if user has bootcamp
    const checkedBootcamp=await Bootcamp.findOne({user:req.user.id});
    console.log(checkedBootcamp);
    if (checkedBootcamp && req.user.role !== 'Admin'){
      return next(new ErrorResponse(`This user already has a bootcamp. `,400));
    }
    const bootcamp=await Bootcamp.create(req.body);
    res.status(200).json({success:true,data:bootcamp})
});


//@desc Get single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access Public

exports.getBootcamp =AsyncHandler(async (req, res, next) => {
    const bootcamps= await Bootcamp.findById(req.params.id);
    if(!bootcamps){
       next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
    }
    res.status(200).json({success:true,data:bootcamps })
});

//@desc Update single bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private

exports.updateBootcamp =AsyncHandler(async (req, res, next) => {
    let bootcamp= await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}.`,404)
        );
    }

    //Check user ownership over bootcamp
    if(req.user.id !==bootcamp.user.toString() && req.user.role !== 'Admin' ){
        return next(
            new ErrorResponse(`User with id of ${req.user.id} have not permission to update this bootcamp.`,401)
        );
    }


    bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({success:true,data:bootcamp })
});

//@desc Delete single bootcamp
//@route Delete /api/v1/bootcamps/:id
//@access Private

exports.deleteBootcamp =AsyncHandler(async (req, res, next) => {
    const bootcamp= await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}.`,404)
        );
    }


    //Check user ownership over bootcamp
    if(req.user.id !==bootcamp.user.toString() && req.user.role !== 'Admin' ){
        return next(
            new ErrorResponse(`User with id of ${req.user.id} have not permission to update this bootcamp.`,401)
        );
    }

    bootcamp.remove();
    res.status(200).json({success:true,message:'Element successfully deleted.' })

});

//@desc Get bootcamps by zip code and radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access PUBLIC

exports.getBootcampInRadius =AsyncHandler(async (req, res, next) => {
    const {zipcode,distance}=req.params;

    //get location by zipcode
    const loc=await GeoCoder.geocode(zipcode);

    //get longitude and latitude
    const lng=loc[0].longitude;
    const lat=loc[0].latitude;

    //calc radius
    const radius=distance/3963;

    const bootcamps =await Bootcamp.find({
        location: {$geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }}
    });
    res.status(200).json({success:true,count:bootcamps.length,data:bootcamps })
});

//@desc Photo upload for the bootcamp
//@route PUT /api/v1/bootcamps/:id/photo
//@access Private

exports.uploadBootcampPhoto =AsyncHandler(async (req, res, next) => {

    const bootcamp=Bootcamp.findById(req.params.id);

    console.log(req);
    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}.`,404)
        );
    }

    if(!req.files){
        return next(
            new ErrorResponse(`Please add file.`,400)
        );
    }

    const file=req.files.file;

    console.log(req.files.file);

    res.status(200).json({success:true })
});



