const { default: mongoose } = require("mongoose");

const CertificateSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId,ref:'User',required:true},
    course:{type:mongoose.Schema.ObjectId,ref:'Course',required:true},
    userCourse:{type:mongoose.Schema.ObjectId,ref:'userCourse',required:true},
    createdAt:{type:Date,default:Date.now},
    certificate:{type:String,required:true},
});

const Certificate = mongoose.model('Certificate',CertificateSchema);

module.exports = Certificate;