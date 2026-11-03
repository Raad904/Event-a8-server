import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();

app.use(express.json());
app.use(cors());

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
    throw new Error('MONGODB_URL is missing from environment variables!');
}

const client = new MongoClient(MONGODB_URL);

await client.connect();

console.log('Successfully connected to MongoDB!');

const db = client.db('Event');

const destinationCollection = db.collection('destination');
const destinationCollection2 = db.collection('maidData');


// CREATE EVENT
app.post('/Create-event', async (req, res) => {
    try {
        const data = req.body;
        const result = await destinationCollection.insertOne(data);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Failed to create event' });
    }
});


// DELETE MY EVENT
app.delete('/my-event/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const result = await destinationCollection.deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
});


// GET ALL MY EVENTS
app.get('/my-event', async (req, res) => {
    try {
        const result = await destinationCollection.find().toArray();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});


// GET ALL UPCOMING EVENTS
app.get('/Upcoming-Events', async (req, res) => {
    try {
        const result = await destinationCollection2.find().toArray();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch upcoming events' });
    }
});


// GET MY EVENT BY ID
app.get('/my-event/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const result = await destinationCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!result) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
});


// GET UPCOMING EVENT BY ID
app.get('/Upcoming-Events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const result = await destinationCollection2.findOne({
            _id: new ObjectId(id),
        });

        if (!result) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
});


// UPDATE MY EVENT
app.patch('/my-event/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const result = await destinationCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            message: 'Event updated successfully',
            result,
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Failed to update event' });
    }
});


// HOME ROUTE
app.get('/', (req, res) => {
    res.send('Hello! Event API is running.');
});


// IMPORTANT: Vercel Serverless
// Do not use app.listen()
export default app;