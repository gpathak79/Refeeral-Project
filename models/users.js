var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    "referalcode": {type: String, default:''},
    "name": {type: String, default:''},
    "email": {type: String, default:''},
    "password":{type: String, default:''},
    "countryCode": {type: String, default:'+1'},
    "mobile": {type: String, default:''}, 
    "gender":{type:String,default:''},
    "count":{type:Number,default:0},
    "refbonus":{type:Number,default:0},
    "parentId":{type:String,default:''},
    "refIds":[{type:String,default:''}],
    "created":{type: Date, default: Date.now},
    "updated":{type: Date},
},{ collection: 'users'});
module.exports = mongoose.model('users', schema); 
