const router = require('express').Router();
const upload = require('../config/multerConfig');
const {getVideos,getVideoById,getCourses,getCourseById, startACourse,userCourseInfo, taskUpload, getCertificate} = require('../controllers/course-controllers');
const authorized = require('../middlewares/auth-middleware');

router.get('/', getCourses);
router.get('/get/:id',authorized ,getCourseById);
router.get('/start/:id', startACourse);
router.get('/user/info', userCourseInfo);
router.post('/task-upload', upload.single('file'), taskUpload);

// download certificate
router.get('/certificate/:id',getCertificate);

router.get('/videos',getVideos);
router.get('/videos/:id',getVideoById);

module.exports = router;