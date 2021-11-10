var sqlite3 = require('sqlite3').verbose();  //produce long stack traces
var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");

var app = express();
var server = http.createServer(app);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});


var db = new sqlite3.Database('./database/users.db');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use(limiter);

db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT CHECK( LENGTH(name) <= 100 ) NOT NULL DEFAULT "",dOB DATE NOT NULL DEFAULT "",portrait BLOB NOT NULL,height INTEGER NULL DEFAULT NULL,bType TEXT CHECK( bType IN("A","B","AB","O")) NOT NULL DEFAULT "A",job TEXT CHECK( LENGTH(job) <= 50 ) NULL DEFAULT NULL)');

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./page/index.html'));
  });
    

// Insert
app.post('/add', function(req,res){
    db.serialize(()=>{
      db.run('INSERT INTO emp(id,name) VALUES(?,?)', [req.body.id, req.body.name], function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New employee has been added");
        res.send("New employee has been added into the database with ID = "+req.body.id+ " and Name = "+req.body.name);
      });
  });
  });

  // View
app.post('/view', function(req,res){
    db.serialize(()=>{
      db.each('SELECT id ID, name NAME FROM emp WHERE id =?', [req.body.id], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
        if(err){
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        res.send(` ID: ${row.ID},    Name: ${row.NAME}`);
        console.log("Entry displayed successfully");
      });
    });
  });

  app.get('/close', function(req,res){
    db.close((err) => {
      if (err) {
        res.send('There is some error in closing the database');
        return console.error(err.message);
      }
      console.log('Closing the database connection.');
      res.send('Database connection successfully closed');
    });
  });

  server.listen(3000,function(){ 
      console.log("Server listening on port: 3000");
  });