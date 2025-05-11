const mongoose = require('mongoose');

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        .then(() => {
        console.log('connected to Mongo DB');
        });
    }catch(err){
        console.error('Error while connecting the Database : ', err);
    }
}


module.exports = connectDB;