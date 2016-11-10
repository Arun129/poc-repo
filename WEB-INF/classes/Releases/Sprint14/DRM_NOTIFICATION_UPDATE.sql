
begin transaction 

declare @LocaleTemplate_Content Nvarchar(max)
declare @NotificationMaster_Name Nvarchar(200)
declare @LocaleTemplate_LocaleName Nvarchar(20)=''

declare @notificationId uniqueidentifier
declare @notificationcontentdetailsId uniqueidentifier
declare @templateId uniqueidentifier

--Notification 1
set @NotificationMaster_Name='DRAClientLeadSurvey'
set @LocaleTemplate_Content='<table style="margin: 0 auto; " width="600" cellspacing="0" cellpadding="0" border="0">    <tbody>        <tr>            <td style="background-color:#02428c" width="45">&nbsp;</td>            <td>                <table style="width: 100.0%; background:white;" cellspacing="0" cellpadding="0" border="0">                    <tbody>                        <tr>                            <td>                               <img src="https://uat-dra-web.thebiggerdata.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">                            </td>                        </tr>                        <tr>                            <td style="font-family:Arial, sans-serif; font-size: 13.5pt; background-color: #666666; padding:5px;text-align: center; color: white; "><b>Ready to Send</b>                            </td>                        </tr>                        <tr>                            <td style="padding: 11.25pt; height: 75.0pt;background:white; border-top:0.75pt solid #ECECEC ">                                <p><span style="font-family:Arial, sans-serif; line-height: 1.42857;font-size:15pt">Dear {{lead_name}},</span>                                </p>                                <p><span style="font-family: Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">Your </span><b style="font-family:Arial, sans-serif; line-height: 1.42857; margin-top: 7.5pt; margin-bottom: 0; padding: 0;font-size:10.5pt">Dynamic Risk Assessment</b>                                    <span style="font-family:Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">survey is now finalised and ready to send to participants.</span>                                </p>                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family:Arial, sans-serif;font-size:10.5pt"> <b style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family:Arial, sans-serif;">Simply</b>:                                    <br>1. Go to your dashboard                                    <br>2. Navigate to ‘Send Survey’                                    <br>3. Upload your participant database                                    <br>4. Compose a personalised message                                    <br>5. Send</p>                                <br>                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family:Arial, sans-serif;font-size:10.5pt">Feel free to <a style="margin-top: 7.5pt; text-decoration:none ; margin-bottom: 0; padding: 0;font-size:10.5pt" href="mailto:{{engagementManager_email}}"><span style="margin-top: 7.5pt; margin-bottom: 0; padding: 0;color: #00338D;font-size:10.5pt"><b>contact us</b></span></a> if                                    you have any further questions.</p>                            </td>                        </tr>                        <tr>                            <td style="padding: 11.25pt; background:white;display:{{showMessage}} ">                                <table style="width: 100.0%; background:#f0f0f0 none repeat scroll 0 0;" cellspacing="0" cellpadding="0" border="0">                                    <tbody>                                        <tr>                                            <td style="padding: 11.25pt; ">                                                <p style="margin-bottom: 0; padding: 0; font-family:Arial, sans-serif;">A message from {{engagementManager_firstName}}&nbsp;{{engagementManager_lastName}}</p>                                                <p style="margin-bottom: 0; padding: 0; font-family:Arial, sans-serif;">{{email_content}}</p>                                            </td>                                        </tr>                                    </tbody>                                </table>                            </td>                        </tr>                        <tr>                            <td style="background: white none repeat scroll 0% 0%; float: right; padding: 0pt 11.25pt;">                                <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" cellspacing="0" cellpadding="0" border="0" align="right">                                    <tbody>                                        <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">                                            <td style="background:#43b02a;padding:7.5pt;font-size: 13.5pt; height: 20.5pt; text-align:center;" width="200">                                                <p class="MsoNormal" style="line-height: 13.5pt"> <span style="font-family: Arial,sans-serif"> <a href="{{url}}" style="text-decoration:none"><span style="font-size: 13.5pt;color:white;">Go to Send Survey</span>                                                    </a>                                                    </span>                                                </p>                                            </td>                                        </tr>                                    </tbody>                                </table>                            </td>                        </tr>                        <tr>                            <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">                                <p>                                    <br><span style="color: rgb(68, 68, 68); font-family:  Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>                                </p>                                <br>                                <hr>                                <p><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>                                </p>                            </td>                        </tr>                    </tbody>                </table>            </td>        </tr>    </tbody></table>
'
select @notificationId = notificationmaster.NotificationMaster_Id from notificationmaster where NotificationMaster_Name = @NotificationMaster_Name
select @notificationcontentdetailsId = NotificationDetails_contentDetailsId from NotificationDetails where NotificationDetails_notificationid = @notificationId
select @templateId = EmailContentDetails.EmailContentDetails_TemplateId from EmailContentDetails where EmailContentDetails.EmailContentDetails_ContentDetailsId = @notificationcontentdetailsId

if @notificationId IS NULL
RAISERROR('NotificationName not found',16,1)

IF (@templateId IS NULL and  LEN(ISNULL(@LocaleTemplate_LocaleName, '')) = 0)
update EmailContentDetails set EmailContentDetails_Content = @LocaleTemplate_Content where EmailContentDetails.EmailContentDetails_ContentDetailsId = @notificationcontentdetailsId

else if LEN(ISNULL(@LocaleTemplate_LocaleName, '')) = 0
RAISERROR('LocaleName not found',16,1)

Else
update LocaleTemplate set LocaleTemplate_Content = @LocaleTemplate_Content where LocaleTemplate_templateId =  @templateId and LocaleTemplate_LocaleName=@LocaleTemplate_LocaleName




--Notification 2
set @NotificationMaster_Name='DRAParticipantSurvey'

set @LocaleTemplate_Content='<table width="600" style="margin: 0 auto; " cellspacing="0" cellpadding="0" border="0">
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
                            <td style="font-family: Arial, sans-serif; font-size: 13.5pt; background-color: #666666; padding:5px;text-align: center; color: white; "><b>Your Invitation</b>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 11.25pt; height: 75.0pt;background:white; border-top:0.75pt solid #ECECEC ">
                                <p><span style="font-family: Arial, sans-serif; line-height: 1.42857;font-size:15pt">Dear {{firstName}},</span>
                                </p>
                                <p><span style="font-family:  Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">You are invited to take part in a </span><b style="font-family: Arial, sans-serif; line-height: 1.42857; margin-top: 7.5pt; margin-bottom: 0; padding: 0;font-size:10.5pt">Dynamic Risk Assessments Survey.</b>
                                </p>
                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">This survey enables you to identify the interconnections, severity, likelihood and velocity between the risks in the organisation.</p>
                                <br>
                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">Your responses are highly valued and will help us understand our organization''s risk profile including systemic risks and flow on effect within the risk profile.</p>
                                <br>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 11.25pt; background:white;display:{{showMessage}} ">
                                <table style="width: 100.0%; background:#f0f0f0 none repeat scroll 0 0;" cellspacing="0" cellpadding="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td style="padding: 11.25pt; ">
                                                <p style="margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;">A message from {{clientLead_firstName}}&nbsp;{{clientLead_lastName}}</p>
                                                <p style="margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;">{{email_content}}</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: white none repeat scroll 0% 0%; float: right; padding: 0pt 11.25pt;">
                                <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" align="right" border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">
                                            <td style="background:#43b02a;padding:7.5pt;font-size: 13.5pt; height: 20.5pt; text-align:center;" width="160">
                                                <p class="MsoNormal" style="line-height: 13.5pt"> <span style="font-family:&quot;Arial&quot;,&quot;sans-serif&quot;">                                          <a href="{{url}}" style="text-decoration:none"><span style="font-size: 13.5pt;color:white;">Start Survey</span>
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
                                    <br><span style="color: rgb(68, 68, 68); font-family:Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>
                                    <br><span style="font-family:Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>
                                    <br><span style="font-family:Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>
                                </p>
                                <br>
                                <hr>
                                <p><span style="color: rgb(68, 68, 68); font-family:Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>'
select @notificationId = notificationmaster.NotificationMaster_Id from notificationmaster where NotificationMaster_Name = @NotificationMaster_Name
select @notificationcontentdetailsId = NotificationDetails_contentDetailsId from NotificationDetails where NotificationDetails_notificationid = @notificationId
select @templateId = EmailContentDetails.EmailContentDetails_TemplateId from EmailContentDetails where EmailContentDetails.EmailContentDetails_ContentDetailsId = @notificationcontentdetailsId

if @notificationId IS NULL
RAISERROR('NotificationName not found',16,1)

IF (@templateId IS NULL and  LEN(ISNULL(@LocaleTemplate_LocaleName, '')) = 0)
update EmailContentDetails set EmailContentDetails_Content = @LocaleTemplate_Content where EmailContentDetails.EmailContentDetails_ContentDetailsId = @notificationcontentdetailsId

else if LEN(ISNULL(@LocaleTemplate_LocaleName, '')) = 0
RAISERROR('LocaleName not found',16,1)

Else
update LocaleTemplate set LocaleTemplate_Content = @LocaleTemplate_Content where LocaleTemplate_templateId =  @templateId and LocaleTemplate_LocaleName=@LocaleTemplate_LocaleName




--Notification 3
set @NotificationMaster_Name='DRAParticipantTestSurvey'
set @LocaleTemplate_Content='<table width="600" style="margin: 0 auto; " cellspacing="0" cellpadding="0" border="0">    <tbody>        <tr>            <td style="background-color:#02428c" width="45">&nbsp;</td>            <td>                <table style="width: 100.0%; background:white;" cellspacing="0" cellpadding="0" border="0">                    <tbody>                        <tr>                            <td>                                <img src="https://uat-dra-web.thebiggerdata.com/dra-web/dra-app/ui/img/emailBanner.png" alt="KPMG Dynamic Risk Assessment">                            </td>                        </tr>                        <tr>                            <td style="font-family: Arial, sans-serif; font-size: 13.5pt; background-color: #666666; padding:5px;text-align: center; color: white; "><b>Review Draft Survey</b>                            </td>                        </tr>                        <tr>                            <td style="padding: 11.25pt; height: 75.0pt;background:white; border-top:0.75pt solid #ECECEC ">                                <p><span style="font-family: Arial, sans-serif; line-height: 1.42857;font-size:15pt">Hi {{firstName}},</span>                                </p>                                <p><span style="font-family:  Arial, sans-serif; line-height: 1.42857;font-size:10.5pt">We have provided you access where you can check the list of risks which we have identified with you recently.</span>                                </p>                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">Prior to publishing and circulating the survey, we encourage you to check the content of the survey in particular, the accuracy of the risk descriptions.</p>                                <br>                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">You can use the form at the end of the survey to forward any feedback. Alternatively, feel free to                                    <a style="margin-top: 7.5pt; text-decoration:none ; margin-bottom: 0; padding: 0;font-size:10.5pt" href="mailto:{{engagementManager_email}}"><span style="margin-top: 7.5pt; margin-bottom: 0; padding: 0;color: #00338D;font-size:10.5pt"><b>contact us</b></span>                                    </a>&nbsp; if you have any questions.</p>                                <br>                                <p style="margin-top: 7.5pt; margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;font-size:10.5pt">We look forward to your feedback and thank you for your time.</p>                                <br>                            </td>                        </tr>                        <tr>                            <td style="padding: 11.25pt; background:white;display:{{showMessage}} ">                                <table style="width: 100.0%; background:#f0f0f0 none repeat scroll 0 0;" cellspacing="0" cellpadding="0" border="0">                                    <tbody>                                        <tr>                                            <td style="padding: 11.25pt; ">                                                <p style="margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;">A message from {{engagementManager_firstName}}&nbsp;{{engagementManager_lastName}}</p>                                                <p style="margin-bottom: 0; padding: 0; font-family: Arial, sans-serif;">{{email_content}}</p>                                            </td>                                        </tr>                                    </tbody>                                </table>                            </td>                        </tr>                        <tr>                            <td style="background: white none repeat scroll 0% 0%; float: right; padding: 0pt 11.25pt;">                                <table class="MsoNormalTable" style="mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in" align="right" border="0" cellpadding="0" cellspacing="0">                                    <tbody>                                        <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes">                                            <td style="background:#43b02a;padding:7.5pt;font-size: 13.5pt; height: 20.5pt; text-align:center;" width="200">                                                <p class="MsoNormal" style="line-height: 13.5pt"> <span style="font-family:&quot;Arial&quot;,&quot;sans-serif&quot;">                                          <a href="{{url}}" style="text-decoration:none"><span style="font-size: 13.5pt;color:white;">Review Draft Survey</span>                                                    </a>                                                    </span>                                                </p>                                            </td>                                        </tr>                                    </tbody>                                </table>                            </td>                        </tr>                        <tr>                            <td style="padding: 0 0 0 11.25pt; line-height: inherit; background:white;">                                <p>                                    <br><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;">If you have any questions, you can contact us via:</span>                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Support:</b>&nbsp;<a href="mailto:ReadyToHelp@kpmg.com.au" style="color: #00338D;text-decoration: none;"><b>ReadyToHelp@kpmg.com.au</b></a></span>                                    <br><span style="font-family: Arial, sans-serif; font-size: 9pt;"><b>Phone:</b>&nbsp;+61 3 9838 4777</span>                                </p>                                <br>                                <hr>                                <p><span style="color: rgb(68, 68, 68); font-family: Arial, sans-serif; font-size: 9pt;"><br>© 2016 KPMG, an Australian partnership and a member firm of the KPMG network of independent member firms affiliated with KPMG International Cooperative ("KPMG International"), a Swiss entity. All rights reserved.<br>The KPMG name and logo are registered trademarks or trademarks of KPMG International.<br>Liability limited by a scheme approved under Professional Standards Legislation.</span>                                </p>                            </td>                        </tr>                    </tbody>                </table>            </td>        </tr>    </tbody></table>
'
select @notificationId = notificationmaster.NotificationMaster_Id from notificationmaster where NotificationMaster_Name = @NotificationMaster_Name
select @notificationcontentdetailsId = NotificationDetails_contentDetailsId from NotificationDetails where NotificationDetails_notificationid = @notificationId
select @templateId = EmailContentDetails.EmailContentDetails_TemplateId from EmailContentDetails where EmailContentDetails.EmailContentDetails_ContentDetailsId = @notificationcontentdetailsId

if @notificationId IS NULL
RAISERROR('NotificationName not found',16,1)

IF (@templateId IS NULL and  LEN(ISNULL(@LocaleTemplate_LocaleName, '')) = 0)
update EmailContentDetails set EmailContentDetails_Content = @LocaleTemplate_Content where EmailContentDetails.EmailContentDetails_ContentDetailsId = @notificationcontentdetailsId

else if LEN(ISNULL(@LocaleTemplate_LocaleName, '')) = 0
RAISERROR('LocaleName not found',16,1)

Else
update LocaleTemplate set LocaleTemplate_Content = @LocaleTemplate_Content where LocaleTemplate_templateId =  @templateId and LocaleTemplate_LocaleName=@LocaleTemplate_LocaleName



--rollback transaction
commit transaction