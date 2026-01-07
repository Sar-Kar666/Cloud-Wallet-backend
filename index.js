require("dotenv").config();
const express = require ("express");
const {userModel}=require("./models");
const jwt= require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET;
const { Keypair, PublicKey, Transaction, Connection } = require("@solana/web3.js");
const cors = require ("cors");
const bs58 = require("bs58").default;
const connection = new Connection("https://api.devnet.solana.com")

const app = express();
app.use(express.json());
app.use(cors());


const privateKey= bs58.decode(process.env.SOLANA_PRIVATE_KEY)

console.log(privateKey);

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



app.post("/api/v1/txn/sign", async (req, res) => {
  try {
      
      const serializedTx  = req.body.serializedTx;
    // 1️⃣ Load private key (DO NOT hardcode in real apps)
    const secretKey = privateKey;

    const keypair = Keypair.fromSecretKey(secretKey);

    // 2️⃣ Deserialize transaction
    const tx = Transaction.from(
      Buffer.from(serializedTx, "base64")
    );

    // 3️⃣ Sign transaction
    tx.sign(keypair);


    const signature = await connection.sendRawTransaction(
      tx.serialize()
    );

    res.json({
      message: "Transaction signed and sent",
      signature
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


app.get("/api/v1/txn",(req,res)=>{
    res.json({
        message: "Sign"
    })
})

app.listen(3000);