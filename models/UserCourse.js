const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    videoSerialNumber:{type:Number,required:true},
    taskFile:{type:String,required:true},
    isValid:{type:Boolean,default:false}
});

const UserCourseSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true},
    completedVideos:{type:Number,default:0},
    tasks:[TaskSchema],
    completed:{type:Boolean,default:false},
    certificate:{type:String,default:null},
});

const UserCourse = mongoose.model('UserCourse',UserCourseSchema);

module.exports = UserCourse;