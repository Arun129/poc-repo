
declare @Template_Id uniqueidentifier=NEWID()

declare @NotificationMaster_Name nvarchar(200)='DRAServiceContactUs'
declare @Template_Name nvarchar(200)=@NotificationMaster_Name+ 'Template'

declare @LocaleTemplate_Content nvarchar(max)=N'<p>Name : {{contactUsName}}</p><p>Email Id : {{contactUsEmailId}}</p><p>Company Name : {{contactUsCompanyName}}</p><p></p><p></p><p><span style="line-height: 1.42857;">Phone No : {{contactUsPhoneNo}}</span><br></p><p>Comments : {{contactUsComments}}</p>'



Insert into Template (Template_Id, Template_TenantId, Template_Name, Template_Description, Template_Content, Template_CreatedBy, Template_CreatedOn, Template_UpdatedBy, Template_UpdatedOn, Template_Status, Template_Category) OUTPUT Inserted.Template_Id values (@Template_Id, 'b590cd25-3093-df11-8deb-001ec9dab123', @Template_Name, @Template_Name, NULL, '3398f837-b988-4708-999d-d3dfe11875b3', Getdate(), NULL, NULL, 1, 'NotificationTemplate')

Insert into LocaleTemplate (LocaleTemplate_TemplateId, LocaleTemplate_LocaleName, LocaleTemplate_Content, LocaleTemplate_LocaleId, LocaleTemplate_CreatedBy, LocaleTemplate_CreatedOn, LocaleTemplate_Status)  OUTPUT Inserted.LocaleTemplate_Id values (@Template_Id, 'en', @LocaleTemplate_Content, 'a1d85bdf-986a-427d-961f-6ff7df839c53','3398f837-b988-4708-999d-d3dfe11875b3', Getdate(), 1)

Update EmailContentDetails set EmailContentDetails_TemplateId = @Template_Id where EmailContentDetails_ContentDetailsId = 
(select NotificationDetails_ContentDetailsId from NotificationDetails where NotificationDetails_NotificationId in 
(select NotificationMaster_Id from NotificationMaster where NotificationMaster_Name = @NotificationMaster_Name) and NotificationDetails_TenantId is NULL)


