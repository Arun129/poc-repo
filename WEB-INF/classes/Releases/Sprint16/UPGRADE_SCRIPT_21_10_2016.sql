ALTER TABLE engagement ADD createddatetime DATETIME DEFAULT sysdatetime(); 

UPDATE engagement SET createddatetime = CONVERT(DATETIME, createddate, 105) 

ALTER TABLE engagement DROP COLUMN createddate