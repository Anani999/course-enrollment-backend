const Certificate = require("../models/Certificates");
const User = require("../models/User")

const GetCertificate = async(req,res) => {
    const user = await User.findOne({username:req.user.username});
    try{
        if(!user){
            return res.status(400).send('User not found');
        }
        const certificates = await Certificate.find({user}).populate('course');
        if(!certificates){
            return res.status(400).send('No certificated found');
        }
        res.status(200).json({certificates});
    }catch(error){
        console.error('Erro while Fetching certficates : '+error.message);
        return res.status(500).send('Error while getting certificates'+error.message);
    }
}

module.exports = {GetCertificate}