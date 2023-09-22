const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	template_html:{
		type:String,
		required:true
	}
},{timestamps:true})

const TemplateOwnerSchema = new mongoose.Schema({
	owner:{
		type:mongoose.Schema.Types.ObjectId,
		required:true,
		ref:'User'
	},
	templates:[TemplateSchema]
},{timestamps:true})

const templateModel = mongoose.model("template", TemplateSchema)
const templateOwnerModel = mongoose.model("templateowner", TemplateOwnerSchema);

module.exports = { templateOwnerModel, templateModel }