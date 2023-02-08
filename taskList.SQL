
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


