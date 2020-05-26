const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE ||  
    './database.sqlite');

const artistsRouter = express.Router();

module.exports = artistsRouter;

// Checks and formats the request
const validateFields = (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    // Checking to see if it has been set if not it defaults to 1
    req.body.artist.isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0? 0 : 1;
    
    if (!(name && dateOfBirth && biography)) {
        res.sendStatus(400);
    } else {
        next();
    }
};

artistsRouter.param('artistId', (req, res, next, id) => {
    db.get(`
        SELECT * FROM Artist
        WHERE Artist.id = ${id};`,
        (err, row) => {
            if (err){
                next(err);
            } else if (row){
                req.artist = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});

artistsRouter.get('/', (req, res, next) => {
    // Retrives all the entries in the artist table where they are employed    
    db.all(`
        SELECT * FROM Artist
        WHERE is_currently_employed = 1;`, (err, rows)=>{
            if (err) {
                // passed on along the middleware chain for the errorhandler
                next(err);  
            } else{
                // similar to .send() but instead of a string we are sending a json.
                res.status(200).json({artists: rows}); 
            }
        }
    );
});

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

artistsRouter.post('/', validateFields, (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed;
    
    // SQL query to create the new artist
    db.run(`
            INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) 
            VALUES ('${name}', '${dateOfBirth}', '${biography}', ${isCurrentlyEmployed})`, 
        function (err) {
            if (err) {
                next(err);
            } else{
                db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
                    (err, row) => {
                        res.status(201).json({artist: row});
                    } 
                );
            }
        }
    );
});

artistsRouter.put('/:artistId', validateFields, (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed;

    // Making the update
    db.run(`
        UPDATE Artist
        SET name = '${name}', date_of_birth = '${dateOfBirth}', 
            biography = '${biography}', is_currently_employed = ${isCurrentlyEmployed}
        WHERE Artist.id = ${req.params.artistId};`, 
        function(err) {
            if (err){
                next(err);
            } else { // Returning the updated artist:
                db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
                    (err, row) => {
                        res.status(200).json({artist: row});
                    } 
                );

            }
        }
    );
});

// not your average delete request (marks them as unemployed instead!)
artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`
        UPDATE Artist
        SET is_currently_employed = 0
        WHERE Artist.id = ${req.params.artistId};`,
        function (err) {
            if (err){
                next(err);

            } else {
                db.get(`
                    SELECT * FROM Artist
                    WHERE Artist.id = ${req.params.artistId};`,
                    function(err, row){
                        res.status(200).json({artist: row});

                    }
                );
            }
        } 
    );
});