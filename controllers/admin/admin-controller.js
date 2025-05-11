const Course = require('../../models/Course');
const Video = require('../../models/Video');

const createCourse = async(req,res) => {
    const {title,description,experienceLevel,duration,category} = req.body;
    const thumbnail = req.file ? addBase(req.file.path) : null;
    try{
        if(!thumbnail){
            return res.status(400).send('Not got the thumbnail');
        }
        
        // Pending we have to apply thumbnail
        const payload = {title,description,experienceLevel,duration,category,thumbnail};
        const course = await Course.create(payload);
        res.status(200).json({successMessage:'Created Course',course});
    }catch(error){
        res.status(500).json({errorMessage:'Error while creating the course : ',error:error.message})
    }
}; 

const addBase = (url) => {
    return `http://localhost:5000/${url}`;
}

const updatedCourse = async(req,res) => {
    const {title,description,experienceLevel,duration,category,course_id,partOf} = req.body;
    const thumbnail = req.file ? addBase(req.file.path) : null;
    if(!course_id){
        return res.status(400).send('Course id is required !');
    }
    try{
        // Pending we have to apply thumbnail
        const course = await Course.findByIdAndUpdate(course_id,{thumbnail,title,description,experienceLevel,duration,category,partOf},{new:true,runValidators:true});
        res.status(200).json({successMessage:'Updated Course',course});
    }catch(error){
        res.status(500).json({errorMessage:'Error while updating the course : ',error:error.message})
    }
};

const addVideo = async(req,res) => {
   
    try{
        const {videoNumber,task,course_id,title} = req.body;
        const thumbnail = req.files?.thumbnail ? addBase(req.files.thumbnail[0].path) : null;
        const video = req.files?.video ? addBase(req.files.video[0].path) : null;
        
        const course = await Course.findById(course_id);
        if(!course || !thumbnail || !video ){
            return res.status(400).json({errorMessage:'required things not found : ','files':files});
        }
        const existedVideo = await Video.findOne({course,videoNumber});
        if(existedVideo){
            return res.status(400).json({message:'Video with number already existed : ',existedVideo});
        };
        
        const UploadVideo = await Video.create({videoNumber,thumbnail,title,video,task,course});

        res.status(200).json({successMessage:'Added video to Course',video:UploadVideo});
    }catch(error){
        res.status(500).json({errorMessage:'Error while adding video to course : ',error:error.message})
    }
};

const updateVideo = async(req,res) => {
    const {video_id,videoNumber,title,task,course} = req.body;
    const thumbnail = req.files.thumbnail ? addBase(req.files.thumbnail[0].path) : null;
    const video = req.files.video ? addBase(req.files.video[0].path) : null;
    if(!video_id){
        return res.status(500).send('Video id is required thing');
    };
    try{
        // Pending we have to apply thumbnail
        const updatedVideo = await Video.findByIdAndUpdate(video_id,{videoNumber,title,task,course,video,thumbnail},{new:true,runValidators:true});
        res.status(200).json({successMessage:'Updated video successfully ',updatedVideo});
    }catch(error){
        res.status(500).json({errorMessage:'Error while updating the course : ',error:error.message})
    }
};

const deleteCourse = async(req,res) => {
    const {course_id} = req.body
    try{
        // check whether course_id provided or not 
        if(!course_id){ 
            return res.status(400).send('Course id is required parameter ');
        }

        // Validate course before deleting videos
        const course = await Course.findById(course_id);
        if(!course){
            return res.status(400).send('Course was not found !');
        };

        // delete videos with associated course
        const course_videos = await Video.deleteMany({course});

        // next delete the course itself also 
        await Course.findByIdAndDelete(course_id);

        // send positive response as things deleted 
        res.status(200).send('Course deleted successfully');
    }catch(err){
        res.status(500).send('Error while deleting course : '+err.message);
    }
};

const deleteVideo = async(req,res) => {
    const {video_id} = req.body;
    try{
        // check whether video_id provided or not 
        if(!video_id){ 
            return res.status(400).send('Video id is required ');
        }

        // check whether video is there or not 
        const video = await Video.findById(video_id);
        if(!video){
            return res.status(400).send('Video not found ');
        }

        // delete the video
        await Video.findByIdAndDelete(video_id);

        // send a success message !
        res.status(200).send('Video deleted successfully');
    }catch(err){
        res.status(500).send('Error while deleting course : '+err.message);
    }
};

module.exports = {createCourse,addVideo,updatedCourse,updateVideo,deleteCourse,deleteVideo};