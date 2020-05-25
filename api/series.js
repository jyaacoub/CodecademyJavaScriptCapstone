const express = require('express');
const sqlite3 = require('sqlite3');

const seriesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE ||  './database.sqlite');

module.exports = seriesRouter;

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
