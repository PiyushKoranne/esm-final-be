const mailchimp = require("@mailchimp/mailchimp_marketing");
const md5 = require('md5');
const {contactModel, listingModel, listingOwnerModel} = require("../models/listingModel");
const {userModel} = require("../models/userModel");
const { campaignModel, campaignOwnerModel } = require("../models/campaignModel")
const nodemailer = require('nodemailer');
const Queue = require('bull');
const { templateOwnerModel,templateModel } = require("../models/templateModel");
const {wrapEmail} = require('./constants');
const e = require("cors");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

const customize = (template_code, email, listing_data, owner ) => {
	// get user data from listing;
	console.log("############## LISTING DATA #############\n\n", listing_data);
	return wrapEmail(template_code, email, listing_data, owner)
	// get footer data from campaign
}

async function sendEmails(total_emails, template_code, owner, campaign_id) {
	try {
		const listingOwner = await  listingOwnerModel.findOne({owner:owner});
		const campaignOwner = await campaignOwnerModel.findOne({owner:owner});
		let campaign_data;
		let listing_data;
		if(campaignOwner){
			campaign_data = campaignOwner?.campaigns?.filter(item =>(item?._id?.toString() === campaign_id))[0];
		} 
		if(listingOwner){
			listing_data = listingOwner?.listings?.filter(item =>(item?._id?.toString() === campaign_data?.recipients[0]))[0];
		}
		console.log('\n\n\nTOTAL EMAILS ',total_emails, '\n\n\n');
	  for (const email of total_emails) {
		let mailTransporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: `${process.env.SMTP_MAIL}`, // generated user
				pass: `${process.env.SMTP_MAIL_PSWD}`  // generated password
			}
		});
	
		let mailDetails = {
			from: `${campaign_data?.campaign_sender_name} ${process.env.SMTP_MAIL}`,
			to: email?.email,
			subject: campaign_data?.campaign_subject_line,
			text:campaign_data?.campaign_preview_text,
			html: customize(template_code, email, listing_data, owner) || `<h2 style="background-color:#140342;color:white;padding:10px;">Email Marketing V1.0</h2>
			<p><strong>Dear User,</strong></p>      
			<p>We hope you are doing well.</p>
			<p>This is a <strong style="background-color:#625bf81a;padding:5px; font-size:16px;">test email</strong> purely intended to test the email sending functionality. Kindly ignore this email.</p>
			<p><strong>Warm regards,</strong></p>
			<p><strong>Marketing Mail Team.</strong></p>`
		};
		mailTransporter.sendMail(mailDetails, function (err, data) {
			if (err) {
				console.log(err)
				console.log('Error Occurred while sending Email');
			} else {
				console.log(`Email sent successfully to ${email?.email}`);
			}
		});
	  }
	} catch (error) {
	  console.error("Error sending emails:", error);
	}
}

const sendMailQueue = new Queue('sendMail', {
	redis: {
		host: 'localhost', // Redis server host
		port: 6379,        // Redis server port
		// Add other Redis connection options if needed
	},
	limiter: {
		max: 10,
		duration: 1000,
	  },
});

const sendTestMailQueue = new Queue('sendTestMail', {
	redis: {
		host: 'localhost', // Redis server host
		port: 6379,        // Redis server port
		// Add other Redis connection options if needed
	},
	limiter: {
		max: 10,
		duration: 1000,
	  },
});

// exports.handleCheckup = async (req, res) => {
// 	try {
// 		const response = await mailchimp.ping.get();
// 		if(response?.health_status){
// 			res.status(200).json({success:true, result:response})
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		res.status(400).json({success:false, result:'NOT OK'})
// 	}
// }

exports.createAudience = async (req, res) => {
	try {
		// requires an event
		console.log('Calling function to add listing:\n', req.body);

		// const api_key = req.headers.api_key;
		const match = await userModel.findOne({email:req.jwt.email});
		if(match){
			const new_listing = new listingModel({
				list_name:req.body?.list_name,
				footer_contact:{
					street_address1:req.body?.street_address1,
					street_address2:req.body?.street_address2,
					company:req.body?.company,
					city:req.body?.city,
					country:req.body?.country,
					state:req.body?.state,
					zip:req.body?.zip,
					phone:req.body?.phone,
				},
				permission_reminder:req.body?.permission_reminder,
				campaign_defaults:{
					from_name:req.body?.from_name,
					from_email:req.body?.from_email,
					subject:req.body?.subject,
					language:req.body?.language,
				},
				email_type:req.body?.email_type,
				notify_on_subscribe:"piyushtest98@gmail.com",
				confirm_subscription:req.body?.confirm_subscription
			});
			const user_listings = await listingOwnerModel.findOne({owner:match._id});
			if(user_listings){
				// push another to the list;
				user_listings.listings.push(new_listing);
				await user_listings.save();
				res.status(200).json({success:true, message:'New listing created'})
			} else {
				const new_listing_owner = new listingOwnerModel({
					owner:match?._id,
					listings:[new_listing]
				});
				await new_listing_owner.save();
				res.status(200).json({success:true, message:'First Listing Created'})
			}
		} else {
			res.status(403).json({success:false, message:"API KEY INVALID/ABSENT"})
		}
	} catch (error) {
		console.log(error.message);
		res.status(400).json({success:false, message:error.message})
	}
}

exports.addContact = async (req, res) => {
	try {
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		console.log('Trying to add contact');
		const new_contact = new contactModel({
			first_name:req.body?.first_name,
			last_name:req.body?.last_name,
			email:req.body?.email,
			subscriber_hash:md5(req.body?.email?.toLowerCase()),
		})
		const listingOwner = await listingOwnerModel.findOne({owner:owner});
		if(listingOwner){
			listingOwner.listings = listingOwner.listings.map(item =>{
				if(item?._id?.toString() === req.body?.list_id){
					item?.members.push(new_contact)
					return item;
				} else {
					return item;
				}
			});
			const response = await listingOwner.save();
			res.status(200).json({success:true, message:"Contact added to list.", result:response})
		} else {
			res.status(400).json({success:false, message:'Please create a list first.'})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({succes:false, message:error.message})
	}
}

exports.deleteContact = async (req, res) => {
	try {
		res.status(200).send('Will work on this later')
	} catch (error) {
		console.log(error);
		res.status(500).send('Sever error on delete contact')
	}
}

exports.batchAddContacts = async (req, res) => {
	try {
		const response = await mailchimp.lists.batchListMembers(req.body?.list_id, {
			members: [{}],
		});
		res.status(200).json({success:true, message:"Bulk Addition Completed"})
	} catch (error) {
		console.log(error);
		res.status(500).json({succes:false, message:error.message})
	}
}


exports.unsubscribeContact = async (req, res) => {
	try {
		// get the list id 
		const list_id = req.body?.list_id;
		// get the owner
		const api_key = req.headers?.api_key;
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		// get the contact email hash and remove that 
		console.log(owner);
		const listingOwner = await listingOwnerModel.findOne({owner:owner});
		if(listingOwner){
			listingOwner.listings = listingOwner.listings.filter(item =>{
				if(item?._id?.toString() === req.body?.list_id){
					item.members = item?.members.filter(item => (item?.subscriber_hash !== req.body?.subscriber_hash))
					return item;
				} else {
					return item;
				}
			});
			const response = await listingOwner.save();
			res.status(200).json({success:true, message:'contact removed', result:response})
		} else {
			res.status(400).json({success:false, message:'Invalid list or Owner'})
		}
	
		res.status(200).json({success:true, message:"User unsubscribed"})

	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message})
	}
}

exports.viewContactTags = async (req, res) => {
	try {
		const listId = req.body?.list_id;
		const email = req.body?.email;
		const subscriberHash = md5(email.toLowerCase());
		const response = await mailchimp.lists.getListMemberTags(listId, subscriberHash);
		res.status(200).json({success:true, result:response});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message})
	}
}

exports.addNewTagSingle = async (req, res) => {
	try {
		const listId = req.body?.list_id;
		const email = req.body?.email;
		const subscriberHash = md5(email.toLowerCase());
		const response = await mailchimp.lists.updateListMemberTags(
			listId,
			subscriberHash,
			{
				tags: [
				[
					{
					name: req.body?.tag_name,
					status: "active",
					},          
				],
				],
			}
		);
		res.status(200).json({success:true, result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message})
	}
}

exports.addNewTagBulk = async (req, res) => {
	try {
		const listId = req.body?.list_id;
		const tag = {
			name: req.body?.new_tag_name,
			static_segment: req.body?.bulk_contacts_array
		};	
		const response = await mailchimp.lists.createSegment(listId, tag);
		res.status(200).json({success:true, result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message})
	}
}

exports.addExistingTagSingle = async (req, res) => {
	try {
		const listId = req.body?.list_id;
		const email = req.body?.email;
		const subscriberHash = md5(email.toLowerCase());
		const response = await mailchimp.lists.updateListMemberTags(
			listId,
			subscriberHash,
			{
				tags: [
					[
						{
						tag_id: req.body?.tag_id,
						status: "active",
						},          
					],
				],
			}
		);
		res.status(200).json({success:true, result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message})
	}
}

exports.addExistingTagBulk = async (req, res) => {
	try {
		const listId = req.body?.list_id;
		const tagId = req.body?.tag_id;
		const body = {
			members_to_add: req.body?.contact_list
		};
		const response = await mailchimp.lists.batchSegmentMembers(
			body,
			listId,
			tagId
		);
		res.status(200).json({success:true, result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message})
	}
}

exports.removeTagSingle = async (req, res) => {
	try {
		const listId = req.body?.list_id;
		const email = req.body?.email;
		const subscriberHash = md5(email.toLowerCase());

		const response = await mailchimp.lists.updateListMemberTags(
			listId,
			subscriberHash,
			{
			  tags: [
				{
				  tag_id: req.body?.tag_id,
				  status: "inactive",
				},
			  ],
			}
		  );
		
		console.log(
			`The return type for this endpoint is null, so this should be true: ${
				response === null
			}`
		);

	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message})
	}
}

exports.getCampaignData = async (req, res) => {
	try {
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		const campaignOwner = await campaignOwnerModel.findOne({owner:owner});
		if(campaignOwner){
			const result = campaignOwner?.campaigns?.filter(item => (item?._id?.toString() === req.body?.campaign_id))[0];
			res.status(200).json({success:false, message:'campaign data found', result:result})
		} else {
			res.status(400).json({success:false, message:'Invalid campaign.'})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:error.message})
	}
}

exports.removeTagBulk = async (req, res) => {
	try {
		const listId = req.body?.list_id;
		const tagId = req.body?.tag_id;
		const body = {
			members_to_remove: req.body?.contact_list
		};
		const response = await mailchimp.lists.batchSegmentMembers(
			body,
			listId,
			tagId
		);
		res.status(200).json({success:true, result:response});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}

exports.getAllListings = async (req, res) => {
	try {
		console.log('Inside Lising function')
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		const listingOwner = await listingOwnerModel.findOne({owner:owner});
		res.status(200).json({success:true, message:'Success', result:listingOwner});

	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}

exports.createCampaign = async (req, res) => {
	try {
		console.log('Creating a new Campaign', req.body);
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		const campaignOwner = await campaignOwnerModel.findOne({owner:owner});
		const custom_template_code = req.body?.custom_email_template;
		let custom_template_id = ""
 		if(custom_template_code){
			const new_template = new templateModel({
				name:req.body?.custom_template_name,
				template_html:custom_template_code
			});
			const templateowner = await templateOwnerModel.findOne({owner:owner});
			if(templateowner){
				
				templateowner?.templates?.push(new_template);
				const res = await templateowner.save();
				custom_template_id = new_template?._id;
			} else {
				const new_template_owner = new templateOwnerModel({
					owner:owner,
					templates:[new_template]
				});
				await new_template_owner.save();
				custom_template_id = new_template?._id
			}
		}
		const new_campaign = new campaignModel({
			campaign_type:req.body?.campaign_type,
			recipients:req.body?.recipients,
			campaign_subject_line:req.body?.campaign_subject_line,
			campaign_preview_text:req.body?.campaign_preview_text,
			campaign_title:req.body?.campaign_title,
			campaign_sender_name:req.body?.campaign_sender_name,
			reply_to:req.body?.reply_to,
			template_id:custom_template_id
		});
		if(campaignOwner){
			campaignOwner.campaigns.push(new_campaign);
			const response = await campaignOwner.save();
			res.status(200).json({success:true, message:'Campaign Created', result:response});
		} else {
			// create a new campaign owner 
			const new_campaign_owner = new campaignOwnerModel({
				owner:owner,
				campaigns:[new_campaign]
			});
			const response = await new_campaign_owner.save();
			res.status(200).json({success:true, message:'First Campaign Created', result:response});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error});	
	}
}

exports.editCampaign = async (req, res) => {
	try {
		const campaign_id = req.body?.campaign_id;
		console.log('Updating Campaign');
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		const campaignOwner = await campaignOwnerModel.findOne({owner:owner});
		const custom_template_code = req.body?.custom_email_template;
		let custom_template_id = "";
 		if(custom_template_code){
			const new_template = new templateModel({
				name:req.body?.custom_template_name,
				template_html:custom_template_code
			});
			const templateowner = await templateOwnerModel.findOne({owner:owner});
			if(templateowner){
				
				templateowner?.templates?.push(new_template);
				const res = await templateowner.save();
				custom_template_id = new_template?._id?.toString();
			} else {
				const new_template_owner = new templateOwnerModel({
					owner:owner,
					templates:[new_template]
				});
				await new_template_owner.save();
				custom_template_id = new_template?._id?.toString();
			}
		}
		console.log('Custom Template ID', custom_template_id);
		campaignOwner.campaigns?.forEach(item => {
			console.log(item?._id?.toString(),' === ',campaign_id);
			if(item?._id?.toString() === campaign_id){
				if(req.body?.campaign_type)item.campaign_type = req.body?.campaign_type;
				if(req.body?.recipients)item.recipients = req.body?.recipients;
				if(req.body?.campaign_subject_line)item.campaign_subject_line = req.body?.campaign_subject_line;
				if(req.body?.campaign_preview_text)item.campaign_preview_text = req.body?.campaign_preview_text;
				if(req.body?.campaign_title)item.campaign_title = req.body?.campaign_title;
				if(req.body?.campaign_sender_name)item.campaign_sender_name = req.body?.campaign_sender_name;
				if(req.body?.reply_to)item.reply_to = req.body?.reply_to;
				if(custom_template_id){ 
					console.log('My custom template id',custom_template_id)
					item.template_id = custom_template_id
				}
			}
		})
		const response = await campaignOwner.save();
		console.log(response);
		res.status(200).json({success:true, message:'campaign updated', result:response })
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error});	
	}
}

exports.getListInfo = async (req, res) => {
	try {
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		const listingOwner = await listingOwnerModel.findOne({owner:owner});
		const selected_list = listingOwner?.listings?.filter(item => (item?._id?.toString() === req.body?.list_id))[0];
		const sanitized_data = {
			list_name:selected_list?.list_name,
			street_address1:selected_list?.footer_contact?.street_address1,
			street_address2:selected_list?.footer_contact?.street_address2,
			company:selected_list?.footer_contact?.company,
			city:selected_list?.footer_contact?.city,
			country:selected_list?.footer_contact?.country,
			state:selected_list?.footer_contact?.state,
			zip:selected_list?.footer_contact?.zip,
			phone:selected_list?.footer_contact?.phone,
			permission_reminder:selected_list?.permission_reminder,
			from_name:selected_list?.campaign_defaults?.from_name,
			from_email:selected_list?.campaign_defaults?.from_email,
			subject:selected_list?.campaign_defaults?.subject,
			language:selected_list?.campaign_defaults?.language,
			email_type:selected_list?.email_type,
			notify_on_subscribe:"piyushtest98@gmail.com",
			confirm_subscription:selected_list?.confirm_subscription,
			members:selected_list?.members
		}
		res.status(200).json({success:true, result:sanitized_data});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});	
	}
}

exports.getListContacts = async (req, res) => {
	try {
		console.log(req.query);
		const response = await mailchimp.lists.getListMembersInfo(req.query?.list_id);
		console.log(response);
		res.status(200).json({success:true, result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});	
	}
}

exports.getAllCampaigns = async (req, res) => {
	try {
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id"); 
		// found owner getting campaign models if any
		const campaignOwner = await campaignOwnerModel.findOne({owner:owner});
		// campaign owner found
		res.status(200).json({success:true, message:"Campaigns Retrieved", result:campaignOwner?.campaigns});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});	
	}
}

exports.sendCampaign = async (req, res) => {
	try {
		let template_id = "";
		let template_code = "";
		const campaign_id = req.body?.campaign_id; 
		const owner = await userModel.findOne({email:req.jwt.email}).select("_id");
		const campaignOwner = await campaignOwnerModel.findOne({owner:owner});
		const listingOwner = await listingOwnerModel.findOne({owner:owner});
		let total_emails = [];
		if(campaignOwner){
			const listings = campaignOwner?.campaigns?.filter(item  => (item?._id?.toString() === campaign_id))?.[0]?.recipients;
			for(let i=0; i< listings.length; i++){
				console.log("members",listingOwner?.listings.filter(item => (item?._id?.toString() === listings[i]))[0]?.members?.map(item => item?.email))
				listingOwner?.listings.filter(item => (item?._id?.toString() === listings[i]))[0]?.members?.forEach(item => total_emails.push(item))
			}
			console.log(total_emails)
			await campaignOwner.campaigns.forEach(item => {
				if(item?._id?.toString() === campaign_id){
					item.status = "completed";
					template_id = item?.template_id
				}
			});
			await campaignOwner.save();
			if(template_id){
				const template_owner = await templateOwnerModel.findOne({owner:owner});
				template_code = template_owner?.templates?.filter(item => (item?._id?.toString() === template_id))?.pop()?.template_html;
			}
			// await sendMail(total_emails, template_code);
			sendEmails(total_emails, template_code, owner, campaign_id);
			res.status(200).json({success:true, message:"Campaign has been sent"})
		} else {
			res.status(400).json({success:false, message:'Please create a campaign first.'})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}

exports.deleteCampaign = async (req, res) => {
	try {
		const response = await mailchimp.campaigns.remove(req.body?.campaign_id);
  		console.log(response);
		res.status(200).json({success:true, result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}

exports.scheduleCampaign = async (req, res) => {
	try {
		const response = await mailchimp.campaigns.schedule(req.body?.campaign_id, {
			schedule_time: req.body?.schedule_time,
		});
		console.log(response);
		res.status(200).json({success:true,message:"Campaign Scheduled", result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}

exports.sendTestMail = async (req, res) => {
	try {
		console.log('Sending Test Emails...')
		const total_emails = [];
		const owner = await userModel.findOne({email:req.jwt?.email}).select("_id");
		const campaignOwner = await campaignOwnerModel.findOne({owner:owner});
		const selectedCampaign = campaignOwner?.campaigns?.filter(item => (item?._id?.toString() === req.body?.campaign_id))[0];
		const recipients = selectedCampaign?.recipients;
		const listingOwner = await listingOwnerModel.findOne({owner:owner});
		recipients.forEach(list_id => {
			const match = listingOwner.listings?.filter(item => item?._id?.toString() === list_id)[0];
			match?.members.forEach(item => {
				total_emails.push(item?.email)
			})
		})
		console.log(total_emails)
		sendEmails(total_emails, '<h1>This is a test</h1>', owner)
		// const mailing_list = req.body?.mailing_list;
		// sendTestMailQueue.add({data:mailing_list})
		// sendTestMailQueue.process(async (job) => {
		// 	return await sendMail(job.data)
		// })

		res.status(200).json({success:true, message:'Mails added to queue'})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}
exports.addCampaignTemplate = async (req, res) => {
	try {
		// get the campaign id
		const campaign_id = req.body?.campaign_id;
		const template_html = req.body?.template_code;
		// check if the template owner exists from jwt
		const owner = await userModel.findOne({email:req.jwt?.email}).select("_id");
		const template_owner = await templateOwnerModel.findOne({owner:owner});
		const new_template = new templateModel({
			name:req.body?.template_name,
			template_html:template_html
		})
		if(template_owner){
			if(template_owner?.templates?.some((item) => (item?.name === req.body?.template_name))){
				return res.status(400).json({success:false, message:"Template with same name already exists"})
			}
			console.log('I am a template owner') 
			template_owner.templates.push(new_template);
			await template_owner.save();
			console.log('New template saved');
			// take the template id and store it in the campaign model
			const campaign_owner = await campaignOwnerModel.findOne({owner:owner});
			if(campaign_owner){
				console.log('I am a campaign owner also')
				campaign_owner.campaigns = campaign_owner?.campaigns?.map(item => {
					console.log(item?._id?.toString(), campaign_id);
					if(item?._id?.toString() === campaign_id){
						item.template_id = template_owner.templates[template_owner.templates.length - 1]?._id?.toString();
						console.log('last template --->',template_owner.templates[template_owner.templates.length - 1]);
						console.log(item);
						return item;
					} else {
						return item;
					}
				})
				const response = await campaign_owner.save();
				res.status(200).json({success:true, message:"Template added to campaign",result:response});
			} else {
				res.status(400).json({success:false, message:'Please create a campaign first'})
			}
		} else {
			const new_template_owner = new templateOwnerModel({
				owner:owner,
				templates:[new_template]
			});
			const response = await new_template_owner.save();
			const campaign_owner = await campaignOwnerModel.findOne({owner:owner});
			if(campaign_owner){
				campaign_owner.campaigns = campaign_owner?.campaigns?.map(item => {
					if(item?.id?.toString() === campaign_id){
						item.template_id = template_owner.templates[-1]._id;
						return item;
					} else {
						return item;
					}
				})
				const response = await campaign_owner.save();
				res.status(200).json({success:true, message:"Template added to campaign",result:response});
			} else {
				res.status(400).json({success:false, message:'Please create a campaign first'})
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}

exports.getAllTemplates = async (req, res) => {
	try {
		const response = await mailchimp.templates.list();
		console.log(response);
		res.status(200).json({success:true, result:response})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error.message});
	}
}

async function sendMail(mailing_list, html) {
	console.log('Mails Queued, function called.', mailing_list)
	let mailTransporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: `${process.env.SMTP_MAIL}`, // generated user
			pass: `${process.env.SMTP_MAIL_PSWD}`  // generated password
		}
	});

	let mailDetails = {
		from: `${process.env.SMTP_MAIL}`,
		to: [mailing_list],
		subject: 'This is a test',
		html: html || ` <h2 style="background-color:#140342;color:white;padding:10px;">Orangutan V1.0</h2>
		<p><strong>Dear User,</strong></p>      
		<p>We hope you are doing well.</p>
		<p>This is a <strong style="background-color:#625bf81a;padding:5px; font-size:16px;">test email</strong> purely intended to test the email sending functionality. Kindly ignore this email.</p>
		<p><strong>Warm regards,</strong></p>
		<p><strong>Orangutan Mail Team.</strong></p>`
	};
	mailTransporter.sendMail(mailDetails, function (err, data) {
		if (err) {
			console.log('Error Occurred while sending Email');
		} else {
			console.log('Email sent successfully');
		}
	});
}