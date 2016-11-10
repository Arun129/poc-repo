
declare @Template_Id uniqueidentifier=NEWID()

declare @NotificationMaster_Name nvarchar(200)='DRAParticipantSurvey'
declare @Template_Name nvarchar(200)=@NotificationMaster_Name+ 'Template'

declare @LocaleTemplate_Content nvarchar(max)=N'<table width="600" style="margin: 0 auto; " cellspacing="0" cellpadding="0" border="0">   <tbody>      <tr>         <td style="background-color:#02428c" width="45">&nbsp;</td>         <td>            <table style="width: 100.0%; background:white;" cellspacing="0" cellpadding="0" border="0">               <tbody>                  <tr>                     <td>                        <img src="https://dra.kpmgedge.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">                     </td>                  </tr>                  <tr>                     <td style="font-family: Arial, sans-serif; font-size: 13.5pt; background-color: #666666; padding:5px;text-align: center; color: white; "><b>Your Invitation</b>                     </td>                  </tr>                  <tr>                     <td style="padding: 11.25pt; height: 75.0pt;background:white; border-top:0.75pt solid #ECECEC ">                        <p><span style="font-family: Arial, sans-serif; line-height: 1.42857;font-size:15pt">Dear {{firstName}},</span>                        </p>                        <p><span style="font-family:  Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">You are invited to take part in a </span><b style="font-family: Arial, sans-serif; line-height: 1.42857; margin-top: 7.5pt; margin-bottom: 0; padding: 0;font-size:10.5pt"> KPMG Dynamic Risk Assessment Survey.</b>                        </p>                        <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">This survey enables you to identify the interconnections, severity, likelihood and velocity between the risks in the organisation.</p>                        <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">Your responses are highly valued and will help us understand our organization''s risk profile including systemic risks and flow on effect within the risk profile.</p>                     </td>                  </tr>                  <tr>                     <td style="padding: 11.25pt; background:white;display:{{showMessage}} ">                        <table style="width: 100.0%; background:#f0f0f0 none repeat scroll 0 0;" cellspacing="0" cellpadding="0" border="0">                           <tbody>                              <tr>                                 <td style="padding: 11.25pt; ">                                    <p style="margin-bottom: 0; padding: 0; font-family: Arial, sans-serif; font-size:10.5pt">A message from {{clientLead_firstName}}&nbsp;{{clientLead_lastName}}</p>                                    <p style="margin-bottom: 0; padding: 0; font-family: Arial, sans-serif; font-size:10.5pt">{{email_content}}</p>                                 </td>                              </tr>                           </tbody>                        </table>                     </td>                  </tr>                  <tr>                     <td style="background: white none repeat scroll 0% 0%; float: right; padding: 0pt 11.25pt;">                        <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" align="right" border="0" cellpadding="0" cellspacing="0">                           <tbody>                              <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">                                 <td style="background:#43b02a;padding:7.5pt;font-size: 13.5pt; height: 20.5pt; text-align:center;" width="160">                                    <p class="MsoNormal" style="line-height: 13.5pt"> <span style="font-family:&quot;Arial&quot;,&quot;sans-serif&quot;">                                          <a href="{{url}}" style="text-decoration:none"><span style="font-size: 13.5pt;color:white;">Start Survey</span>                                       </a>                                       </span>                                    </p>                                 </td>                              </tr>                           </tbody>                        </table>                     </td>                  </tr>                  <tr>                     <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">                        <p>                           <br><span style="color: rgb(68, 68, 68); font-family:Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>                           <br><span style="font-family:Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com</b></a></span>                           <br><span style="font-family:Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>                        </p>                        <hr>                        <p><span style="color: rgb(68, 68, 68); font-family:Arial, sans-serif; font-size: 9pt;">© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>                        </p>                     </td>                  </tr>               </tbody>            </table>         </td>      </tr>   </tbody></table>'



Insert into Template (Template_Id, Template_TenantId, Template_Name, Template_Description, Template_Content, Template_CreatedBy, Template_CreatedOn, Template_UpdatedBy, Template_UpdatedOn, Template_Status, Template_Category) OUTPUT Inserted.Template_Id values (@Template_Id, 'b590cd25-3093-df11-8deb-001ec9dab123', @Template_Name, @Template_Name, NULL, '3398f837-b988-4708-999d-d3dfe11875b3', Getdate(), NULL, NULL, 1, 'NotificationTemplate')

Insert into LocaleTemplate (LocaleTemplate_TemplateId, LocaleTemplate_LocaleName, LocaleTemplate_Content, LocaleTemplate_LocaleId, LocaleTemplate_CreatedBy, LocaleTemplate_CreatedOn, LocaleTemplate_Status)  OUTPUT Inserted.LocaleTemplate_Id values (@Template_Id, 'en', @LocaleTemplate_Content, 'a1d85bdf-986a-427d-961f-6ff7df839c53','3398f837-b988-4708-999d-d3dfe11875b3', Getdate(), 1)

Update EmailContentDetails set EmailContentDetails_TemplateId = @Template_Id where EmailContentDetails_ContentDetailsId = 
(select NotificationDetails_ContentDetailsId from NotificationDetails where NotificationDetails_NotificationId in 
(select NotificationMaster_Id from NotificationMaster where NotificationMaster_Name = @NotificationMaster_Name) and NotificationDetails_TenantId is NULL)


