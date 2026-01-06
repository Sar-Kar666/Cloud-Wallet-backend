require("dotenv").config();
const express = require ("express");
const {userModel}=require("./models");
const jwt= require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET;
const { Keypair, PublicKey } = require("@solana/web3.js");


const app = express();
app.use(express.json());

app.post ("/api/v1/signup",(req,res)=>{
    const username = req.body.username;
    const password= req.body.password;
    const keypair = Keypair.generate();
    userModel.create({
        username,
        password,
        privateKey: Buffer.from(keypair.secretKey).toString("base64"),
        publicKey: keypair.publicKey.toBase58(),

    })
    
    res.json({
       message: keypair.publicKey.toBase58(),
    })
})

app.post("/api/v1/signin",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    const user = userModel.findOne({
        username : username,
        password : password
    })

    if(user){
        const token = jwt.sign({
            userId : user._id
        }, JWT_SECRET)
        res.json({
            token
        })
    }else{
        res.status(403).json({
            message: " Credentials are incorrect"
        })
    }
   
})

app.post("/api/v1/txn/sign",(req,res)=>{
    res.json({
        message: "sign the txn"
    })
})

app.get("/api/v1/txn",(req,res)=>{
    res.json({
        message: "Sign"
    })
})

app.listen(3000);