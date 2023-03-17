import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todos';
const MONGO_DB = process.env.MONGO_DB || 'todos';

let db = null;
let collection = null;
export default class DB {
    connect() {
        return MongoClient.connect(MONGO_URI)
            .then(function (client) {
                db = client.db(MONGO_DB);
                collection = db.collection('todos');
            })
    }

    queryAll() {
        return collection.find().toArray();
    }

    queryById(id) {
        return collection.findOne({ _id: id });
    }

    update(id, order) {
        return collection.updateOne({ _id: id }, { $set: order });
    }

    delete(id) {
        return collection.deleteOne({ _id: id });
    }

    insert(order) {
        return collection.insertOne(todo);
    }
}









