const router = require('express').Router();
const controller = require('../controllers/certificate-controller');

router.get('/',controller.GetCertificate);


module.exports = router;