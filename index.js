import express from 'express'
import cors from 'cors';
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../events-platform-web/src/lib/auth.js";



const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
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

const verifyUser = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({
                message: "Please login first",
            });
        }

        req.user = session.user;
        next();

    } catch (error) {
        console.error(error);

        res.status(401).json({
            message: "Unauthorized",
        });
    }
};


app.post('/Create-event', verifyUser, async (req, res) => {
    try {
        const data = {
            ...req.body,

            // Logged-in user ID
            createdBy: req.user.id,

            organizerEmail: req.user.email,

            createdAt: new Date(),
        };

        const result = await destinationCollection.insertOne(data);

        res.status(201).json({
            message: "Event created successfully",
            insertedId: result.insertedId,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create event",
        });
    }
});

app.delete("/my-event/:id", verifyUser, async (req, res) => {
    try {
        const { id } = req.params;


        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID",
            });
        }
        const result = await destinationCollection.deleteOne({
            _id: new ObjectId(id),
            createdBy: req.user.id,
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

app.get('/my-event', verifyUser, async (req, res) => {
    try {
        const result = await destinationCollection
            .find({
                createdBy: req.user.id
            })
            .toArray();

        res.send(result);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch events"
        });
    }
});

// Get All Public Events
app.get('/events', async (req, res) => {
    try {
        const result = await destinationCollection
            .find({})
            .toArray();

        res.status(200).json(result);

    } catch (error) {
        console.error("Fetch events error:", error);

        res.status(500).json({
            message: "Failed to fetch events"
        });
    }
});


app.get('/my-event/:id', verifyUser, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const result = await destinationCollection.findOne({
            _id: new ObjectId(id),
            createdBy: req.user.id
        });

        if (!result) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch event"
        });
    }
});


app.patch('/my-event/:id', verifyUser, async (req, res) => {
    try {
        const { id } = req.params;
       const { createdBy, _id, ...updatedData } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const result = await destinationCollection.updateOne(
            {
                _id: new ObjectId(id),
                createdBy: req.user.id
            },
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