const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const config = require('./config.json');
const cors = require('cors');

// Create the mongo client to use
const client = new MongoClient(config.finalUrl)

const { json } = require('express');
const app = express();
const port = 3000;

app.use(cors())
app.use(express.static('public'));
app.use(bodyParser.json());

//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});
// return all boardgames from the database
app.get('/games', async (req, res) => {
    // read the file
    try {
        //connect to the db
        await client.connect();
        //retrieve the boardgame collection data
        const collection = client.db(config.db).collection(config.collection)
        const data = await collection.find().toArray();


        // send back the file
        res.status(200).send(data);
    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }

});
//  /boardgame?id=1234
app.get('/game', async (req, res) => {
    // id is located in the query: req.query.id
    try {
        //connect to the db
        await client.connect();
        //retrieve the boardgame collection data
        const collection = client.db(config.db).collection(config.collection)


        // Query for a boardgame that has id 'bgid'
        const query = { bgid: parseInt(req.query.id) };

        const data = await collection.findOne(query);

        if (data) {
            // send back the file

            res.status(200).send(data);
            return;
        } else {
            res.status(400).send('Boardgame could not be found with id: ' + req.query.id)
        }


    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

app.post('/saveGame', async (req, res) => {
    if (!req.body.date || !req.body.game) {
        res.status(400).send('Vul alle verplichte velden in')
        return;
    }

    try {

        await client.connect();
        //retrieve the boardgame collection data
        const collection = client.db(config.db).collection(config.collection)

        const estimate = await collection.find({}).sort({ _id: -1 }).limit(1).toArray();
        const id = estimate.length > 0 ? estimate[0].bgid + 1 : 1;


        // // valadation for double boardgames



        // const data = await collection.findOne({ bgid: req.body.bgid });
        // if (data) {
        //     res.status(400).send('Game met bgid ' + req.body.bgid + ' bestaat al. Gelieve een ander id te kiezen')
        //     return;
        // };
        //create new boardgame object
        let newBoardgame = {
            bgid: id,
            date: req.body.date,
            game: req.body.game,
            atlasID: req.body.atlasID,
            first: req.body.first,
            second: req.body.second,
            third: req.body.third,
            minUsers: req.body.minUsers,
            maxUsers: req.body.maxUsers,
            atlasID: req.body.atlasID,
            users: req.body.users
        }

        // Insert into the DB
        let insertResult = await collection.insertOne(newBoardgame);


        //Send back succesmessage
        res.status(201).json(`Boardgame succesfully saved with id ${newBoardgame.bgid}`);
        return;
    } catch (error) {
        res.status(500).send({
            error: 'something went wrong',
            value: error
        })
    } finally {
        await client.close();
    }


});

app.delete('/deleteGame', async (req, res) => {
    // id is located in the query: req.query.id
    try {
        //connect to the db
        await client.connect();
        //retrieve the boardgame collection data
        const collection = client.db(config.db).collection(config.collection)


        // Query for a movie that has the title 'The Room'
        const query = { bgid:parseInt(req.query.id) };
        console.log(query);



        const data = await collection.deleteOne(query);
        console.log(data);
        if (data) {
            // send back the file


            res.status(200).send(data);
            return;
        } else {
            res.status(400).send('Boardgame could not be found with id: ' + req.query.id)
        }


    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

app.patch('/updateGame', async (req, res) => {
    // id is located in the query: req.query.id
    try {
        //connect to the db
        await client.connect();
        //retrieve the boardgame collection data
        const collection = client.db(config.db).collection(config.collection)
        const filter = { bgid: parseInt(req.body.bgid) }
        /*const data = await collection.findOne({ bgid: req.body.bgid });
        if (data) {
            res.status(400).send('Game met bgid ' + req.body.bgid + ' bestaat al. Gelieve een ander id te kiezen')
            return;
        };*/
        // Hier kom alle data die we willen updaten. Maakt gebruik van de set om het veldje volledig te veranderen
        const updateDocument = {
            $set: {}
        }
        // Die gebruikt voor te zoeken naar welke user je wil aanpassen
        const arrayFilters = { arrayFilters: [] };
        // Loopen door alle properties van u body (Object namen)
        for (const prop in req.body) {
            // Als het die van ID is, negeren we die want die wordt hierboven al gebruiken en willen we niet aanpassen
            if (prop === 'bgid') {
                continue;
            }
            // als het users is, gebeuren er extra checks
            if (prop === 'users') {
                let index = 0;
                // Loop over de verschillende emails in user opject
                for (const email in req.body.users) {
                    const objToPush = {};
                    // We moeten een apart element aanmaken voor op te gaan zoeken achteraf
                    // We gebruiken hiervoor de index van de array van users
                    // we generen dus een filter waarop hij moet zoeken
                    objToPush[`element${index}.email`] = { $eq: email };
                    arrayFilters.arrayFilters.push(objToPush);
                    // opnieuw door de poperties van u user object gaan
                    for (const key in req.body.users[email]) {
                        //Als het niet searchEmail is, gaan we het in de sort steken van de updatedocument
                        // Met als elementnaam hetzelfde als in de filter
                        updateDocument.$set[`users.$[element${index}].${key}`] = req.body.users[email][key];
                    }
                    index++;
                }
                // doorgaan want we moeten niets meer doen
                continue;
            }
            // Als het geen van die 2 zijn, gewoon de property in de update document zetten met de data
            updateDocument.$set[prop] = req.body[prop];
        }

        let updateData = await collection.updateOne(filter, updateDocument, arrayFilters);
        if (updateData) {
            res.status(200).send(updateData);
            return;
        } else {
            res.status(400).send('Boardgame could not be found with id: ' + req.query.id)
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});



app.listen(port, () => {
    console.log(`API is running at port http://localhost:${port}`);
});