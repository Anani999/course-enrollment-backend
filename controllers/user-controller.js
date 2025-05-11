const User = require('../models/User');

const user = async(req,res) => {
    const user = await User.findOne({username:req.user.username});
    res.status(200).json(user);
}

module.exports = {user};