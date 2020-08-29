const mongoose= require('mongoose');

connectDb=async ()=>{
  const conn= await mongoose.connect(process.env.MONGODB_URI,{
      useNewUrlParser:true,
      useCreateIndex:true,
      useFindAndModify:false,
      useUnifiedTopology:true
    });
    console.log(`MongoDB server connected.Host:${conn.connection.host}`);
};
module.exports=connectDb;
