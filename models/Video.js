const mongoose = require('mongoose');

const VideoSchema = new  mongoose.Schema({
        title:{type:String,required:true},
        videoNumber:{type:Number,required:true},
        thumbnail:{type:String},
        video:{type:String,required:true},
        task:{type:String},
        course:{type:mongoose.Schema.ObjectId,ref:'Course',required:true}
});

const Video = mongoose.model('Video',VideoSchema);

module.exports = Video;
