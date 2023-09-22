const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
	first_name:{
		type:String,
		required:true
	},
	last_name:{
		type:String,
	},
	email:{
		type:String,
		required:true
	},
	subscriber_hash:{
		type:String,
		required:true
	},
	tags:[{
		name:String,
		date_added:Date
	}]
},{timestamps:true})

const contactModel = mongoose.model('Contact', ContactSchema);

const ListingSchema = new mongoose.Schema({
	list_name:{
		type:String,
		required:true
	},
	members:[ContactSchema],
	permission_reminder:{
		type:String,
		required:true
	},
	campaign_defaults:{
		from_name:{
			type:String,
			required:true
		},
		from_email:{
			type:String,
			required:true
		},
		subject:{
			type:String,
			required:true
		},
		language:{
			type:String,
			default:"en-US"
		}
	},
	email_type:{
		type:String,
		required:true,
		enum:['html', 'plain-text']
	},
	notify_on_subscribe:String,
	confirm_subscription:{
		type:Boolean
	}
}, {timestamps:true})

const ListOwnerSchema = new mongoose.Schema({
	owner:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	listings:[ListingSchema]
},{timestamps:true})

const listingModel = mongoose.model('listing', ListingSchema);
const listingOwnerModel = mongoose.model('listingowners', ListOwnerSchema)

module.exports = { listingModel, contactModel, listingOwnerModel }