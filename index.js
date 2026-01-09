require("dotenv").config();
const express = require ("express");
const {userModel}=require("./models");
const jwt= require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET;
const { Keypair, PublicKey, Transaction, Connection } = require("@solana/web3.js");
const cors = require ("cors");
const bs58 = require("bs58").default;
const connection = new Connection("https://api.devnet.solana.com");
const auth = require("./middleware/auth");

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

app.post("/api/v1/txn/sign", authMiddleware, async (req, res) => {
  const { serializedTx } = req.body;

  const tx = Transaction.from(
    Buffer.from(serializedTx, "base64")
  );

  const user = await userModel.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const keypair = Keypair.fromSecretKey(
    Buffer.from(user.privateKey, "base64")
  );

  tx.sign(keypair);

  res.json({
    signedTx: Buffer.from(tx.serialize()).toString("base64"),
  });
});


app.get("/api/v1/me", authMiddleware, async (req, res) => {
  const user = await userModel.findById(req.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    username: user.username,
    publicKey: user.publicKey,
  });
});








app.post("/api/v1/txn/sign",async (req,res)=>{
    const { serializedTx } = req.body;

    const privateKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
    const keypair = Keypair.fromSecretKey(privateKey);

    const tx = Transaction.from(
        Buffer.from(serializedTx,"base64")
    );

    tx.sign(keypair)

    const signature = await connection.sendRawTransaction(tx.serialize());

    res.json({
        message: "Sol Transfered ",
        signature: signature
    })

});


app.get("/api/v1/txn",(req,res)=>{
    res.json({
        message: "Sign"
    })
})

app.listen(3000);