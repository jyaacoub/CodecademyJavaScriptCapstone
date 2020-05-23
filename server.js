const bodyparser = require("body-parser");
const cors = require("cors");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const express = require("express");

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(bodyparser.json());
app.use(errorhandler());
app.use(cors());
app.use(morgan('dev'));

const apiRouter = require("./api/api.js");
app.use('/api', apiRouter);

app.listen(PORT, ()=>{
    console.log('Listening on port: ' + PORT);
});

module.exports = app;