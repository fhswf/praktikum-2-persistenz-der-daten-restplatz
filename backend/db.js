import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
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
        return collection.findOne({_id:new ObjectId(id)});
    }

    update(id, order) {
        const rslt= collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: order }
        );
        return rslt;
    }

    delete(id) {
        collection.deleteOne({_id: new ObjectId(id)});
    }

    insert(order) {
        // TODO: Implement insert
    }
}
