const express = require('express')
const request = require('request')
const app = express()
app.use(express.json());



app.post('/line-notify', function(req, res, next) {
    var token = ''
    var message = ''
    var stickerPackageId = ''
    var stickerId = ''
    var imageFile =''
    var messages=''
    var message=''
    var sendMessage = false
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    request({
      method: 'POST',
      url: 'https://us-central1-fir-api-514b9.cloudfunctions.net/api/getdocument',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        "collection":"notify","criteria":"where","where":{"key":"statusCode","value":"active","operator":"=="},"orderby":false,"order":{"key":"date","value":"desc"}
        // collection:"notify",criteria:"where",where:{key:"statusCode",value:"active",operator:"=="},orderby:false,order:{key:"date",value:"desc"}
      },
      json:true
    }, (err, httpResponse, body) => {
      // console.log(body[0])
      messages = body[0]
      if(err){
        console.log(err);
      } else {
        // message = messages.topic+'\n'
        stickerId = messages.stickerId
        stickerPackageId = messages.stickerPackageId
        token = messages.token
        var day = new Date();
        for(let i=0; i< messages.messageList.length; i++){
          if(!messages.messageList[i].send){
            break;
          }
          sendMessage = true
          if(messages.messageList[i].day==day.getDay()){
            message = messages.messageList[i].topic+' '+day.getDate()+' '+months[day.getMonth()]+' '+day.getFullYear()+' '+messages.messageList[i].time+' น.\n'
            for(let m=0; m<messages.messageList[i].messages.length; m++){
              if(messages.messageList[i].messages[m].status=='active'){
                message+=messages.messageList[i].messages[m].message+'\n'
              }
            }           
          }          
        }
        if(sendMessage){
          request({
            method: 'POST',
            uri: 'https://notify-api.line.me/api/notify',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
              'bearer': token
            },
            form: {
              message: message,
              stickerPackageId: stickerPackageId,
              stickerId: stickerId,
              imageFile: imageFile
            }
          }, (err, httpResponse, body) => {
            if(err){
              console.log(err);
            } else {
              res.json({
                httpResponse: httpResponse,
                body: body
              });
            }
          });
        }else{
          res.json({
            httpResponse: httpResponse,
            body: body
          });
        }
 
        // res.json({
        //   httpResponse: httpResponse,
        //   body: body
        // });
      }
    });

  });
app.listen(8080, () => {
  console.log('Application is running on port 8081')
})

