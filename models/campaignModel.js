const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
	campaign_type:{
		type:String,
		enum:['plain-text', 'html']
	},
	status:{
		type:String,
		default:"saved"
	},
	send_time:String,
	recipients:[String],
	campaign_subject_line:{
		type:String,
		default:"Dummy Subject Line"
	},
	campaign_preview_text:{
		type:String,
		default:"Dummy Preview Text"
	},
	campaign_title:{
		type:String,
		default:"Dummy Title"
	},
	campaign_title:{
		type:String,
		default:"Conative Title"
	},
	campaign_sender_name:{
		type:String,
		default:"Conative IT Solutions"
	},
	reply_to:{
		type:String,
		default:"Dummy Preview Text",
		required:true
	},
	template_id:String
}, {timestamps:true})

const CampaignOwnerSchema = new mongoose.Schema({
	owner:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	api_key:{
		type:String,
	},
	campaigns:[CampaignSchema]
})

const campaignOwnerModel = mongoose.model('campaignowners',CampaignOwnerSchema)
const campaignModel = mongoose.model('campaign', CampaignSchema);

module.exports = { campaignModel, campaignOwnerModel }