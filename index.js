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
const destinationCollection= db.collection("destination")

const joinedCollection = db.collection("joined")




app.post('/Create-event', async (req, res) => {
    const data = req.body

    const result = await destinationCollection.insertOne(data)


    console.log(result)
    res.json(result)
})


app.post("/joining", async (req, res) => {
  try {
    await client.connect();

    const joinedCollection = client.db("Event").collection("joined");

    const { _id, name, email, image, ...eventData } = req.body;

    if (!_id || !email) {
      return res.status(400).json({
        success: false,
        message: "Event ID and user email are required.",
      });
    }

    // Check duplicate join
    const alreadyJoined = await joinedCollection.findOne({
      eventId: String(_id),
      email: email,
    });

    if (alreadyJoined) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this event.",
      });
    }

    // Save joined event
    const result = await joinedCollection.insertOne({
      eventId: String(_id),
      name,
      email,
      image,
      ...eventData,
      joinedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Successfully joined the event.",
      insertedId: result.insertedId,
    });

  } catch (error) {
    console.error("Join Event Backend Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to join event.",
    });
  }
});


app.get('/join/:email', async (req,res)=>{
    const {email} = req.params
    const result = await joinedCollection.find({email:email}).toArray()
    res.send(result)
})

// Remove a single joined event for a user
app.delete("/join/:email/:eventId", async (req, res) => {
  try {
    const { email, eventId } = req.params;

    if (!email || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Email and event ID are required.",
      });
    }

    const result = await joinedCollection.deleteMany({
      email: decodeURIComponent(email),
      eventId: String(eventId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Joined event not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Joined event removed successfully.",
    });
  } catch (error) {
    console.error("Remove Joined Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove joined event.",
    });
  }
});


// Clear all joined events for a specific user
app.delete("/join/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email is required.",
      });
    }

    const result = await joinedCollection.deleteMany({
      email: decodeURIComponent(email),
    });

    res.status(200).json({
      success: true,
      message: "All joined events removed successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear Joined Events Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear joined events.",
    });
  }
});

app.delete("/my-event/:id", async (req, res) => {
    try {
        const { id } = req.params;


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

app.get('/Upcoming-Events', async (req, res) => {
    const result = await destinationCollection.find().toArray()
    res.send(result)
})
app.get('/RecentEvents', async (req, res) => {
    const result = await destinationCollection.find().toArray()
    res.send(result)
})

app.get('/GallerySection', async (req, res) => {
    const result = await destinationCollection.find().toArray()
    res.send(result)
})

app.get('/my-event/:id', async(req,res)=>{
    const {id}= req.params

    const result = await destinationCollection.findOne({_id: new ObjectId(id)})
    res.send(result)
})

app.get("/my-events/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await destinationCollection
      .find({ organizerEmail: email })
      .toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error("My Events API Error:", error);
    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});

app.get('/Upcoming-Events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const result = await destinationCollection2.findOne({
            _id: new ObjectId(id)
        });

        if (!result) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch event"
        });
    }
});


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

export default app