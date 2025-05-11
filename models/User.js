const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:{type:'string'},
    mail:{type:'string'},
    username:{type:'string',required:'true',unique:true},
    picture:{type:'string',default:'http://localhost:5000/images/default-profile.jpg'},
    securityCode:{type:'string'},
    isAdmin:{type:Boolean,default:false}
});

const User = mongoose.model('User',UserSchema);

module.exports = User;