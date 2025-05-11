const router = require('express').Router();
const {git,google,phone_mail,verify_code} = require('../controllers/auth-controller');

router.get('/git',git);
router.post('/google',google);
router.post('/phone-mail',phone_mail);
router.post('/verify-code',verify_code);

module.exports = router;