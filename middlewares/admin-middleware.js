const User = require("../models/User")

const isAdmin = async(req,res,next) => {
    try{
        const user = await User.findOne({username:req.user.username,isAdmin:true});
        if(!user){
            return res.status(400).send('SuperUsers only can perform this ');
        }
        next();
    }catch(error){
        return res.status(500).send('Error while Validating Admin');
        console.error('Error while validating admin : ',error)
    }
    
}

module.exports = isAdmin;