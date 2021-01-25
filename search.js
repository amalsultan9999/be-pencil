
const connect = require("./connect");
var config = require('./config');
var client;
const dbName = config.db;

async function searchTopic(search) {
    const db = client.db(dbName);
    const topics = db.collection("topics");
    const query = { _id: search }
    return await topics.findOne(query);
}

async function searchQuestionsForAnnotations(element) {
    const db = client.db(dbName);
    let query = { annotation: element };
    const annotations = db.collection("annotations");
    questions = await annotations.find(query);
    return questions;
}
async function searchQuestions(ancestors, node) {
    let allQuestions = [];
    ancestors.push(node);

    const db = client.db(dbName);
    let query = { annotation: { $in: ancestors } };
    const annotations = db.collection("annotations");
    cursor = await annotations.find(query);
    await cursor.forEach(annotation => {
        let filteredQuestions = [];
        filteredQuestions = annotation.questions.filter(x => !allQuestions.includes(x));
        allQuestions = allQuestions.concat(filteredQuestions)
    });
    return allQuestions;
}

async function run(queryParams) {
    try {
        let searchTerm = queryParams["q"];
        client = await connect.getClient();
        result = await searchTopic(searchTerm);
        if (result) {
            questions = await searchQuestions(result.ancestors, result._id);
            await client.close();
            return questions;
        }

    } catch (err) {
        console.log(err.stack);
    }

    finally {
        await client.close();
    }
}
module.exports = { run };
