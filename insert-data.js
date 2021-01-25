const { MongoClient } = require("mongodb");
const readXlsxFile = require('read-excel-file/node');

var config = require('./config');
const url = config.connectionString;
const client = new MongoClient(url);
const dataFilePath = config.annotations;
const dbName = config.db;

async function indexTopics() {
    await client.connect();

    const db = client.db(dbName);
    const topics = db.collection("topics");

    const result = await topics.createIndex({ _id: 1 });
    console.log(`Index created: ${result}`);
}

async function indexannotations() {
    await client.connect();

    const db = client.db(dbName);
    const topics = db.collection("annotations");

    const result = await topics.createIndex({ annotation: 1 });
    console.log(`Index created: ${result}`);
}

async function storeTopics() {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("topics");

    let data = {};
    readXlsxFile(dataFilePath, { sheet: 2 }).then((rows) => {
        rows.slice(1, rows.length).forEach((col) => {
            for (let i = 0; i < col.length; i++) {
                let ancestorArray = [];
                if (col[i] != null) {
                    for (let j = i + 1; j < col.length; j++) {
                        if (data[col[i]]) {
                            ancestorArray = data[col[i]].ancestors;
                            if (col[j] && !data[col[i]].ancestors.find(element => element == col[j])) {
                                ancestorArray.push(col[j])
                            }
                        }
                        else{
                            if (col[j]) {
                                ancestorArray.push(col[j])
                            }
                        }
                    }
                    parent = col[i-1]? col[i-1]: null;
                    data[col[i]] = { parent: parent , ancestors: ancestorArray };
                }
            }
        });

        let transformedData = [];
        for (let key in data) {
            transformedData.push({
                "_id": key,
                "parent": data[key].parent,
                "ancestors": data[key].ancestors
            })
        }
        collection.insertMany(transformedData);

    });
}

async function storeQuestions() {

    const db = client.db(dbName);
    const collection = db.collection("annotations");

    let data = {};
    // store questions
    readXlsxFile(dataFilePath).then((rows) => {
        rows.slice(1, rows.length).forEach((col) => {
            for (let i = 1; i <= 5; i++) {
                if (col[i] != null) {
                    if (data[col[i]]) {
                        let questionsArray = [];
                        questionsArray = data[col[i]];
                        questionsArray.push(col[0])
                        data[col[i]] = questionsArray;
                    }
                    else {
                        data[col[i]] = [col[0]]
                    }
                }
            }              
        });

        let transformedData = [];
        for (let key in data) {
            transformedData.push({
                "annotation": key,
                "questions": data[key]
            })
        }
        collection.insertMany(transformedData);

    });
}

async function run() {
    try {
        // storeQuestions();
        // storeTopics();
        // indexTopics();
        // indexannotations();

    } catch (err) {
        console.log(err.stack);
    }

    finally {
        await client.close();
    }
}

run().catch(console.dir);