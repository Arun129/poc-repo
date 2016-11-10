-- -----------------------------------------------------
-- Table `organisation`
-- -----------------------------------------------------
CREATE TABLE organisation (
  orgid varchar(36) NOT NULL,
  orgName varchar(200) NOT NULL,
  PRIMARY KEY (orgid)

);

CREATE TABLE engagement (
 
  taskId varchar(36) NOT NULL,
  clientId varchar(36) NOT NULL,
  engagementManagerName varchar(100) NOT NULL,
  engagementId varchar(45) NOT NULL,
  workshopFacilitorName varchar(100) NOT NULL,
  engagementDescription varchar(4000) NOT NULL,
  keySponsor varchar(100) NOT NULL,
  sentinelApprovalNumber varchar(45) NOT NULL,
  clientLeadEmail varchar(100) NOT NULL,
  clientLeadId varchar(36) NOT NULL,
  projectManager varchar(100) NOT NULL,
  platinumAccount bit DEFAULT NULL,
  engagementPartner varchar(100) NOT NULL,
  secRegistrant bit DEFAULT NULL,
  createdDate varchar(15) NOT NULL,
  bpmTaskId varchar(45) DEFAULT NULL,
  createdby varchar(100) DEFAULT NULL,
  engagementmanagersurname varchar(100) NULL,
  workshopfacilitorsurname varchar(100) NULL,
  clientsurname varchar(100) NULL,
  clientfirstname varchar(100) NULL,
  projectmanagersurname varchar(100) NULL,
  engagementpartnersurname varchar(100) NULL,
  PRIMARY KEY (taskId),
  UNIQUE (engagementId), FOREIGN KEY (clientId )
    REFERENCES organisation (orgid )
    ON DELETE CASCADE

);

CREATE INDEX clientId ON engagement (clientId );

-- -----------------------------------------------------
-- Table `quantifiedmodel`
-- -----------------------------------------------------
CREATE  TABLE quantifiedmodel (
  quantifiedmodelid VARCHAR(36) NOT NULL ,
  riskmodelid VARCHAR(36) NOT NULL ,
  measurementsetid VARCHAR(36) NOT NULL ,
  PRIMARY KEY (quantifiedmodelid) ,
  CONSTRAINT rmid_UNIQUE UNIQUE  (riskmodelid ) ,
  CONSTRAINT msid_UNIQUE UNIQUE  (measurementsetid ) )
;

-- -----------------------------------------------------
-- Table `orgrisk`
-- -----------------------------------------------------
CREATE  TABLE orgrisk (
  orgriskid VARCHAR(36) NOT NULL ,
  orgid VARCHAR(36) NOT NULL ,
  name VARCHAR(45) ,
  description VARCHAR(200) ,
  highlight varchar(10) ,
  PRIMARY KEY (orgriskid) ,
  CONSTRAINT orgriskid UNIQUE  (orgriskid, name )
  ,
  CONSTRAINT orgrisk_ibfk_1
    FOREIGN KEY (orgid )
    REFERENCES organisation (orgid )
    ON DELETE CASCADE)
;

CREATE INDEX orgid ON orgrisk (orgid );

-- -----------------------------------------------------
-- Table `metric`
-- -----------------------------------------------------
CREATE  TABLE metric (
  metricid VARCHAR(36) NOT NULL ,
  name VARCHAR(45) NOT NULL ,
  mtype VARCHAR(45),
  lowMarker FLOAT ,
  highMarker FLOAT ,
  PRIMARY KEY (metricid) ,
  CONSTRAINT name_UNIQUE UNIQUE  (name ) )
;

-- -----------------------------------------------------
-- Table `measurement`
-- -----------------------------------------------------
CREATE  TABLE measurement (
  measurementid VARCHAR(36) NOT NULL ,
  measurementsetid VARCHAR(36) NOT NULL ,
  measurementriskid VARCHAR(36) NOT NULL ,
  measurementmetricid VARCHAR(36) NOT NULL ,
    magnitude numeric(7,5) NOT NULL default 0,
  subject VARCHAR(45) NULL ,
  PRIMARY KEY (measurementid)
  ,
  CONSTRAINT measurementsetid
    FOREIGN KEY (measurementsetid )
    REFERENCES quantifiedmodel (measurementsetid )
    ON DELETE CASCADE,
  CONSTRAINT measurementriskid
    FOREIGN KEY (measurementriskid )
    REFERENCES orgrisk (orgriskid )
    ON DELETE CASCADE,
  CONSTRAINT measurementmetricid
    FOREIGN KEY (measurementmetricid )
    REFERENCES metric (metricid )
    ON DELETE CASCADE)
;

CREATE INDEX measurementriskid ON measurement (measurementriskid );
CREATE INDEX meMid_idx ON measurement (measurementsetid );
CREATE INDEX msmeid_idx ON measurement (measurementmetricid );


-- -----------------------------------------------------
-- Table `survey`
-- -----------------------------------------------------
CREATE  TABLE survey (
  surveyid VARCHAR(36) NOT NULL ,
  surveyEngagementid VARCHAR(36) NOT NULL ,
  aggregatemodel VARCHAR(36) ,
  basemodel VARCHAR(36)  ,
  country VARCHAR(45) ,
  region VARCHAR(45) ,
  industry VARCHAR(45) ,
  businessUnit VARCHAR(45) ,
    noOfRespondent numeric(11) ,
  riskListSignedOff bit ,
  severityScale1 VARCHAR(45) ,
  severityScale2 VARCHAR(45) ,
  severityScale3 VARCHAR(45) ,
  severityScale4 VARCHAR(45) ,
  severityScale5 VARCHAR(45) ,
  likelihoodScale1 VARCHAR(45) ,
  likelihoodScale2 VARCHAR(45) ,
  likelihoodScale3 VARCHAR(45) ,
  likelihoodScale4 VARCHAR(45) ,
  likelihoodScale5 VARCHAR(45) ,
  velocityScale1 VARCHAR(45) ,
  velocityScale2 VARCHAR(45) ,
  velocityScale3 VARCHAR(45) ,
  velocityScale4 VARCHAR(45) ,
  velocityScale5 VARCHAR(45) ,
  published bit DEFAULT 0,
  closed bit DEFAULT 0,
  emailNote VARCHAR(45) NULL ,
  PRIMARY KEY (surveyid) ,
  CONSTRAINT sdEid_UNIQUE UNIQUE  (surveyEngagementid )
  ,
  CONSTRAINT survey_ibfk_1
    FOREIGN KEY (surveyEngagementid )
    REFERENCES engagement (taskid )
    ON DELETE CASCADE,
  CONSTRAINT survey_ibfk_2
    FOREIGN KEY (aggregatemodel )
    REFERENCES quantifiedmodel (quantifiedmodelid )
    ON DELETE CASCADE,
  CONSTRAINT survey_ibfk_3
    FOREIGN KEY (basemodel )
    REFERENCES quantifiedmodel (quantifiedmodelid )
    ON DELETE NO ACTION)
;

CREATE INDEX surveyEngagementid ON survey (surveyEngagementid );
CREATE INDEX survey_ibfk_2_idx ON survey (aggregatemodel );
CREATE INDEX survey_ibfk_3_idx ON survey (basemodel );

CREATE TABLE opdate
(
  opdateid INT NOT NULL IDENTITY (1,1), 
  opdatesurveyid varchar(36) NOT NULL,
  kickoffmeetingwithclientlead varchar(100),
  kickoffmeetingwithgce varchar(100),
  planningmeetingforworkshops varchar(100),
  commencementofsurveyprocess varchar(100),
  closerofsurveyprocess varchar(100),
  expectedfirstdraft varchar(100),
  discussionoffirstdraft varchar(100),
  finalworkshop varchar(100),
  interviewMeetingWithParticipants varchar(500),
  workshops varchar(500),
  finalreportdelivery varchar(100),
  CONSTRAINT opdate_pkey PRIMARY KEY (opdateid),
  CONSTRAINT opdate_ibfk_1 FOREIGN KEY (opdatesurveyid)
    REFERENCES survey (surveyid)
    ON DELETE CASCADE );

CREATE  TABLE survey_report (
  reportid VARCHAR(36) NOT NULL ,
  reportsurveyid VARCHAR(36) NOT NULL ,
  name VARCHAR(100)  ,
  nbr_respondents int,
  status VARCHAR(10),
  file_format VARCHAR(4)  ,
  file_content varbinary(max) NOT NULL,
  requested_by VARCHAR(36),
  created_tmstmp TIMESTAMP,
  
  PRIMARY KEY (reportid),
  CONSTRAINT report_ibfk_1
    FOREIGN KEY (reportsurveyid )
    REFERENCES survey (surveyid )
    ON DELETE CASCADE
);



--------
-- -----------------------------------------------------
-- Table `participant`
-- -----------------------------------------------------
CREATE  TABLE participant (
  participantid VARCHAR(36) NOT NULL ,
  participantsurveyid VARCHAR(36) NOT NULL ,
  usermodel VARCHAR(36) NOT NULL ,
  emailId VARCHAR(100) NOT NULL,
  name VARCHAR(100)  ,
  lname VARCHAR(100)  ,
    status varchar(15),
  acceptTerms bit , 
  svgGraphSaved bit default 0,
  velocityGraphSaved bit default 0,
  sentDate date default sysdatetime(),
  PRIMARY KEY (participantid)
  ,
  CONSTRAINT participant_ibfk_1
    FOREIGN KEY (participantsurveyid )
    REFERENCES survey (surveyid )
    ON DELETE CASCADE,
  CONSTRAINT participant_ibfk_2
    FOREIGN KEY (usermodel )
    REFERENCES quantifiedmodel (quantifiedmodelid )
    ON DELETE NO ACTION)
;

CREATE INDEX participantsurveyid ON participant (participantsurveyid );
CREATE INDEX participant_ibfk_2_idx ON participant (usermodel );



-- -----------------------------------------------------
-- Table `risk`
-- -----------------------------------------------------
CREATE  TABLE risk (
  riskid VARCHAR(36) NOT NULL ,
  riskmodelid VARCHAR(36) NOT NULL ,
  highlight varchar(10) ,
  isConnected bit  NOT NULL DEFAULT 0 ,
  isPlotted bit  NOT NULL DEFAULT 0 ,
  isRated bit  NOT NULL DEFAULT 0 ,
  PRIMARY KEY (riskid, riskmodelid)
  ,
  CONSTRAINT risk_ibfk_1
    FOREIGN KEY (riskid )
    REFERENCES orgrisk (orgriskid )
    ON DELETE CASCADE,
  CONSTRAINT risk_ibfk_2
    FOREIGN KEY (riskmodelid )
    REFERENCES quantifiedmodel (riskmodelid )
    ON DELETE CASCADE)
;

CREATE INDEX risk_ibfk_1_idx ON risk (riskid );
CREATE INDEX risk_ibfk_2_idx ON risk (riskmodelid );


-- -----------------------------------------------------
-- Table `risklink`
-- -----------------------------------------------------
CREATE  TABLE risklink (
  risklinkid VARCHAR(36) NOT NULL ,
  risklinkriskmodelid VARCHAR(36) NOT NULL ,
  risklinksourceriskid VARCHAR(36) NOT NULL ,
  risklinkdestriskid VARCHAR(36) NOT NULL ,
  weightage FLOAT NOT NULL DEFAULT '1' ,
  PRIMARY KEY (risklinkid)
  ,
  CONSTRAINT risklinkriskmodelid
    FOREIGN KEY (risklinkriskmodelid )
    REFERENCES quantifiedmodel (riskmodelid )
    ON DELETE CASCADE,
  CONSTRAINT risklinksourceriskid
    FOREIGN KEY (risklinksourceriskid )
    REFERENCES orgrisk (orgriskid )
    ON DELETE CASCADE,
  CONSTRAINT risklinkdestriskid
    FOREIGN KEY (risklinkdestriskid )
    REFERENCES orgrisk (orgriskid )
    ON DELETE NO ACTION)
;

CREATE INDEX risklinksourceriskid ON risklink (risklinksourceriskid );
CREATE INDEX risklinkdestriskid ON risklink (risklinkdestriskid );
CREATE INDEX rlrmid_idx ON risklink (risklinkriskmodelid );


-- -----------------------------------------------------
-- Table `measurementset`
-- -----------------------------------------------------
CREATE  TABLE measurementset (
  measurementsetid VARCHAR(36) NOT NULL ,
  measurementsetmetricid VARCHAR(36) NOT NULL ,
  PRIMARY KEY (measurementsetid,measurementsetmetricid)
  ,
  CONSTRAINT meqmid0
    FOREIGN KEY (measurementsetid )
    REFERENCES quantifiedmodel (measurementsetid )
    ON DELETE CASCADE,
  CONSTRAINT memid0
    FOREIGN KEY (measurementsetmetricid )
    REFERENCES metric (metricid )
    ON DELETE CASCADE)
;

CREATE INDEX msqMid_idx ON measurementset (measurementsetid );
CREATE INDEX msmid_idx ON measurementset (measurementsetmetricid );

CREATE TABLE feedback(
  feedbackid varchar(36) NOT NULL,
  feedbacksurveyid varchar(36) NOT NULL,
  emailId VARCHAR(100) ,
  name VARCHAR(100) NOT NULL ,
  lname VARCHAR(100) ,
  answer VARCHAR(1000) ,
  comments VARCHAR(8000) ,
  ftime datetime2 default getdate(),
  PRIMARY KEY (feedbackid) ,
    FOREIGN KEY (feedbacksurveyid )
    REFERENCES survey (surveyid )
    ON DELETE CASCADE
);
