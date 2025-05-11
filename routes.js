const authRoutes = require('./routes/auth-routes');
const courseRoutes = require('./routes/course-routes');
const userRoutes = require('./routes/user-routes');
const adminRoutes = require('./routes/admin/admin-routes');
const certificateRoutes = require('./routes/certificate-routes');
const authorized = require('./middlewares/auth-middleware');

const router = require('express').Router();

router.use('/auth',authRoutes);
router.use('/user',authorized,userRoutes);
router.use('/courses',authorized,courseRoutes);
router.use('/certificates',authorized,certificateRoutes);
router.use('/admin',adminRoutes,adminRoutes);

module.exports = router;