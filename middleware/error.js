const ErrorResponse=require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error={...err};
    error.message=err.message;

    if (err.name=='CastError'){
        const message=`Bootcamp not found with id of ${err.value}.`;
        error=new ErrorResponse(message,404);
    }

    if (err.code==11000){
        const message='Please enter unique value.';
        error=new ErrorResponse(message,400);
    }

    if (err.name=='ValidationError'){
        const message=Object.values(err.errors).map(item=>item.message);
        error=new ErrorResponse(message,422);
    }

    res
    .status(error.statusCode || 500)
    .json({
        success: false,
        message: error.message || 'Server error'
    });
};

module.exports=errorHandler;
