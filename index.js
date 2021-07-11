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
        message = messages.topic+'\n'
        stickerId = messages.stickerId
        stickerPackageId = messages.stickerPackageId
        token = messages.token
        for(let i=0; i< messages.message.length; i++){
          message+=messages.message[i]+'\n'
        }
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
        // res.json({
        //   httpResponse: httpResponse,
        //   body: body
        // });
      }
    });

  });
app.listen(8080, () => {
  console.log('Application is running on port 8003')
})

