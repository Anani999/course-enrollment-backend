const router = require('express').Router();
const upload = require('../../config/multerConfig');
const admin_controller = require('../../controllers/admin/admin-controller');

router.post('/course',upload.single('thumbnail'),admin_controller.createCourse);
router.put('/course',upload.single('thumbnail'),admin_controller.updatedCourse);
router.delete('/course',admin_controller.deleteCourse);

router.post('/video',upload.fields([
    {name:'thumbnail',maxCount:1},
    {name:'video',maxCount:1},
]),admin_controller.addVideo);
router.put('/video',upload.fields([
    {name:'thumbnail',maxCount:1},
    {name:'video',maxCount:1},
]),admin_controller.updateVideo);
router.delete('/video',admin_controller.deleteVideo);

module.exports = router;