const Bootcamp =require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const GeoCoder = require('../utils/geocoder');
const AsyncHandler=require('../middleware/async');

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps =AsyncHandler(async (req, res, next) => {
    let  query;
    let rowQuery={...req.query};
    const removeFields=['select','sort','page','limit'];
    removeFields.forEach(param=>delete rowQuery[param]);
    let queryStr=JSON.stringify(rowQuery);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g , match=>`$${match}`);
    query=Bootcamp.find(JSON.parse(queryStr));
    if (req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query.select(fields);
    }
    if (req.query.sort){
        const fields=req.query.sort.split(',').join(' ');
        query.sort(fields);
    }else {
        query.sort('-createdAt');
    }

    //pagination
    const page=parseInt(req.query.page,10) || 1;
    const limit=parseInt(req.query.limit,10) || 1;
    const startIndex=(page-1)*limit;
    const lastIndex=page*limit;
    query=query.skip(startIndex).limit(limit);

    const total=await Bootcamp.countDocuments();

    const bootcamps= await query;
    let pagination={};
    if (lastIndex<total){
        pagination.next={
            page: page-1,
            limit
        }
    }
    if (startIndex>0){
        pagination.previous={
            page: page+1,
            limit
        }
    }

    if(!bootcamps){
        return next(
            new ErrorResponse(`Bootcamps not found .`,404)
        );
    }
    res.status(200).json({success:true,pagination,count:bootcamps.length,data:bootcamps })
});

//@desc Create new bootcamp
//@route POST /api/v1/bootcamps
//@access Private

exports.createBootcamp =AsyncHandler(async (req, res, next) => {
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
    const bootcamp= await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}.`,404)
        );
    }
    res.status(200).json({success:true,data:bootcamp })
});

//@desc Delete single bootcamp
//@route Delete /api/v1/bootcamps/:id
//@access Private

exports.deleteBootcamp =AsyncHandler(async (req, res, next) => {
    const bootcamp= await Bootcamp.findByIdAndDelete(req.params.id);
    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}.`,404)
        );
    }
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



