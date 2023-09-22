const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
	username:String,
	password:String,
	email:String,
	access_token:String,
	otp_token:String,
	api_key:String,
	contact_info:{
		street_address1:{
			type:String,
		},
		street_address2:{
			type:String,
		},
		company:{
			type:String,
		},
		city:{
			type:String,
		},
		country:{
			type:String,
		},
		state:String,
		zip:String,
		phone:String,
	}
});


const userModel = mongoose.model('users', UserSchema);


module.exports = {userModel}
