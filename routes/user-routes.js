const router = require('express').Router();
const {user} = require('../controllers/user-controller');

router.post('/',user);

module.exports = router;