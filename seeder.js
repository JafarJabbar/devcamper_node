const fs = require('fs');
const colors = require('colors');
dotenv=require('dotenv');
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');
const mongoose=require('mongoose');

dotenv.config({path:'./config/config.env'});
console.log(process.env.MONGODB_URI);


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

const importData=async ()=>{
    try {
        // await Bootcamp.create(bootcamps);
        await Course.create(courses);
        console.log("Courses seeded...");
        await User.create(users);
        console.log("Users seeded...");
        await Review.create(reviews);
        console.log("Reviews seeded...");
        console.log('Data imported...'.green.inverse);
        process.exit();
    }catch (err) {
        console.error(err);
    }
};

const deleteData=async ()=>{
    try {
        // await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data destroyed...'.red.inverse);
        process.exit();
    }catch (err) {
        console.error(err);
    }
};

if (process.argv[2] == '--i'){
    importData();
}else if (process.argv[2] === '--d'){
    deleteData();
}
