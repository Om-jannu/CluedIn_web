
--  Task 1 - selecting notif based on gender value 0 or 1 
-- Issue 1 : 
SELECT  t1.nm_title,t1.nm_message,t1.nm_image_url,t1.dateOfcreation,
        t2.user_id, t2.user_fname,t2.user_lname,t2.user_profilePic,
        t3.role_name,
        t4.label_name,
        t5.nm_id
FROM cluedin.notification_message t1,
     user_details t2, 
     role_master t3, 
     label_master t4, 
     notification_message_targetlist t5 
 WHERE  t5.nm_id = t1.nm_id 
    and t5.bsd_id = 13 
    and (t5.nm_gender = 1 or t5.nm_gender = 0)
    and t1.sender_id = t2.user_id 
    and t2.user_role_id = t3.role_id
    and t1.nm_label_id = t4.label_id
 ORDER BY t1.dateOfCreation DESC 


-- Resolution of Issue 1:
SELECT  t1.nm_id, t1.nm_title,t1.nm_message,t1.nm_image_url,t1.dateOfcreation,
		t2.user_id, t2.user_fname,t2.user_lname,t2.user_profilePic,
		t3.role_name,
		t4.label_name,
		t5.nm_id
FROM cluedin.notification_message t1,   
     user_details t2,    
     role_master t3, 
     label_master t4,
	 notification_message_targetlist t5 
 WHERE  t5.nm_id = t1.nm_id 
	and t5.bsd_id = "13" 
    and (t5.nm_gender = 1 or t5.nm_gender = 0)
    and t1.sender_id = t2.user_id 
    and t3.role_id = t2.user_role_id 
    and t4.label_id = t1.nm_label_id
ORDER BY t1.dateOfCreation DESC 

--Query for evetns 
SELECT  t1.event_id,t2.user_fname,t2.user_lname,t5.role_name,t3.sb_name, t2.user_profilePic,
		t1.event_title,t4.el_name,t1.event_desc,t1.event_image_url,t1.event_attachment_url,
        t1.event_registration_url,t1.event_fees,t1.dateOfCreation,t1.dateOfExpiration   
FROM
	events t1,   
    user_details t2,    
    student_bodies_master t3, 
    events_label_master t4,
    role_master t5 
WHERE
	t1.sender_id = t2.user_id 
    and t1.organiser_id = t3.sb_id 
    and t1.event_label_id = t4.el_id 
    and t2.user_role_id = t5.role_id
   ORDER BY t1.event_id DESC

