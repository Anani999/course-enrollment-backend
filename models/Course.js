const mongoose = require('mongoose');


const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String ,default:'/uploads/thumbnail-1733148512617-897907006.png'},
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    createdAt: { type: Date, default: Date.now },
    duration: { type: String },
    category: { type: String },
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
