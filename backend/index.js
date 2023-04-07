import express from 'express';
import DB from './db.js'

const PORT = process.env.PORT || 8000;

/** Zentrales Objekt für unsere Express-Applikation */
const app = express();
app.use(express.json());

/** global instance of our database */
let db = new DB();

/** Initialize database connection */
async function initDB() {
    await db.connect();
    console.log("Connected to database");
}

// implement API routes

/** Return all todos. 
 *  Be aware that the db methods return promises, so we need to use either `await` or `then` here! 
 */
app.get('/todos', async (req, res) => {
    let todos = await db.queryAll();
    res.send(todos);
});


// GET /todos/:id
app.get('/todos/:id', async (req, res) => {
    const todo = await db.queryById(req.params.id);
    if (Object.keys(todo).length === 0) {
        res.status(404).send({ error: 'Todo not found' });
    } else {
        res.send(todo);
    }
});



// Create  POST /todos
app.post('/todos', async (req, res) => {
    const result = await db.insert(req.body);
    console.log(result);
    res.send(result);
});


// Update PUT /todos/:id
app.put('/todos/:id', async (req, res) => {
    const ret = await db.update(req.params.id, req.body);
    res.send(ret);
});


// DELETE /todos/:id
app.delete('/todos/:id', async (req, res) => {
    let ret = await db.delete(req.params.id);
    res.send(ret);
});






initDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
    })

