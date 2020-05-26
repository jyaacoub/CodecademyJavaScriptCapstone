const express = require('express');
const sqlite3 = require('sqlite3');

const seriesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE ||  './database.sqlite');

module.exports = seriesRouter;

// checks to see if any fields are missing 
const validateFields = (req, res, next) => {
    if (!(req.body.series.name && req.body.series.description)){
        res.sendStatus(400);
    } else {
        next();
    }
};

seriesRouter.param('seriesId', (req, res, next, id) => {
    db.get(`
        SELECT * FROM Series
        WHERE Series.id = ${id};`,
        (err, row) => {
            if (err){
                next(err);
            } else if (row){
                req.series = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, rows) => {
        if (err){
            next(err);
        } else {
            res.status(200).json({series: rows});
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, next)=>{
    res.status(200).json({series: req.series});
});

seriesRouter.post('/', validateFields, (req, res, next) => {
    db.run(`
        INSERT INTO Series (name, description) 
        VALUES ('${req.body.series.name}', '${req.body.series.description}');`, 
        function(err) {
            if (err){
                next(err);
            } else {
                db.get(`
                    SELECT * FROM Series 
                    WHERE Series.id = ${this.lastID}`,
                    function (err, row) {
                        res.status(201).json({series : row});
                    } 
                );
            }
        }
    );
});

seriesRouter.put('/:seriesId', validateFields, (req, res, next) => {
    db.run(`
        UPDATE Series 
        SET name = '${req.body.series.name}', 
            description = '${req.body.series.description}'
        WHERE Series.id = ${req.params.seriesId};`, 
        function(err){
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId};`, 
                    function(err, row){
                        res.status(200).json({series: row});
                    }
                )
            }

        }
    );
});

const issuesRouter = require('./issues.js');
seriesRouter.use('/:seriesId/issues', issuesRouter);

// seriesRouter.delete('/:seriesId', (req, res, next) =>{

// });