const bcrypt = require('bcrypt');
const {userModel} = require('../models/userModel');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');

exports.handleRegister = async (req, res) => {
	try {
		const {username, password, email} = req.body;
		if(validator.isEmail){
			const match = await userModel.findOne({email:email})
			if(match){
				res.status(400).json({success:false, message:'Email is already registered.'})
			} else {
				// encrypt password before saving
				const hash = await bcrypt.hash(password, 10)
				const new_user = new userModel({
					username:username,
					email:email,
					password:hash
				});
				await new_user.save();
				res.status(200).json({success:true, message:'Registration Successful.'})
			}
		} else {
			res.status(400).json({success:false, message:'Please enter a valid email.'})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:'Failed to register.'})	
	}
}
exports.handleLogin = async (req, res) => {
	try {
		console.log('Handling Login . . . ');
		console.log(req.body);
		let match;
		const {email, password} = req.body;
		match = await userModel.findOne({email:email});
		if(match){
			if(await bcrypt.compare(password, match.password)){
				const access_token = jwt.sign({email:email}, process.env.JWT_ACCESS_TOKEN_SECRET);
				match.access_token = access_token;
				if(!match.api_key) {
					match.api_key = uuidv4();
					await match.save();
				}
				const contact_status = Object.keys(match?.contact_info) >= 0 ? true:false;
				
				res.status(200).json({success:true, message:"Login Success.", access_token:access_token, username:match.username, email:match?.email, contact:contact_status})
			} else {
				res.status(400).json({success:false, message:'Invalid username / password.'})
			}
		} else {
			throw new Error('Please enter a valid email.')
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:'Failed to login.'});
	}
}

exports.addContactInfo = async (req, res) => {
	try {
		const contactData = req.body?.contactData;
		const owner = await userModel.findOne({email:req.jwt.email});
		if(owner){
			owner.contact_info = contactData;
			await owner.save();
			res.status(200).send("Contact info saved");
		} else {
			res.status(403).json({success:false,message:"unauthorized"})
		}

	} catch (error) {
		console.log(error)
	}
}