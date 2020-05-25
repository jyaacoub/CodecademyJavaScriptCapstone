const express = require('express');
const apiRouter = express.Router();

module.exports = apiRouter;
// NOTE: The database is not protected against SQL injections.
//      But the purpose behind the app is to demonstrate my 
//      JavaScript knowledge.

const artistsRouter = require('./artists.js');
const seriesRouter = require('./series.js');

apiRouter.use('/artists', artistsRouter);
apiRouter.use('/series', seriesRouter);