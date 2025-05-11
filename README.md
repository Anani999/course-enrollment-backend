# Overview
    ExpressJs Backend server for course enrollment service with features like starting course , validating text files and issueing certificates, with multiple authentication methods, and using llama3 model to validate answers, and a system where only accessing next video in the course after only completing the present video and submitting the answer based on the question for each video.
    Using Nodejs and ExpressJs framework designed this project from the scratch with maneagable folder structure like model view controller etc., and serving the startic files using express.static , 

# Features/About
    1. This backend uses NodeJs with ExpressJs Backend framwork,
    2. This project has multiple authentication methods as user can use their mobile number and email with verifying OTP's to authenticate and also their Google and Github account !, there is only sign in , no login or register. If user new user it creates a user , if already existed it continues with that 
    3. Multiple state managements and access based controll to api's. there are two middlewares to access their respective API's, One is the authenticated user to access his courses and certificates and completing courses and starting new courses, secondly the admin user where he can edit the courses and add, delete videos from courses 
    4.with complex logic like user cannot start or access other courses when already started a course and after the last video in a course was completed it automatically gives a basic certificate, 
    5. created and devided each service API's accordingly, like for auth, user, courses, certificates, etc., 

# Tech Stack Used 
    1. ExpressJS - Framework used for building all the backend
    2. Nodejs - Environment for running javascript and using node package manager to install different packages as part of the development 
    3. MongoDB - used mongoose which is mongodb object modeling for nodejs to create models and save data and manupulate it 

