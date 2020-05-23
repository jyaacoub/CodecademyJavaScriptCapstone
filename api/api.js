const express = require('express');
const apiRouter = express.Router();

module.exports = apiRouter;

const artistsRouter = require('./artists.js');

apiRouter.use('/artists', artistsRouter);