const express = require('express')
const request = require('request')
const axios = require('axios')
const app = express()
const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
app.use(express.json());

async function getRegister(){
  let date = new Date()
  let registerDate = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
  var message=date.getDate()+' '+months[date.getMonth()]+' '+date.getFullYear()+'\n'
  try{
    const resps = await axios.get('http://localhost:8080/payment-viewlog/services/EMS/CountLotEMS')
    if(resps.data.success){
      message+='เลข EMS คงเหลือ: '+resps.data.data.totalLotEms+' เลข\n'
    }

    message+='\nข้อมูลรับชำระ Rama App\n'
    let param={"registerDate":registerDate}
    const resp = await axios.post('http://localhost:8080/payment-viewlog/services/Payment/SearchRegisterPayment',param)
    if(resp.data.success){
      for(let i=0; i<resp.data.data.length; i++){
        message+=resp.data.data[i].data+' ราย\n'
      }
    }
    return message
  }catch(err){
    console.error(err)
  }
  //  const response = await request({
  //   method: 'POST',
  //   uri: 'http://localhost:8080/payment-viewlog/services/Payment/SearchRegisterPayment',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: {
  //     "registerDate":"2021-08-01"
  //   },
  //   json:true
  // }, (err, httpResponse, body) => {
  //   if(err){
  //     console.log(err);
  //   } else {
  //     if(body.success){
  //       for(var i=0; i<body.data.length; i++){
  //         message+=body.data[i].data+"\n"
  //       }
  //     }

  //     res.json({
  //       body: body
  //     });
  //   }    
}

async function getLotEMS(req, res){
   request({
    method: 'POST',
    uri: 'http://localhost:8080/payment-viewlog/services/EMS/CountLotEMS',
    // headers: {
    //   'Content-Type': 'application/json'
    // }
  }, (err, httpResponse, body) => {
    if(err){
      console.log(err);
    } else {
      // res.json({
      //   body: body
      // });
      console.log(body)
      if(body.success){
        message += body.data.totalLotEms+"\n"
        console.log('test '+message)       
      }
    }
  });
}
app.post('/billing/notify', function(req, res, next){
 
  // getLotEMS(req, res)
  getRegister().then((msg) =>{
    if(msg!=''){
      request({
        method: 'POST',
        uri: 'https://notify-api.line.me/api/notify',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          'bearer': 'iRcMeP7LLrCzfREnmSVAitas2j5plob4NvQrGPiVILM'
        },
        form: {
          message: msg,
          // stickerPackageId: stickerPackageId,
          // stickerId: stickerId,
          // imageFile: imageFile
        }
      }, (err, httpResponse, body) => {
        if(err){
          console.log(err);
        } else {
          res.json({
            body: 'success'
          });
        }
      });
    }else{
      res.json({
        httpResponse: httpResponse,
        body: body
      });
    }
  })
})

app.post('/line-notify', function(req, res, next) {
    var token = ''
    var message = ''
    var stickerPackageId = ''
    var stickerId = ''
    var imageFile =''
    var messages=''
    var message=''
    var sendMessage = false
    // const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    request({
      method: 'POST',
      url: 'https://us-central1-fir-api-514b9.cloudfunctions.net/api/getdocument',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        "collection":"notify","criteria":"where","where":{"key":"statusCode","value":"active","operator":"=="},"orderby":false,"order":{"key":"date","value":"desc"}
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
        var time=''
        // console.log(JSON.stringify(messages))
        for(let i=0; i< messages.messageList.length; i++){          
          if(messages.messageList[i].day==day.getDay() && messages.messageList[i].send==true){
            sendMessage = true
            if(messages.messageList[i].time!=""){
              time+=messages.messageList[i].time+' น.'
            }
            message = messages.messageList[i].topic+' '+day.getDate()+' '+months[day.getMonth()]+' '+day.getFullYear()+' '+time+'\n'
            for(let m=0; m<messages.messageList[i].messages.length; m++){
              if(messages.messageList[i].messages[m].status=='active'){
                message+=messages.messageList[i].messages[m].message+'\n'
              }
            }  
            break         
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
  console.log('Application is running on port 8080')
})

