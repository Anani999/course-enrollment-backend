const Course = require('../models/Course');
const User = require('../models/User');
const UserCourse = require('../models/UserCourse');
const fs = require('fs-extra');
const path = require('path');
const Video = require('../models/Video');
// importing PDFDocument kit
const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificates');
const { exit } = require('process');

const getCourses = async(req,res) => {
    try{
        const courses = await Course.find();
        // get user
        const user = await User.findOne({username:req.user.username});
        // get courses completed by user 
        const completedCourses = await UserCourse.find({completed:true,user});
        return res.status(200).json({courses,completedCourses});
    }catch(error){
        console.error('Error at getCourses/courseController : ',error);
        return res.status(500).json({errorMessage:'Error while fetching Courses',error:error.message});
    }
};

const getCourseById = async(req,res) => {
    const Id = req.params.id;
    try{
        if(!Id){
            return res.status(400).json({errorMessage:'Course id is required'});
        }
        const course = await Course.findById(Id);
        console.log('User : ',req.user);
        const user = await User.findOne({username:req.user.username});
        if(!course || !user){
            return res.status(400).json({errorMessage:'Course or User was not found '});
        };
        // check if user completed the course 
        const userCompleted = await UserCourse.findOne({user,course,completed:true});
        
        const courseVideos = await Video.find({course});
        return res.status(200).json({successMessage:`Fetched Course ${course.title}`,course,courseVideos,userCompleted});
    }catch(error){
        console.error('Erro at controller course-controller : ',error.message);
        return res.status(500).json({errorMessage:`Failed to Get Course with id ${Id}`});
    }
};

const startACourse = async(req,res) => {
    const courseId = req.params.id;

    try{
        if(!courseId){
            return res.status(400).json({errorMessage:'Course id required'});
        };
        
        const user = await User.findOne({username:req.user.username});
        const AlreadyInCourse = await UserCourse.findOne({user,completed:false});
        if(AlreadyInCourse){
            return res.status(400).json({errorMessage:'User Already had course'});
        }
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(400).json({errorMessage:'Course was not found '});

        };
        const existedCourse = await UserCourse.findOne({user,course});
        if(existedCourse){
            return res.status(200).json({successMessage:'Resumed Course : '+course.title,existedCourse});
        }else{
            const startCourse = await UserCourse.create({user,course});
            return res.status(200).json({successMessage:'Started Course : '+course.title,startCourse});
        }
        
        

    }catch(error){
        res.status(500).json({errorMessage:'Error while starting course '});
        console.error('Error while starting course : ',error);
    }
    
};

const userCourseInfo = async(req,res) => {
    try{
        const user = await User.findOne({username:req.user.username});
        const userCourse = await UserCourse.findOne({user});
        if(!userCourse){
            return res.status(400).json('User not started a course');
        };
        res.status(200).json({successMessage:'User Course info fetched , ',info:userCourse});
    }catch(error){
        res.status(500).json({errorMessage:'Error Fetching UserCourse '});
        console.error('Error Fetching UserCourse : ',error);
    }
}

const taskUpload = async(req,res) => {
    const {video_id,course_id,fileContent} = req.body;
    
    try{
        const user_code = fileContent;
        console.log('User Code : ',user_code);  
        console.log('File : ',req.file);
        if(!req.file  || !fileContent){
            return res.status(500).send('File was not uploaded !');
        }
        const course = await Course.findById(course_id);
        if(!course){
            return res.status(400).send('Course was not found !');
        };
        const video = await Video.findById(video_id);
        const videos = await Video.find({course});
        if(!video){return res.status(400).send('Video not found !')};

        const task = video.task;
        console.log('Task : ',task);
        if(!task){
            return res.status(500).send(' Task not found in Video !');
        }
        const validTask = await validateTask(user_code,task);

        const user = await User.findOne({username:req.user.username});
        
        const userCourse = await UserCourse.findOne({user,course});

        if(validTask === 1){
            userCourse.completedVideos += 1;
            // check if the course is completed
            console.log('Videos : ',videos);
            if(userCourse.completedVideos >= videos.length){
                userCourse.completed = true;
                const certificate = await createCertificate(user,course);
                const addCertificate = await Certificate.create({user,userCourse,certificate,course});
                
            }
            await userCourse.save();

            res.status(200).json(userCourse);
        }else{
            return res.status(400).send('Validation Failed !');
    }
        
        
    
    }catch(error){
            res.status(500).json({errorMessage:'Error while completing task '});
            console.error('Error while leveling usercourse  : ',error);
        
        }
    
}

const getVideos = async(req,res) => {
    try{
        const videos =  await Video.find();
        res.status(200).json({message:'Fetched Videos',videos});
    }catch (error) {
        res.status(500).json("Error fetching videos:", error.message);
    }
};

const getVideoById = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).send('Id is required');
    }
    try{
        const vidoe = await Video.findById(id);
        if(!vidoe){
            res.status(400).send('Video is not found with id :'+id);
        }
        res.status(200).json({vidoe});
    }catch(error){
        res.statu(500).send('Error while getting vidoes '+error.message)
    }
}

const getCertificate = async(req,res) => {
    try{
        // get user 
        const user = await User.find({username:req.user.username});
        if(!user){
            return res.status(400).send('User not found');
        }
        // validate course id
        const course_id = req.params.id;
        if(!course_id){
            return res.status(400).send('Id is required');
        }
        // check course 
        const course = await Course.findById(course_id);
        if(!course){
            return res.statu(400).send('Course was not found');
        }
        // check usercourse validate it was completed
        const userCourse = await UserCourse.findOne({user,course,completed:true});
        if(!userCourse){
            return res.status(400).send('User has no completed courses!')
        }
        // create certificate
        const certificatePath = await createCertificate(user,course);
        if(certificatePath){
            res.status(200).json(certificatePath);
        }
        // respond with file
    }catch(error){
        res.status(500).send('Error while issueing certificate : '+error.message);
    }
};


// functions 
// create certificate
async function createCertificate(user,course,userCourse){
    return new Promise((resolve,reject) => {  
        const uploadDir = path.join(__dirname,'..','uploads','certificates');
        fs.ensureDirSync(uploadDir);
        try{
            const fileName = `certificate_${Date.now()}.pdf`;
            const filePath = path.join(uploadDir,fileName);
            const relativePath = `/uploads/certificates/${fileName}`;

            // create a new pdf document
            const doc = new PDFDocument();

            // pipe the PDF to a writable stream
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // add content to the pdf
            doc
            .fontSize(20)
            .text(`Certificate of Completing ${course?.title}`, { align: "center" })
            .moveDown()
            .fontSize(27)
            .text(`Issued to ${user.username}`, { align: "center" })
            .moveDown()
            .fontSize(16)
            .text(`Congratulations on completing the course!`, { align: "center" });

            doc.end();

            // wait for the stream to finitsh 
            writeStream.on("finish",() => {
                console.log('Created File path : '+filePath);
                console.log('Document Created : '+doc);
                // create certificate
                resolve(relativePath);
                
            });
            writeStream.on("error",(err) => {
                console.error('Erro writing PDF',err);
                reject(new Error("Error creating PDF : "+err.message));
            });

        }catch(error){
            console.error('Erro generating PDF',error);
            reject(new Error("Error geenrating PDF :"+error.message));
        }   
    });
}
const addBase = (link) => {
    return(`http://localhost:5000${link}`);
}
// validate task
async function validateTask(user_code,task){
    const prompt = `for the code task "${task}" the user code was "${user_code}" is user correct ? for the task ? give the response just "Validation:passed" if user was correct or "Validation:failed" if user was wrong not extra things`
    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "llama3",
                "prompt": prompt
            })
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Process the response as a stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let fullResponse = "";
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            if (value) {
                // Decode the chunk and split by newline to handle multiple JSON objects
                const chunk = decoder.decode(value, { stream: true });
                const parts = chunk.split("\n").filter(line => line.trim() !== "");

                // Process each JSON part
                for (const part of parts) {
                    try {
                        const parsed = JSON.parse(part);
                        console.log("Parsed Chunk:", parsed);

                        // Accumulate the response text
                        fullResponse += parsed.response;
                    } catch (error) {
                        console.error("Error parsing JSON chunk:", error, part);
                    }
                }
            }
            done = readerDone;
        }

        console.log("Full Response:", fullResponse);
        if(fullResponse === 'Validation: passed' || fullResponse === 'Validation:passed' ){
            return 1;
        }else if(fullResponse === 'Validation: failed' || fullResponse === 'Validation:failed'){
            return 0;
        }else{
            return 2;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


module.exports = {getCertificate,getVideos,getVideoById,getCourses,getCourseById,startACourse,userCourseInfo,taskUpload};