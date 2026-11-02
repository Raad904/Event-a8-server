import express from 'express'
import cors from 'cors';
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';



const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;





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
const mongoClint = await connectToMongoDB()
const db = mongoClint.db("Event")
const destinationCollection = db.collection("destination")



app.post('/Create-event', async (req, res) => {
    const data = req.body

    const result = await destinationCollection.insertOne(data)


    console.log(result)
    res.json(result)
})

app.delete("/my-event/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { ObjectId } = await import("mongodb");

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID",
            });
        }

        const result = await destinationCollection.deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        res.json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            message: "Failed to delete event",
        });
    }
});

app.get('/my-event', async (req, res) => {
    const result = await destinationCollection.find().toArray()
    res.send(result)
})

app.get('/my-event/:id',async(req,res)=>{
    const {id}= req.params
    
    
    const result = await destinationCollection.findOne({_id: new ObjectId(id)})
    res.send(result)
})


app.patch('/my-event/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const result = await destinationCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json({
            message: "Event updated successfully",
            result
        });

    } catch (error) {
        console.error("Update error:", error);

        res.status(500).json({
            message: "Failed to update event"
        });
    }
});

app.get('/', (req, res) => {
    res.send('hellow')
})


app.listen(PORT, () => {
    console.log(`Server is run on -port ${PORT}`);

})