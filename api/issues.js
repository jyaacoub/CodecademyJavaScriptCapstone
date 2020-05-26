const express  = require('express');
const sqlite3 = require('sqlite3');
const issuesRouter = express.Router({mergeParams: true});

const db = new sqlite3.Database(process.env.TEST_DATABASE ||  './database.sqlite');

module.exports = issuesRouter;

// Checking to see if fields are missing
const validateFields = (req, res, next) => {
    if (!(req.body.issue)){
        next();
    } else if (!(req.body.issue.name && req.body.issue.issueNumber && 
            req.body.issue.publicationDate && req.body.issue.artistId)){
        res.sendStatus(400);
    } else {
        db.get(`
            SELECT * FROM Artist
            WHERE Artist.id = ${req.body.issue.artistId};`, 
            function (err, row){
                if (err){
                    next(err);
                } else if (!row) {
                    res.sendStatus(400);
                } else {
                    next();
                }
            }
        );
    }
};

issuesRouter.param('issueId', (req, res, next, id) => {
    db.get(`
        SELECT * FROM Issue
        WHERE Issue.id = ${id};`,
        (err, row) => {
            if (err){
                next(err);
            } else if (row){
                req.issue = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});

issuesRouter.get('/', (req, res, next) => {
    db.all(`
        SELECT * FROM Issue
        WHERE Issue.series_id = ${req.params.seriesId};`,
        function(err, rows){
            if (err){
                next(err);
            } else {
                res.status(200).json({issues: rows});
            }
        }
    );
});

issuesRouter.post('/', validateFields, (req, res, next) => {
    const sql = `
        INSERT INTO Issue(
            name, issue_number, publication_date, artist_id, series_id)
        VALUES($name, $issueNumber, $publicationDate, $artistId, $seriesId)`;
    const values = {
        $name : req.body.issue.name,
        $issueNumber: req.body.issue.issueNumber,
        $publicationDate: req.body.issue.publicationDate,
        $artistId: req.body.issue.artistId,
        $seriesId: req.params.seriesId
    };
    
    db.run(sql, values, function(err){
        if (err){
            next(err);
        } else {
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID};`, 
                function(err, row){
                    res.status(201).json({issue: row});
                })
        }
    });

});

issuesRouter.put('/:issueId', validateFields, (req, res, next) => {
    const sql = `
        UPDATE Issue
        SET name = $name, issue_number = $issueNumber, 
            publication_date = $publicationDate, artist_id = $artistId, 
            series_id = $seriesId
        WHERE Issue.id = $issueId;`;
    const values = {
        $name : req.body.issue.name,
        $issueNumber: req.body.issue.issueNumber,
        $publicationDate: req.body.issue.publicationDate,
        $artistId: req.body.issue.artistId,
        $seriesId: req.params.seriesId,
        $issueId: req.params.issueId
    };

    db.run(sql, values, function(err){
        if (err){
            next(err);
        } else{
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId};`,
                function(err, row){
                    res.status(200).json({issue: row});
                }
            );
        }
    });

});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`
        DELETE FROM Issue
        WHERE Issue.id = ${req.params.issueId};`, 
        function(err) {
            if(err){
                next(err);
            } else {
                res.sendStatus(204);
            }
        }
    );
});
