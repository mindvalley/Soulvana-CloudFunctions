import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

admin.initializeApp()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


//user Functions

export const isWhiteListed = functions.https.onRequest((request, response) => {
  
  let userMail:String = request.body.userMail;
    const re = /\./gi;
    userMail = userMail.replace(re,"|")
    admin.database().ref("whiteList/users/"+userMail+"/expiryDate")
     .once('value', (snapshot) => {
        const event = snapshot.val();
            const expireyDate=event
            const now = new Date().getTime();
              const isWhiteLiseted = expireyDate >= now;
        
               response.send(isWhiteLiseted);
     }).catch(err => console.log(err))
     .then(() => console.log('this will succeed'))
     .catch(err => console.log(err))
     ;
   });
   export const isWhiteListedV2 = functions.https.onRequest((request, response) => {
  
    let userMail:String = request.body.userMail;
    const re = /\./gi;
      userMail = userMail.replace(re,"|")
      let isWhiteLiseted:Boolean
      admin.database().ref("whiteList/users/"+userMail+"/expiryDate")
       .once('value', (userSnapShot) => {
          const event = userSnapShot.val();
              let expireyDate=event
              const now = new Date().getTime();
                   isWhiteLiseted = expireyDate >= now;
             if(!isWhiteLiseted){
               admin.database().ref("whiteList/domains"+userMail.split("@")[1]).once('value', (domainSnapShot)=>{
                  expireyDate = domainSnapShot.val().expireyDate 
                      isWhiteLiseted =((expireyDate >= now)||isWhiteLiseted);
                      if(isWhiteLiseted){
                      admin.database().ref("whiteList/domains"+userMail.split("@")[1]+"/users").once('value', (usersSnapShot)=>{
                      if(usersSnapShot.hasChild(userMail.toString())){
                        isWhiteLiseted =(true&&isWhiteLiseted);
                        response.send(isWhiteLiseted)
                      }else{
                        response.send(false)
                      }

                    
               }).catch(err => console.log(err))
               .then(() => console.log('this will succeed'))
               .catch(err => console.log(err))
              }else{
                response.send(false)
               }
             }).catch(err => console.log(err))
             .then(() => console.log('this will succeed'))
             .catch(err => console.log(err))
                   response.send(isWhiteLiseted);}else{
                    response.send(false)
                   }
       }).catch(err => console.log(err))
       .then(() => console.log('this will succeed'))
       .catch(err => console.log(err))
       ;
     });
     
   export const addWhiteListedUser = functions.https.onRequest((request, response) => {
    let userMail:String = request.body.userMail;
    const expirey_date:String = request.body.expirey_date;
    const expireyDateArray:string[] = expirey_date.split("/")
    const re = /\./gi;
    userMail = userMail.replace(re,"|")
    const expireTimeStamp=new Date(parseInt(expireyDateArray[0]),parseInt(expireyDateArray[1])-1,parseInt(expireyDateArray[2])).getTime()
    console.log(userMail)
    admin.database().ref("whiteList/users/"+userMail).set({
       
        expiryDate:expireTimeStamp} 
   ).catch(err => console.log(err))
     .then(() => console.log('this will succeed'))
     .catch(err => console.log(err));
     response.sendStatus(200);

   }
   );

//Domain Functions


   export const addWhiteListedDomain = functions.https.onRequest((request, response) => {
    let domain:string = request.query.domain;
    const expiryDate:string = request.query.expirey_date;
    const userLimit:string = request.query.user_limit;
    const expireyDateArray:string[] = expiryDate.split("/")
    const re = /\./gi;
    domain = domain.replace(re,"|")
    const expireTimeStamp=new Date(parseInt(expireyDateArray[0]),parseInt(expireyDateArray[1])-1,parseInt(expireyDateArray[2])).getTime()
    admin.database().ref("whiteList/domains"+domain).set({
       
      expiryDate:expireTimeStamp,
      userLimit:userLimit} 
   ).catch(err => console.log(err))
     .then(() => console.log('this will succeed'))
     .catch(err => console.log(err));
     response.sendStatus(200);

   }
   );

   export const addWhiteListedUserToDomain = functions.https.onRequest((request, response) => {
    let emailAddress:string = request.query.email;
    const domain:string = request.query.domain;
    let re = /\./gi;
    emailAddress = emailAddress.replace(re,"|")
    admin.database().ref("whiteList/domains/"+domain+"/users/"+emailAddress)
    .set({
      
      addDate:new Date().getTime(),
      } 
   ).catch(err => console.log(err))
     .then(() => console.log('this will succeed'))
     .catch(err => console.log(err));
     response.sendStatus(200);

   }
   );
   export const isWhiteListedDomainUser = functions.https.onRequest((request, response) => {
    let domain:string = request.query.domain;
    let email:string = request.query.email;

    const re = /\./gi;
    email = email.replace(re,"|")
    domain = domain.replace(re,"|")
    admin.database().ref("whiteList/domains/"+domain+"/expiryDate")
     .once('value', (snapshot) => {
        const event = snapshot.val();
            const expireyDate=event
            const now = new Date().getTime();
                const isWhiteLiseted = expireyDate >= now;
          if(isWhiteLiseted){
                response.send(isWhiteLiseted);
     }else{
      response.send(isWhiteLiseted);
     }}).catch(err => console.log(err))
     .then(() => console.log('this will succeed'))
     .catch(err => console.log(err))
     ;
   });
 
  
   
