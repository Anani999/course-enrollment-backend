const jwt = require('jsonwebtoken');

const authorized = (req,res,next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    console.log('token' ,token);
    if(!token){
        return res.status(401).json({error:'Not authorized !'});
    }

    try{
        const decoded = jwt.verify(token,process.env.jwt_secret);
        req.user = decoded;
        next();
    } catch(err){
        return res.status(400).json({error:'Token Expired !'});
    }
}

module.exports = authorized;