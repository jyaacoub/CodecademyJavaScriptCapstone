const bodyparser = require("body-parser");
const cors = require("cors");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const express = require("express");

const path = require('path');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(bodyparser.json());
app.use(errorhandler());
app.use(cors());
app.use(morgan('dev'));

const apiRouter = require("./api/api.js");
app.use('/api', apiRouter);


app.get('/', function(req,res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
  
app.use(express.static('./'));

app.listen(PORT, ()=>{
    console.log('Listening on port: ' + PORT);
});

module.exports = app;