function wrapEmail(template_code, email_data, listing_data, owner) {
	const wrapper_html = `<table style="font-family:Trebuchet MS,Helvetica,Arial,sans-serif;width:100%;border-spacing: 0px;">
<tr style="background: linear-gradient(to bottom, #f84525 0px, #f84525 50px, #2b2b2b 50px, #2b2b2b 60px);">
	<td style="width: 400px;vertical-align: top;height: 60px;">
	</td>
</tr>
 <tr>
	<td colspan="2" style="text-align: center;">
	   <table id="feedback-blk" cellpadding="0" cellspacing="0" style="display: table;padding-right: 8px; line-height: normal; width:100%;">
			 <tbody>
				  <tr>
				  <td style="line-height: 0; max-width: 600px;padding: 25px 0px; text-align:center;color:#000000">
						${template_code}
					</td>
				</tr>
			 </tbody>
		  </table>
	</td>
 </tr>
 <tr>
	<td colspan="2">
	   <table id="disclaimer-blk" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ececec;display: table;width: 100%; padding-right: 8px; color: #787878; border-top: 1px solid gray; font-size: 13px; line-height: normal;">
			 <tbody>
				  <tr>
				  <td style="line-height: 0; height: 16px; max-width: 600px;"></td>
				</tr>
				<tr>
				   <td style="color: #808080;text-align: center;font-size: 12px;margin: 0;line-height: 120%;padding-top: 10px; width: 473px;padding:15px 0px;">
					<table 	style="width: 500px; margin:0 auto;line-height: 18px; font-size: 12px;border-spacing: 15px;">
						<tr>
							<td style:"text-align:center">
								<img src="https://emailsignatureadmin.react.stagingwebsite.co.in/logo/2023-5_Conative_Logo_1.png" alt="Conative Logo" width:"150px" />
							</td>
						</tr>
						<tr>
							<td>
								${listing_data?.permission_reminder}
							</td>
						</tr>
						<tr>
							<td>	 This email was sent to <span style="text-decoration: underline; font-weight: bold;" > ${email_data?.email}</span> <span style="text-decoration: underline;">Why did i get this?</span><span style="text-decoration: underline;font-style: italic;">unsubscribe from this list</span>  <span style="text-decoration: underline;font-weight: bold;">update subscription prefences</span>
								<span class="list-name">${listing_data?.list_name}-${owner?.contact_info?.street_address1} ${owner?.contact_info?.street_address2}-${owner?.contact_info?.company}-${owner?.contact_info?.city || ""}, ${owner?.contact_info?.state || ""} ${owner?.contact_info?.zip || ""} ${owner?.contact_info?.country || ""}</span></td>
						</tr>
						<tr>
							<td style="font-size: 28px;font-weight: 600;color: #000;"><span style="#f84525">Conative</span> IT Solutions</td>
						</tr>
					</table>
				   </td>
				</tr>
			 </tbody>
		  </table>
	</td>
 </tr>
</table>`
	return wrapper_html
}

module.exports = { wrapEmail }