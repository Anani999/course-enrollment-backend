const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PreUser = require('../models/PreUser');
const nodemailer = require('nodemailer');

const git = async(req,res) => {
        // we are following oauth 2.0 for our authentication with github 
        // the flow is 
        // 1. client redirects to github authorize page , on user grant client(frontend) gets the authentication code 
        // 2. client send that code to by post method 
        // 3. server(we) exchange the code for an access token 
        // 4. using access token we can act behalf of the user , and access the given scopes or persmissions user given ex: profile data etc
        // 5. we use that data to check if user there in our database and based on that create or just generate JWT access token and send to the client waiting in the post request 
        
        // ensure code is required body
        const code = req.query.code;
        if(!code){
            return res.status(400).json({message:'Error No code found in query'})
        };
        try{
            const params =  `?client_id=${process.env.client_id}&client_secret=${process.env.client_secret}&code=${code}`; 
            // get access token 
            const getAccessToken = await fetch('https://github.com/login/oauth/access_token'+params,{ // exchanging code for an access token 
                method:'GET',
                headers:{
                    'Accept':'application/json'
                }
            });
            if(getAccessToken.status === 200){ // make sure the response status 200
                const cAT = await getAccessToken.json(); // convert response into json format since it not automatically done , using fetch 
                if(cAT.access_token){ // checking if access token was there in the response 
                    const getUserInfo = await fetch('https://api.github.com/user',{ // fetching the user info using that access token by making get request to 'api.github.com/user' and passing the tokes as Bearer token
                        method:'GET',
                        headers:{
                            'Authorization':`Bearer ${cAT.access_token}`
                        }
                    });
                    if(!getUserInfo.status === 200){
                        return res.status(400).json({errro:'Opps! access code was not working !'});
                    }
                    const userInfo = await getUserInfo.json();
                    let newUser;
                    const isExisted = await User.findOne({username:userInfo.login});
                    if(isExisted){
                        newUser = isExisted;
                    }else{
                        newUser = await User.create({name:userInfo.name,picture:userInfo.avatar_url,username:userInfo.login});
                        await newUser.save();
                    };
                    const payload = {
                        username:newUser.username,
                        name:newUser.name,
                    }
                    const token = createToken(payload);
                    return res.status(200).json({message:'User Login success',token});
                }
            }else{
                return res.status(400).json({error:'Code was expired or wrong'});
            }
        }catch(err){
            console.error('Error while sign in with github : ',err);
            res.status(500).json({error:'Error while Signing user with Github'});
        }
    
}

const google = async(req,res) => {
    const userinfo = req.body.user;
    if(!userinfo){
        return res.status(400).json({error:'Invalid credentials'});
    }
    if(!userinfo.email){
        return res.status(400).json({error:'No user found !'});
    }
    try{
        const existedUser = await User.findOne({username:userinfo.email});
        let newUser;
        if(existedUser){
            newUser = existedUser;
        }else{
            newUser = await User.create({username:userinfo.email,name:userinfo.name,picture:userinfo.picture});
        }

        const payload = {username:newUser.username,name:newUser.name};
        const token = createToken(payload);
        return res.status(200).json({message:'Login success',token});
    }catch(err){
        console.error(err);
        return res.status(500).json('Error Signing user',err.message);
    }

}

const phone_mail = async(req,res) => {
    const {email,inputType} = req.body;
    // console.log('body : ',req.body);
    if(!email || !inputType) {
        return res.status(400).json({ message : 'email and inputType both required !'})
    }
    try{
        let user;
        const isExisted = await User.findOne({username:email});
        if(isExisted){
            user = isExisted;
        }else{
            const existedPreUser = await PreUser.findOne({username:email});
            if(!existedPreUser){
                user = await PreUser.create({username:email});
            }else{
                user = existedPreUser;
            }
            
            
        }
        const code = generateOtp();
        const content = `Your Verification code is ${code}`;
        let info;
        try{
            if(inputType == 'email'){
                info = await sendMail(email,content,'Verification code : NgEdu');
            }else if (inputType == 'mobile'){
                info = await sendCodeToPhone(email,code);
            }else{
                return res.status(500).send('Invalid Input type')
            }
        }catch(err){
            return res.status(400).json({error:'Error while sending code',message:err.message});
        }
            
            user.securityCode = code;
            await user.save();
            return res.status(200).json({message:'Code sent successfully to ',info});

    }catch(error){
        console.error(error);
        res.status(500).json({message:'Error while Validating ',error:error.message});
    }
}

const verify_code = async(req,res) => {
    const {code,username} = req.body;
    const ExistingUser = await User.findOne({username});
    let NewUser;
    
    try{
        if(!ExistingUser){
            NewUser = await PreUser.findOne({username});
            if(!NewUser){
                return res.status(400).json('User not found !');
            }
        }
        const userToCheck = ExistingUser || NewUser;
        if(!userToCheck || userToCheck.securityCode !== code){
            return res.status(400).json('Code was Incorrect !');
        }
        if(!ExistingUser){
            const user = await User.create({username});
            const token = await createTokenForUser(user);
            const payload = {token,username:user.username};
            return res.status(200).json(payload);
        }else{
            const token = await createTokenForUser(ExistingUser);
            return res.status(200).json({token});
        }
    }catch(error){
        console.error('Error while validating code ',error.message);
        return res.status(500).json({error:'Error while validating code ',error_message:error.message})
    }
}

// < -----------------------------Support Functions ----------------------------------------- >


const createToken = (payload) => {
    try{
        const token = jwt.sign(payload,process.env.jwt_secret,{expiresIn:'1h'});
        return token;
    }catch(err){
        throw new Error('Error while creating Token ',err);
    }
};

const generateOtp = () => {
    const codegen = Math.floor(100000 + Math.random() * 900000);
    return codegen;
}

async function sendMail(mailid,content,subject){
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'rareandfunny@gmail.com',
            pass:process.env.gmail_pass
        }
        
    });
    try{
        const mailOptions = {
            from:'rareandfunny@gmail.com',
            to:mailid,
            subject:subject,
            text:content
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    }catch(error){
        // console.error('Error sending email :',error);
        throw new Error('Error while sending email : ', error);
    }
}

async function sendCodeToPhone(phone, code) {
    try {
        const accountSid = process.env.twilio_id;       // Twilio Account SID
        const authToken = process.env.twilio_secret;   // Twilio Auth Token
        const client = require('twilio')(accountSid, authToken);

        const sendCode = await client.messages
        .create({
            body: `Ahoy 👋 ${code}`,
            messagingServiceSid: 'MGca6a083130db4b1e51946bd9ef965444',
            to: `+91${phone}`,
        }).then(message => console.log(message.sid));

        return sendCode;
    } catch (error) {
        // console.error('Error from the phone server:', error.message);
        throw new Error('Error from the phone server:', error);
    }
}

const createTokenForUser = async(user) => {
    try{
        const payload = {
            username:user.username,
            name:'temp',
        };
        const token = createToken(payload);
        return token;
    }catch(error){
        throw new Error('Error while creating token for user ',error);
    }
}

module.exports = {git,google,phone_mail,verify_code};
