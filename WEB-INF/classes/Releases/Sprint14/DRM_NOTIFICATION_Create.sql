

begin transaction
--User Input
DECLARE @EmailDispatchDetails_SenderAddress nvarchar(200)='central@thebiggerdata.com'
DECLARE @EmailDispatchDetails_SmtpAddress nvarchar(200)='smtp.sendgrid.net'
DECLARE @EmailDispatchDetails_SmtpUserName nvarchar(200)='dev@thebiggerdata.com'
DECLARE @EmailDispatchDetails_SmtpPassword nvarchar(200)='qSI0ioIbpJ8+FLLTZsVQrQ=='
DECLARE @EmailDispatchDetails_PortNumber numeric(18,0)=587
--End

--Global parameters 
DECLARE @RC int
DECLARE @NotificationMaster_Category nvarchar(200)='DRAService'
DECLARE @EmailDispatchDetails_RecipientAddress nvarchar(200)=''
DECLARE @EmailDispatchDetails_SecondaryRecipientAddress nvarchar(200)=''
DECLARE @EmailDispatchDetails_Bcc nvarchar(200)=''
--end


DECLARE @NotificationMaster_Name nvarchar(200)=''
DECLARE @Template_Name nvarchar(200)=''
DECLARE @EmailContentDetails_Subject nvarchar(500)=''
DECLARE @LocaleTemplate_Content nvarchar(max)=''

--1 Notification

set @NotificationMaster_Name='DRAService Subscribed Notification'
set @Template_Name =@NotificationMaster_Name + 'Template'
set @EmailContentDetails_Subject ='Welcome to the {{servicename}}'
set @LocaleTemplate_Content ='<table cellspacing="0" cellpadding="0" align="center" width="100%" style="background-color: #f0f0f0; padding-top: 30px; padding-bottom: 30px;">
   <tr>
        <td>
            <table cellspacing="0" cellpadding="0" align="center" width="600">
                <tr>
                    <td align="left" valign="top">
                        <table cellspacing="0" cellpadding="0" align="center" width="600">
                            <tr>
                                <td align="left" valign="top" colspan="2">
                                    <table cellspacing="0" cellpadding="0" align="center" width="100%">
                                        <tr>
                                            <td align="left" valign="top" width="60" style="background-color: #02428C"></td>
                                            <td align="left" valign="top" width="540" style="background-color: #ffffff">
                                                <table cellspacing="0" cellpadding="0" align="center" width="100%">
                                                  <tr>
                                                     <td style="padding-left: 30px;padding-top: 20px;padding-right: 30px;padding-bottom: 20px;">
                                                        <img src="https://test-drm-web.thebiggerdata.com/Logoimagefolder/kpmg-logo.png" alt="KPMG-Logo" width="78" height="31" style="font-size: 0;line-height: 0" />
                                                     </td>                                  
                                                  </tr>
                                                  <tr>
                                                     <td style="padding-left: 30px;padding-right: 30px;padding-bottom: 20px; border-bottom:1px solid #e3e3e3">
                                                        <img src= "https://test-drm-web.thebiggerdata.com/Logoimagefolder/DRAService-logo.png" width="220" height="55" alt="dra-logo" style="line-height: 0;font-size: 0" /></td>
                                                  </tr>  
                                                    <tr>
                                                        <td align="left" valign="top" style="padding-left: 30px;padding-top: 20px;padding-right: 30px;font-family:Arial;color: #004e98;font-size:18px;line-height: 20px;">
                                                            Dear {{firstname}},&nbsp;
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="padding-left: 30px;padding-top: 20px;padding-right: 30px;font-family:Arial;color: #414042;font-size:14px;line-height: 20px;">
                                                            Welcome to the KPMG DRA service, this account provides you with access to your subscribed KPMG services.
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="padding-left: 30px;padding-top: 20px;padding-right: 30px;font-family:Arial;color: #414042;font-size:14px;line-height: 20px;">
                                                            Please activate your account. 
                                                        </td>
                                                    </tr>                                                    
                                                    <tr>
                                                        <td>
                                                            <table cellpadding="15" cellspacing="0" align="center" width="100%">
                                                                <tr>
                                                                    <td width="150px" align="right" style="padding-right: 30px;">
                                                                        <table cellpadding="15" cellspacing="0">
                                                                            <tr>
                                                                                <td style="background-color:#2cb34a; font-family:Arial;color: #666666;font-size:16px;line-height: 18px;">
                                                                                    <a href="{{serviceurl}}?companycode={{companycode}}" style="background: #2cb34a; color: #fff !important; display: inline-block; font-size: 18px; line-height: 20px; text-decoration: none;font-family:Arial;"><font color="#ffffff" style="font-size:18px;">Login</font></a>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>

                                                            </table>
                                                        </td>
                                                    </tr>
                                                   <tr>
                                                      <td align="left" valign="top" style="padding-left: 30px;padding-top: 15px;padding-bottom:15px;padding-right: 30px;font-family:Arial;color: #666666;font-size:11px;line-height: 20px; border-bottom: 1px solid #e3e3e3">This is an automated system message, please do not reply.
                                                        <p style="font-size:11px;margin:0px;"><font style="font-size:11px;font-weight:bold">Support: </font>Email - <a href="mailto: readytohelp@kpmg.com.au" style="text-decoration: none;font-weight:bold;color:#02428C"><font color="#02428C" style="font-size:11px;text-decoration: none;">ReadyToHelp@kpmg.com.au</font></a> | Phone - <font style="font-size:11px;font-weight:bold">1800 789 451</font> or <font style="font-size:11px;font-weight:bold">+61 3 9838 4777</font></p>                                            
                                                      </td>
                                                   </tr> 
                                                   <tr>
                                                      <td align="left" valign="top" align="left" valign="top" style="font-family:Arial;color: #666666;font-size:11px;line-height: 14px; padding-left: 30px; padding-top:15px;padding-bottom: 0px;padding-right: 30px;">&copy; 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.</td>
                                                   </tr>
                                                   <tr>
                                                      <td align="left" valign="top" align="left" valign="top" style="font-family:Arial;color: #666666;font-size:11px;line-height: 14px; padding-left: 30px; padding-top:10px;padding-bottom: 0px;padding-right: 30px;">The KPMG name and logo are registered trademarks or trademarks of KPMG International.</td>
                                                   </tr> 
                                                   <tr>
                                                      <td align="left" valign="top" align="left" valign="top" style="font-family:Arial;color: #666666;font-size:11px;line-height: 14px; padding-left: 30px; padding-top:10px;padding-bottom: 30px;padding-right: 30px;">Liability limited by a scheme approved under Professional Standards Legislation.</td>
                                                   </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>         
        </td>
   </tr>
</table>
'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[uspInsertOperations] 
   @NotificationMaster_Category
  ,@NotificationMaster_Name
  ,@Template_Name
  ,@EmailDispatchDetails_SenderAddress
  ,@EmailDispatchDetails_RecipientAddress
  ,@EmailDispatchDetails_SecondaryRecipientAddress
  ,@EmailDispatchDetails_SmtpAddress
  ,@EmailDispatchDetails_SmtpUserName
  ,@EmailDispatchDetails_SmtpPassword
  ,@EmailDispatchDetails_Bcc
  ,@EmailDispatchDetails_PortNumber
  ,@EmailContentDetails_Subject
  ,@LocaleTemplate_Content

  
  --2 Notification

set @NotificationMaster_Name='DRAServiceContactUs'
set @Template_Name =@NotificationMaster_Name + 'Template'
set @EmailContentDetails_Subject ='Enquiry from DRA survey - {{companyName}}/{{engagementId}}'
set @LocaleTemplate_Content ='<p>Name : {{contactUsName}}</p><p>Email Id : {{contactUsEmailId}}</p><p>Company Name : {{contactUsCompanyName}}</p><p></p><p></p><p><span style="line-height: 1.42857;">Phone No : {{contactUsPhoneNo}}</span><br></p><p>Comments : {{contactUsComments}}</p>
'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[uspInsertOperations] 
   @NotificationMaster_Category
  ,@NotificationMaster_Name
  ,@Template_Name
  ,@EmailDispatchDetails_SenderAddress
  ,@EmailDispatchDetails_RecipientAddress
  ,@EmailDispatchDetails_SecondaryRecipientAddress
  ,@EmailDispatchDetails_SmtpAddress
  ,@EmailDispatchDetails_SmtpUserName
  ,@EmailDispatchDetails_SmtpPassword
  ,@EmailDispatchDetails_Bcc
  ,@EmailDispatchDetails_PortNumber
  ,@EmailContentDetails_Subject
  ,@LocaleTemplate_Content




  --3 Notification

set @NotificationMaster_Name='DRAParticipantFirstReminder'
set @Template_Name =@NotificationMaster_Name + 'Template'
set @EmailContentDetails_Subject ='Gentle reminder: Your invite to participate in the Dynamic Risk Assessment survey – {{engagement_id}}'
set @LocaleTemplate_Content ='<table width="600" style="margin: 0 auto; " cellspacing="0" cellpadding="0" border="0">
    <tbody>
        <tr>
            <td style="background-color:#02428c" width="45">&nbsp;</td>
            <td>
                <table style="width: 100.0%; background:white;" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                        <tr>
                            <td>
                                <img src="https://uat-dra-web.thebiggerdata.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">
                            </td>
                        </tr>
                        <tr>
                            <td style="font-family: Arial, sans-serif; font-size: 13.5pt; padding:5px;background-color: #666666; text-align: center; color: white; ">We value your participation</td>
                        </tr>
                        <tr>
                            <td style="padding: 11.25pt 11.25pt 11.25pt 11.25pt; height: 75.0pt;background:white; border-top:1px solid #ECECEC ;font-family: Arial;">
                                <p><span align="left" valign="top" style="color: rgb(0, 78, 152); font-family: Arial; font-size: 18px; padding-top: 35px; padding-bottom: 10px; padding-right: 30px;">Hi {{firstName}},                                       </span> 
                                </p>
                                <p><span align="left" valign="top" style="color: rgb(0, 78, 152); font-family: Arial; font-size: 18px; padding-top: 35px; padding-bottom: 10px;                                        padding-right: 30px;"><br></span>
                                </p>
                                <p><span align="left" valign="top" style="padding-top: 35px; padding-bottom: 10px; padding-right: 30px;">Haven’t yet completed the Dynamic Risk Assessment survey?<br></span> 
                                </p>
                                <p><span align="left" valign="top" style="padding-top: 35px;                                        padding-bottom: 10px; padding-right: 30px;"><br></span>
                                </p>
                                <p><span style="line-height: 20px;">Don’t worry, it’s not too late to provide us your valuable insights! You can still get involved.</span>
                                    <br>
                                </p>
                                <p><span style="line-height: 1.42857;"><br></span>
                                </p>
                                <p><b>Simply:</b>
                                    <br>
                                </p>
                                <p></p>
                                <ul>
                                    <li>Go to Survey
                                        <br>
                                    </li>
                                    <li>Complete 3 short sections using interactive graphs</li>
                                    <li>Send any comments via the feedback form toward the end of the survey
                                        <br>
                                    </li>
                                    <li>Submit</li>
                                </ul>
                                <p>
                                    <br>
                                </p>
                                Your responses are highly valued so we’d would love to hear what you think!
                                <br style="line-height: 20px;">
                                <p></p>
                                <p>
                                    <br>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:11.25pt 11.25pt 11.25pt 11.25pt;background:white; float : right">
                                <p align="right"></p>
                                <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">
                                            <td style="background:#2CB34A;padding:11.25pt 11.25pt 11.25pt 11.25pt">
                                                <p class="MsoNormal" style="line-height:13.5pt">
                                                    <span style="font-family:&quot;Arial&quot;,&quot;sans-serif&quot;;color:#666666">
                                                      <a href="{{url}}" style="text-decoration:none"><span style="font-size:13.5pt;color:white;background:#2CB34A;">Go to Survey</span>
                                                    </a>
                                                    <o:p></o:p>
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p></p>
                            </td>
                        </tr>                    
                        <tr>
                            <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">
                                <p>
                                    <br><span style="color: rgb(68, 68, 68); font-family:  Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>
                                </p>
                                <br>
                                <hr>
                                <p><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[uspInsertOperations] 
   @NotificationMaster_Category
  ,@NotificationMaster_Name
  ,@Template_Name
  ,@EmailDispatchDetails_SenderAddress
  ,@EmailDispatchDetails_RecipientAddress
  ,@EmailDispatchDetails_SecondaryRecipientAddress
  ,@EmailDispatchDetails_SmtpAddress
  ,@EmailDispatchDetails_SmtpUserName
  ,@EmailDispatchDetails_SmtpPassword
  ,@EmailDispatchDetails_Bcc
  ,@EmailDispatchDetails_PortNumber
  ,@EmailContentDetails_Subject
  ,@LocaleTemplate_Content



  --4 Notification

set @NotificationMaster_Name='DRAParticipantSecondReminder'
set @Template_Name =@NotificationMaster_Name + 'Template'
set @EmailContentDetails_Subject ='Dynamic Risk Assessment Survey - Awaiting your participation'
set @LocaleTemplate_Content ='<table style="margin: 0 auto; " border="0" cellpadding="0" cellspacing="0" width="600">
    <tbody>
        <tr>
            <td style="background-color:#02428c" width="45">&nbsp;</td>
            <td>
                <table style="width: 100.0%; background:white;" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                        <tr>
                            <td>	
								<img src="https://uat-dra-web.thebiggerdata.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">
                            </td>
                        </tr>
                        <tr>
                            <td style="font-family: Arial, sans-serif; font-size: 13.5pt; padding:5px;background-color: #666666; text-align: center; color: white; ">Don''t miss out</td>
                        </tr>
                        <tr>
                            <td style="padding: 11.25pt; height: 75.0pt;background:white; border-top:0.75pt solid #ECECEC ">
                                <p><span style="font-family: Arial, sans-serif; line-height: 1.42857;font-size:15pt">Hi {{firstName}},</span>
                                </p>
                                <p><span style="font-family:  Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">It looks like you''ve been missing in action!<br>That’s okay, it’s not too late to get involved in the </span><b style="font-family: Arial, sans-serif; line-height: 1.42857; margin-top: 7.5pt; margin-bottom: 0; padding: 0;font-size:10.5pt">Dynamic Risk Assessment</b>
                                    <span
                                    style="font-family: Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">survey. You can still jump on-board and provide your valuable risk insights.</span>
                                </p>
                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding-bottom:10px ; font-family: Arial, sans-serif;font-size:10.5pt"> <b style="margin-top: 7.5pt; margin-bottom: 0; padding-bottom:10px ; font-family:Arial, sans-serif;">All that''s required:</b> 
                                </p>
                                <ul style="font-family: Arial, sans-serif;font-size:10.5pt">
                                    <li>Go to Survey</li>
                                    <li>Check the accuracy of risk descriptions</li>
                                    <br>
                                    <li style="list-style:none">Have we covered all the risks you''d like us to consider?</li>
                                    <br>
                                    <li>Send any comments via the feedback form toward the end of the survey.</li>
                                </ul>
                                <p></p>
                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">Be <i>‘quick as a flash’</i> as our survey will close shortly.
                                    <br>We wouldn’t want you to miss out!.</p>
                                <br>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: white none repeat scroll 0% 0%; float: right; padding: 0pt 11.25pt;">
                                <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" align="right" border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">
                                            <td style="background:#43b02a;padding:7.5pt;font-size: 13.5pt; height: 20.5pt; text-align:center;" width="160">
                                                <p class="MsoNormal" style="line-height: 13.5pt"> <span style="font-family:&quot;Arial&quot;,&quot;sans-serif&quot;">                                          <a href="{{url}}" style="text-decoration:none;"><span style="font-size: 13.5pt;color:white;">Go to Survey</span>
                                                    </a>
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">
                                <p>
                                    <br><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>
                                </p>
                                <br>
                                <hr>
                                <p><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[uspInsertOperations] 
   @NotificationMaster_Category
  ,@NotificationMaster_Name
  ,@Template_Name
  ,@EmailDispatchDetails_SenderAddress
  ,@EmailDispatchDetails_RecipientAddress
  ,@EmailDispatchDetails_SecondaryRecipientAddress
  ,@EmailDispatchDetails_SmtpAddress
  ,@EmailDispatchDetails_SmtpUserName
  ,@EmailDispatchDetails_SmtpPassword
  ,@EmailDispatchDetails_Bcc
  ,@EmailDispatchDetails_PortNumber
  ,@EmailContentDetails_Subject
  ,@LocaleTemplate_Content



  --5 Notification

set @NotificationMaster_Name='DRAParticipantDraftSecondReminder'
set @Template_Name =@NotificationMaster_Name + 'Template'
set @EmailContentDetails_Subject ='Draft Dynamic Risk Assessment survey - {{engagement_id}} - Awaiting your review'
set @LocaleTemplate_Content ='<table style="margin: 0 auto; " border="0" cellpadding="0" cellspacing="0" width="600">
    <tbody>
        <tr>
            <td style="background-color:#02428c" width="45">&nbsp;</td>
            <td>
                <table style="width: 100.0%; background:white;" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                        <tr>
                            <td>
									<img src="https://uat-dra-web.thebiggerdata.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">
                            </td>
                        </tr>
                        <tr>
                            <td style="font-family:Arial, sans-serif; font-size: 13.5pt; padding:5px;background-color: #666666; text-align: center; color: white; ">We''ve have missed you..</td>
                        </tr>
                        <tr>
                            <td style="padding: 11.25pt; height: 75.0pt;background:white; border-top:0.75pt solid #ECECEC ">
                                <p><span style="font-family:Arial, sans-serif; line-height: 1.42857;font-size:15pt">Hi {{firstName}},</span>
                                </p>
                                <p><span style="font-family: Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">It looks like we''re missing your valuable feedback.<br>Don''t worry, it''s not too late to review the draft </span><b style="font-family:Arial, sans-serif; line-height: 1.42857; margin-top: 7.5pt; margin-bottom: 0; padding: 0;font-size:10.5pt">Dynamic Risk Assessment</b>
                                    <span
                                    style="font-family:Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">survey for {{engagement_id}}.</span>
                                </p>
                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding-bottom:10px ; font-family:Arial, sans-serif;font-size:10.5pt"> <b style="margin-top: 7.5pt; margin-bottom: 0; padding-bottom:10px ; font-family: Arial, sans-serif;">All that''s required:</b> 
                                </p>
                                <ul style="font-family:Arial, sans-serif;font-size:10.5pt">
                                    <li>Go to Survey</li>
                                    <li>Check the accuracy of risk descriptions</li>
                                    <br>
                                    <li style="list-style:none">Have we covered all the risks you''d like us to consider?</li>
                                    <br>
                                    <li>Send any comments via the feedback form toward the end of the survey.</li>
                                </ul>
                                <p></p>
                                <br>
                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family:Arial, sans-serif;font-size:10.5pt">We''ll be finalising the survey shortly so would appreciate your prompt response.</p>
                                <br>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: white none repeat scroll 0% 0%; float: right; padding: 0pt 11.25pt;">
                                <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" align="right" border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">
                                            <td style="background:#43b02a;padding:7.5pt;font-size: 13.5pt; height: 20.5pt; text-align:center;" width="160">
                                                <p class="MsoNormal" style="line-height: 13.5pt"> <span style="font-family:Arial;,&quot;sans-serif&quot;">                                          <a href="{{url}}" style="text-decoration:none;"><span style="font-size: 13.5pt;color:white;">Go to Survey</span>
                                                    </a>
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">
                                <p>
                                    <br><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>
                                </p>
                                <br>
                                <hr>
                                <p><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[uspInsertOperations] 
   @NotificationMaster_Category
  ,@NotificationMaster_Name
  ,@Template_Name
  ,@EmailDispatchDetails_SenderAddress
  ,@EmailDispatchDetails_RecipientAddress
  ,@EmailDispatchDetails_SecondaryRecipientAddress
  ,@EmailDispatchDetails_SmtpAddress
  ,@EmailDispatchDetails_SmtpUserName
  ,@EmailDispatchDetails_SmtpPassword
  ,@EmailDispatchDetails_Bcc
  ,@EmailDispatchDetails_PortNumber
  ,@EmailContentDetails_Subject
  ,@LocaleTemplate_Content
  


  --6 Notification

set @NotificationMaster_Name='DRAPPTReportNotification'
set @Template_Name =@NotificationMaster_Name + 'Template'
set @EmailContentDetails_Subject ='KPMG Dynamic Risk Assessment {{engagement_id}} – Your report is ready'
set @LocaleTemplate_Content ='<table width="600" style="margin: 0 auto; " cellspacing="0" cellpadding="0" border="0">    <tbody>        <tr>            <td style="background-color:#02428c" width="45">&nbsp;</td>            <td>                <table style="width: 100.0%; background:white;" cellspacing="0" cellpadding="0" border="0">                    <tbody>                        <tr>                            <td>                                <img src="https://uat-dra-web.thebiggerdata.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">                            </td>                        </tr>                        <tr>                            <td style="font-family: Arial, sans-serif; font-size: 13.5pt; background-color: #666666; padding:5px;text-align: center; color: white; "><b>Your report is ready</b>                            </td>                        </tr>                              <tr>                                 <td style="padding: 11.25pt 11.25pt 11.25pt 11.25pt; height: 75.0pt;background:white; border-top:1px solid #ECECEC ">                                    <p><span align="left" valign="top" style="color: rgb(0, 78, 152); font-family: Arial; font-size: 18px; padding-top: 35px; padding-bottom: 10px; padding-right: 30px;">Dear {{firstName}},                                       </span>                                    </p>                                    <p><span align="left" valign="top" style="color: rgb(0, 78, 152); font-family: Arial; font-size: 18px; padding-top: 35px; padding-bottom: 10px;                                        padding-right: 30px;"><br></span></p>                                    <p><span align="left" valign="top" style="padding-top: 35px; padding-bottom: 10px; padding-right: 30px;">The PowerPoint report of the recent Dynamic Risk Assessment for {{engagement_id}} :<br></span>                                    </p>                                    <p><span align="left" valign="top" style="padding-top: 35px;                                        padding-bottom: 10px; padding-right: 30px;"><br></span></p>                                    <p style="background-color:#D9D9D7;padding:15px;text-align:center"><span>{{client_id}} <br></span>   </p>                                    <p><span align="left" valign="top" style="padding-top: 35px;                                        padding-bottom: 10px; padding-right: 30px;"><br></span></p>                                    <p style="text-align:center"><span>is now Ready <br></span>                                                                     </p>                                 </td>                              </tr>                              <tr>                                 <td style="padding:11.25pt 11.25pt 11.25pt 11.25pt;background:white; float : right">                                    <p align="right"></p>                                    <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" border="0" cellpadding="0" cellspacing="0">                                       <tbody>                                          <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">                                             <td style="background:#2CB34A;padding:11.25pt 11.25pt 11.25pt 11.25pt">                                                <p class="MsoNormal" style="line-height:13.5pt">                                                   <span style="font-family:&quot;Arial&quot;,&quot;sans-serif&quot;;color:#666666">                                                      <a href="{{url}}" style="text-decoration:none"><span style="font-size:13.5pt;color:white;background:#2CB34A;">Go to Report</span></a>                                                   </span>                                                </p>                                             </td>                                          </tr>                                       </tbody>                                    </table>                                    <p></p>                                 </td>                              </tr>                        <tr>                            <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">                                <p>                                    <br><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>                                </p>                                <br>                                <hr>                                <p><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>                                </p>                            </td>                        </tr>                    </tbody>                </table>            </td>        </tr>    </tbody></table>'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[uspInsertOperations] 
   @NotificationMaster_Category
  ,@NotificationMaster_Name
  ,@Template_Name
  ,@EmailDispatchDetails_SenderAddress
  ,@EmailDispatchDetails_RecipientAddress
  ,@EmailDispatchDetails_SecondaryRecipientAddress
  ,@EmailDispatchDetails_SmtpAddress
  ,@EmailDispatchDetails_SmtpUserName
  ,@EmailDispatchDetails_SmtpPassword
  ,@EmailDispatchDetails_Bcc
  ,@EmailDispatchDetails_PortNumber
  ,@EmailContentDetails_Subject
  ,@LocaleTemplate_Content



  --7 Notification

set @NotificationMaster_Name='DRAParticipantDraftFirstReminder'
set @Template_Name =@NotificationMaster_Name + 'Template'
set @EmailContentDetails_Subject ='Gentle reminder - Not too late to provide feedback on the draft Dynamic Risk Assessment survey – {{engagement_id}}'
set @LocaleTemplate_Content ='<table style="margin: 0 auto; " border="0" cellpadding="0" cellspacing="0" width="600">
    <tbody>
        <tr>
            <td style="background-color:#02428c" width="45">&nbsp;</td>
            <td>
                <table style="width: 100.0%; background:white;" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                        <tr>
                            <td>
                                <img src="https://uat-dra-web.thebiggerdata.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">
                            </td>
                        </tr>
                        <tr>
                            <td style="font-family: Arial, sans-serif; font-size: 13.5pt; padding:5px;background-color: #666666; text-align: center; color: white; "><b>Draft Survey - Your Feedback</b>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 11.25pt 11.25pt 11.25pt 11.25pt; height: 75.0pt;background:white; border-top:1px solid #ECECEC ;font-family: Arial;  ">
                                <p><span align="left" valign="top" style="color: rgb(0, 78, 152); font-family: Arial; font-size: 18px; padding-top: 35px; padding-bottom: 10px; padding-right: 30px;">Hi {{firstName}},                                       </span> 
                                </p>
                                <p><span align="left" valign="top" style="color: rgb(0, 78, 152); font-family: Arial; font-size: 18px; padding-top: 35px; padding-bottom: 10px;                                        padding-right: 30px;"><br></span>
                                </p>
                                <p><span align="left" valign="top" style="padding-top: 35px; padding-bottom: 10px; padding-right: 30px;font-family: Arial;">Haven’t yet                                        checked the draft Dynamic Risk Assessment survey that was sent to you?<br></span> 
                                </p>
                                <p><span align="left" valign="top" style="padding-top: 35px;                                        padding-bottom: 10px; padding-right: 30px;"><br></span>
                                </p>
                                <p><span style="line-height: 1.42857;font-family: Arial;">No problems, it’s not too late to send us your feedback!                                       </span>
                                    <br>
                                </p>
                                <p><span style="line-height: 1.42857;"><br></span>
                                </p>
                                <p><b>Simply:</b>
                                    <br>
                                </p>
                                <p></p>
                                <ul>
                                    <li>Go to Survey
                                        <br>
                                    </li>
                                    <li>Check the accuracy of risk descriptions</li>
                                </ul> <span style="line-height: 1.42857;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Have we covered all the risks you’d like us to consider?                                    </span> 
                                <p></p>
                                <p></p>
                                <ul>
                                    <li><span style="line-height: 1.42857;">Send any comments via the feedback form toward the end of the survey</span>
                                        <br>
                                    </li>
                                </ul>
                                <p>
                                    <br>
                                </p>We would love to hear what you think!
                                <br style="line-height: 20px;">
                                <p></p>
                                <p>
                                    <br>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:11.25pt 11.25pt 11.25pt 11.25pt;background:white; float : right">
                                <p align="right"></p>
                                <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">
                                            <td style="background:#2CB34A;padding:11.25pt 11.25pt 11.25pt 11.25pt">
                                                <p class="MsoNormal" style="line-height:13.5pt"> <span style="font-family:&quot;Arial&quot;,&quot;sans-serif&quot;;color:#666666">                                                      <a href="{{url}}" style="text-decoration:none"><span style="font-size:13.5pt;color:white;background:#2CB34A;">Go to Survey</span>
                                                    </a>
                                                    <o:p></o:p>
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">
                                <p>
                                    <br><span style="color: rgb(68, 68, 68); font-family:  Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>
                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>
                                </p>
                                    <br>

                                <hr>
                                <p><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
'

-- TODO: Set parameter values here.

EXECUTE @RC = [dbo].[uspInsertOperations] 
   @NotificationMaster_Category
  ,@NotificationMaster_Name
  ,@Template_Name
  ,@EmailDispatchDetails_SenderAddress
  ,@EmailDispatchDetails_RecipientAddress
  ,@EmailDispatchDetails_SecondaryRecipientAddress
  ,@EmailDispatchDetails_SmtpAddress
  ,@EmailDispatchDetails_SmtpUserName
  ,@EmailDispatchDetails_SmtpPassword
  ,@EmailDispatchDetails_Bcc
  ,@EmailDispatchDetails_PortNumber
  ,@EmailContentDetails_Subject
  ,@LocaleTemplate_Content
    

--	rollback transaction
	commit transaction