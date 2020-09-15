const ErrorResponse = require('../utils/errorResponse');

const advancedResults=(model,populate)=>async (req,res,next)=>{
    let  query;
    let rowQuery={...req.query};
    const removeFields=['select','sort','page','limit'];
    removeFields.forEach(param=>delete rowQuery[param]);
    let queryStr=JSON.stringify(rowQuery);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g , match=>`$${match}`);
    query=model.find(JSON.parse(queryStr));
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

    if (populate){
        query=query.populate(populate);
    }

    const total=await model.countDocuments();

    const results= await query;
    console.log(results);

    if(!results){
        return next(
            new ErrorResponse(`Result not found .`,404)
        );
    }

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
    res.advancedResults={
        success:true,
        count:results.length,
        pagination,
        data:results
    };
    next();
};

module.exports=advancedResults;
