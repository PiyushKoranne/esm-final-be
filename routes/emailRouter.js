const express = require('express');
const emailManageRouter = express.Router();
const emailController = require('../controllers/emailController');
const { verifyJWT } = require('../middlewares/verifyJWT');

// emailManageRouter.get('/checkup', emailController.handleCheckup);
emailManageRouter.post('/create-audience', verifyJWT, emailController.createAudience);
// add contact to listing
emailManageRouter.post('/add-contact', verifyJWT, emailController.addContact);
// delete contact from listing
emailManageRouter.post('/delete-contact', verifyJWT, emailController.deleteContact);

emailManageRouter.post('/unsubscribe-contact', verifyJWT, emailController.unsubscribeContact);
// create a campaign
emailManageRouter.post('/create-campaign', verifyJWT, emailController.createCampaign);
// edit a campaign
emailManageRouter.post('/edit-campaign', verifyJWT, emailController.editCampaign);
// send test email 
emailManageRouter.post('/send-campaign-test-email', verifyJWT, emailController.sendTestMail);
// add template to campaign 
emailManageRouter.post('/add-campaign-template', verifyJWT, emailController.addCampaignTemplate);
//send a campaign
emailManageRouter.post('/send-campaign', verifyJWT, emailController.sendCampaign);
// get all listings
emailManageRouter.get('/get-all-listings', verifyJWT, emailController.getAllListings);
// get all campaigns 
emailManageRouter.get('/get-all-campaigns', verifyJWT, emailController.getAllCampaigns);
// get campaign data
emailManageRouter.post('/get-campaign-info', verifyJWT, emailController.getCampaignData);
// get list data
emailManageRouter.post("/get-list-info", verifyJWT, emailController.getListInfo);

// emailManageRouter.post()

// ---------------------------DONE TILL HERE------------------------

emailManageRouter.post('/add-new-tag-single', emailController.addNewTagSingle);
emailManageRouter.post('/add-new-tag-bulk', emailController.addNewTagBulk);
emailManageRouter.post('/add-existing-tag-single', emailController.addExistingTagSingle);
emailManageRouter.post('/add-existing-tag-bulk', emailController.addExistingTagSingle);
emailManageRouter.post('/remove-tag-single', emailController.removeTagSingle);
emailManageRouter.post('/remove-tag/bulk', emailController.removeTagBulk);
emailManageRouter.post('/view-tags', emailController.viewContactTags);
emailManageRouter.get("/get-list-contacts", emailController.getListContacts);
emailManageRouter.post("/batch-add-contacts", emailController.batchAddContacts);



// edit a campaign
emailManageRouter.post('/edit-campaign', emailController.editCampaign);



emailManageRouter.get('/get-all-templates', emailController.getAllTemplates);

// get campaign info

//delete campaign
emailManageRouter.post('/delete-campaign', emailController.deleteCampaign);

// cancel a campaign --> used after campaign is sent



// schedule a campaign
emailManageRouter.post('/schedule-campaign', emailController.scheduleCampaign);

// unschedule a campaign



// adding email template
// choosing email template for bulk sending
// sending email accorgind to tags
// sending email according to audience

module.exports = {emailManageRouter}
