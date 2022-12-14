const express       = require('express');
const body_parser   = require('body-parser');
const axios         = require('axios');
require('dotenv').config();

const app           = express().use(body_parser.json());
const token         = process.env.WHATSAPP_TOKEN; // token de la pagina de heroku
const mytoken       = process.env.MYTOKEN; // token que pongo en la página de facebook

app.listen(8000 || process.env.PORT,() => {
    console.log('Puerto habilitado 8000');

}); 

app.get("/webhook", (req, res) => {
    let mode        = req.query["hub.mode"];
    let challenge   = req.query["hub.challenge"];
    let token       = req.query["hub.verify_token"];

    if(mode && token){
        if(mode === "subscribe" && token === mytoken){
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        }else{
            res.status(403);
        }
        }
});

app.post("/webhook", (req, res) => {
    let body_param  = req.body;
    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("body param dentro");
        if(body_param.entry && 
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0] 
            ){
                let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from;
                let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
            
                console.log("phone number "+phon_no_id);
                console.log("from "+from);
                console.log("boady param "+msg_body);

                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v15.0/"+ phon_no_id + "/messages?access_token=" + token,
                    data:{
                        messaging_product:"whatsapp",
                        to:from,
                        text:{
                            body:"Hi..I'm DamRog, tu mensaje es" + msg_body
                        }
                    },
                    headers:{
                        "content-Type":"application/json"
                    }
                });
                res.sendStatus(200)
            }else{
                res.sendStatus(404);
            }    
        }
    });

    app.get("/", (req, res) => {
        res.status(200).send("Hola esto es setup webhook")
    });