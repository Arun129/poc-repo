ALTER TABLE orgrisk
ALTER COLUMN description varchar(350);
ALTER TABLE orgrisk
ALTER COLUMN name varchar(100);

DECLARE @theSendDate varchar(60);
SET @theSendDate = (SELECT name FROM sysobjects WHERE xtype = 'D' AND name LIKE '%sentD%')
EXEC('ALTER TABLE participant DROP CONSTRAINT ' + @theSendDate)
ALTER TABLE participant Alter column sentDate datetime;
ALTER TABLE participant ADD DEFAULT (sysdatetime()) FOR sentDate;

ALTER TABLE engagement ADD process_report bit DEFAULT 0;

DROP TABLE survey_report;
CREATE  TABLE survey_report (
  reportid VARCHAR(36) NOT NULL ,
  reportsurveyid VARCHAR(36) NOT NULL ,
  name VARCHAR(100)  ,
  nbr_respondents int,
  status VARCHAR(10),
  file_format VARCHAR(4)  ,
  file_content varbinary(max) NULL,
  requested_by VARCHAR(36),
  created_time DATETIME DEFAULT GETDATE(),
  
  PRIMARY KEY (reportid),
  CONSTRAINT report_ibfk_1
    FOREIGN KEY (reportsurveyid )
    REFERENCES survey (surveyid )
    ON DELETE CASCADE
);