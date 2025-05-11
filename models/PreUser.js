const mongoose = require('mongoose');

const preUserSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    securityCode:{type:String}
});

const PreUser = mongoose.model('PreUser',preUserSchema);

module.exports = PreUser;