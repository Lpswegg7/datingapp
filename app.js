var sqlite3 = require('sqlite3').verbose();  //produce long stack traces
var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");
const fileUpload = require('express-fileupload');
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
app.use(fileUpload());

db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT CHECK( LENGTH(name) <= 100 ),dOB DATE NOT NULL DEFAULT "",photo BLOB NOT NULL,height INTEGER NULL DEFAULT NULL,bType TEXT CHECK( bType IN("A","B","AB","O")) NOT NULL DEFAULT "A",profession TEXT CHECK( LENGTH(profession) <= 30 ) NULL DEFAULT NULL, industry TEXT CHECK( LENGTH(industry) <= 30 ) NULL DEFAULT NULL, bPlace TEXT CHECK( LENGTH(bPlace) <= 30 ) NULL DEFAULT NULL,aIncome INTEGER NULL DEFAULT NULL, hobbies TEXT CHECK( LENGTH(hobbies) <= 20 ) NULL DEFAULT NULL)');

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./page/index.html'));
  });
    

// Insert
app.post('/add', function(req,res){
    db.serialize(()=>{
      db.run('INSERT INTO users(name,dOB,photo,height,bType,profession,industry,bPlace,aIncome,hobbies) VALUES(?,?,?,?,?,?,?,?,?,?)', [req.body.id, req.body.name, req.body.dOB, req.body.height, req.body.bType, req.body.profession,req.body.industry,req.body.bPlace,req.body.aIncome,req.body.hobbies], function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New user has been added");
        res.send("New user has been added into the database with Name = "+req.body.name+ " and Photo = "+req.body.photo);
      });
  });
  });
 
  // View
  app.post('/view', function(req,res){
    // This is a list of field names that may be sent to the API.  At least one needs to be included.
    const possibleFields = [
      "mAge",
      "mHeight",
      "mIncome",
      "bType",
      "profession",
      "industry",
      "bPlace",
      "hobbies",
    ];
  
    const includedFields = possibleFields.map( (x) => req.body[x] !== undefined && req.body[x] != '' ? x : undefined ).filter((x) => x !== undefined);
    // 
    // console.log(includedFields);
    if (includedFields.length === 0) {
      res.status(400);
      res.send('You must include at least one field to run this end point');
      console.log("Missing required fields");
      return;
    } 
  
      db.serialize(()=>{
        db.each('SELECT id ID, name NAME FROM users WHERE id =?', [req.body.id], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
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