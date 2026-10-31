import express from 'express'
import 'dotenv/config'
import { MongoClient } from 'mongodb';



const app= express();
const PORT= process.env.PORT||5000;





const client = new MongoClient(process.env.MONGODB_URL);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}



app.get('/',(req,res)=>{
    res.send('hellow')
})


app.listen(PORT,()=>{
    console.log(`Server is run on -port ${PORT}`);
    
})