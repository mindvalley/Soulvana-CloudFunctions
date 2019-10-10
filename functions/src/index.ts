import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

admin.initializeApp()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


// ================================================================
//
//                          TO BE REMOVED
//
// ================================================================

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

export const addWhiteListedUser = functions.https.onRequest((request, response) => {
  let userMail:String = request.body.userMail;
  const expirey_date:String = request.body.expirey_date;
  const expireyDateArray:string[] = expirey_date.split("/")
  const re = /\./gi;
  userMail = userMail.replace(re,"|")
  const expireTimeStamp=new Date(parseInt(expireyDateArray[0]),parseInt(expireyDateArray[1])-1,parseInt(expireyDateArray[2])).getTime()
  console.log(userMail)
  admin.database().ref("whiteList/users/"+userMail).set({
    expiryDate:expireTimeStamp
  } 
 ).catch(err => console.log(err))
   .then(() => console.log('this will succeed'))
   .catch(err => console.log(err));
   response.sendStatus(200);

 }
 );

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
  const re = /\./gi;
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

// ================================================================
//
//         USER ACCESS CHECK (STAND ALONE - DOMAIN - FAMILY)
//
// ================================================================

// Function isWhiteListedV2
// Returns if the user has Soulvana Premium access and his remain time still active
// The user access can be:
//    * basic - stand alone user
//    * domain - domain users (companies)
//    * family - family user
export const isWhiteListedV2 = functions.https.onRequest((request, response) => {
  
  let userMail: String = request.body.userMail;
  let accessType: String;
  const now = new Date().getTime();

  // replace all dots in email to "|"
  const dot = /\./gi;
  userMail = userMail.replace(dot,"|")
      
  // verify for user single and family access
  admin.database().ref("whiteList/users/"+userMail)
  .once('value').then(function(userSnapShot) {

    let expiryDate = userSnapShot.child("expiryDate").val();
    const familyOwner = userSnapShot.child("familyOwner").val();
    
    if (familyOwner === null) {
      accessType = "basic";

      if (expiryDate >= now) {
        response.send({
          data: {
            userMail: userMail.replace("|","."),
            hasAccess: true,
            accessType: accessType,
            familyOwner: null,
            familyMembers: null,
            expiryDate: expiryDate,
            expiryDateLiteral: new Date(expiryDate)
          }
        });
        return;
      }
    } else {
      accessType = "family";

      if (expiryDate >= now) {
        admin.database().ref("whiteList/family/"+familyOwner)
        .once('value').then(function(familySnapShot) {

          const familyMembers = familySnapShot.child("familyMembers").val();
          const userMails: string[] = []
          const usersInfo: any[] = []
        
          for(const email in familyMembers) {
            userMails.push(email);
          }

          userMails.forEach(function (mail) {

            if (familySnapShot.child("familyMembers/"+mail+"/userFirstEnter").val() == null && mail == userMail) {

              admin.database().ref("whiteList/family/"+familyOwner+"/familyMembers/"+mail).update({
                userFirstEnter:now
              }).catch(err => console.log(err));

              usersInfo.push({
                email: mail.replace("|","."),
                addDate: familySnapShot.child("familyMembers/"+mail+"/addDate").val(),
                userFirstEnter: now,
              });

            } else {
              usersInfo.push({
                email: mail.replace("|","."),
                addDate: familySnapShot.child("familyMembers/"+mail+"/addDate").val(),
                userFirstEnter: familySnapShot.child("familyMembers/"+mail+"/userFirstEnter").val(),
              });
            }
            
          });
          
          response.send({
            data: {
              userMail: userMail.replace("|","."),
              hasAccess: true,
              accessType: accessType,
              familyOwner: familyOwner.replace("|","."),
              familyMembers: usersInfo,
              expiryDate: expiryDate,
              expiryDateLiteral: new Date(expiryDate)
            }
          });
        }).catch(err => console.log(err));
        return;
      }
    } 

    // verify for user domain
    const userDomain = userMail.split("@").pop();

    admin.database().ref("whiteList/domains/" + userDomain)
    .once('value').then(function(domainSnapshot) {
      expiryDate = domainSnapshot.child("expiryDate").val();
      const currentUserCount = domainSnapshot.child("users").numChildren();
      const maxUserCount = domainSnapshot.child("userLimit").val();
      let existentUser: Boolean = domainSnapshot.hasChild("users/" + userMail);

      if (expiryDate >= now) {
        if (existentUser === false && currentUserCount < maxUserCount) {
          // the user is not registered yet, so add him first
          admin.database().ref("whiteList/domains/" + userDomain + "/users/" + userMail).update({
            addDate:now
          }).catch(err => console.log(err));
          existentUser = true;
        }

        if (existentUser === true) {
          accessType = "domain";

          response.send({
            data: {
              userMail: userMail.replace("|","."),
              hasAccess: true,
              accessType: accessType,
              familyOwner: null,
              familyMembers: null,
              expiryDate: expiryDate,
              expiryDateLiteral: new Date(expiryDate)
            }
          });
          return;
        }
      }
      response.send({
        data: {
          userMail: userMail.replace("|","."),
          hasAccess: false,
          accessType: null,
          familyOwner: null,
          familyMembers: null,
          expiryDate: null,
          expiryDateLiteral: new Date(expiryDate)
        }
      });
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));

});
   
// ================================================================
//
//             ADD ACCESS (STAND ALONE - DOMAIN - FAMILY)
//
// ================================================================

export const addWhiteList = functions.https.onRequest((request, response) => {
  
  const accessType: string = request.body.accessType; // basic, family, domain

  switch (accessType) {
    case "basic": {
      
      if (request.body.userMail == null || (request.body.expiryDate == null && request.body.addDays == null)) {
        response.sendStatus(400)
        return;
      }

      const userMailsString: string = request.body.userMail;
      const re = /\./gi;
      const userMails: string[] = userMailsString.replace(re,"|").replace(/\s/g, "").split(",");
      
      userMails.forEach(function (userMail) {
        
        if (request.body.expiryDate != null) {
          const expiryDateFromRequest: string = request.body.expiryDate
          const expiryDateFromRequestArray: string[] = expiryDateFromRequest.split("/")
          const expiryDate = new Date(parseInt(expiryDateFromRequestArray[2]),parseInt(expiryDateFromRequestArray[1]) - 1,parseInt(expiryDateFromRequestArray[0])).getTime()
  
          admin.database().ref("whiteList/users/"+userMail).update({ 
            expiryDate: expiryDate + 86391360
          }).catch(err => console.log(err));
          response.sendStatus(200);
        } else {
          admin.database().ref("whiteList/users/"+userMail)
          .once('value').then(function(userSnapShot) {
            
            let expiryDate = userSnapShot.child("expiryDate").val();
            
            const addDays = request.body.addDays
            
            if (expiryDate == null) {
              expiryDate = new Date().getTime();
            }
  
            expiryDate += (86400000 * addDays);
            
            admin.database().ref("whiteList/users/"+userMail).update({ 
              expiryDate: expiryDate 
            }).catch(err => console.log(err));
            response.sendStatus(200);
          }).catch(err => console.log(err));
        }
      });

      break;
    }
    case "family": {

      if (request.body.expiryDate == null || request.body.familyOwner == null) {
        response.sendStatus(400)
        return;
      }

      let familyOwner: string = request.body.familyOwner;
      const userMailsString: string = request.body.userMail;
      const re = /\./gi;
      familyOwner = familyOwner.replace(re,"|")

      let userMails: string[] = []
      if (request.body.userMail == null || request.body.userMail == "") {
        userMails = userMailsString.replace(re,"|").replace(/\s/g, "").split(",");
      }
      
      userMails.push(familyOwner);

      const expiryDateFromRequest: string = request.body.expiryDate
      const expiryDateFromRequestArray: string[] = expiryDateFromRequest.split("/")
      const expiryDate = new Date(parseInt(expiryDateFromRequestArray[2]),parseInt(expiryDateFromRequestArray[1]) - 1,parseInt(expiryDateFromRequestArray[0])).getTime() + 86391360

      if (userMails.length > 6) {
        response.sendStatus(400)
        return;
      }

      admin.database().ref("whiteList/family/"+familyOwner)
      .once('value').then(function(userSnapShot) {

        const currentMails: string[] = [];
        const users = userSnapShot.child("familyMembers").val();
        
        for(const email in users) {
          currentMails.push(email);
        }

        currentMails.forEach(function (currentMail) {
          if (userMails.indexOf(currentMail) < 0) {
            admin.database().ref("whiteList/family/"+familyOwner+"/familyMembers/"+currentMail).remove()
            .catch(err => console.log(err));
            admin.database().ref("whiteList/users/"+currentMail).remove()
            .catch(err => console.log(err));
          }
        })

        userMails.forEach(function (userMail) {
          admin.database().ref("whiteList/users/"+userMail).update({ 
            expiryDate: expiryDate,
            familyOwner: familyOwner
          }).catch(err => console.log(err));
          if (currentMails.indexOf(userMail) < 0) {
            admin.database().ref("whiteList/family/"+familyOwner+"/familyMembers/"+userMail).update({ 
              addDate: new Date().getTime()
            }).catch(err => console.log(err));
          }
        })

        response.sendStatus(200)
        
      }).catch(err => console.log(err));

      break;
    }
    case "domain": {
      break;
    }
    default: {
      break;
    }
  }


});

   
 
  // Update Family Plan
   
