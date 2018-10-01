const express = require('express');
const fs = require('fs');
const hbs = require('hbs');

const port = process.env.PORT || 3000;

var app = express();     //*** create server

hbs.registerPartials(__dirname + '/views/partials'); //*** set the partials folder for hbs

app.set('view engine','hbs');    //*** set the view engine to handle bars

//*** Helper functions  to replace functions inside html
//You set helper functions in handlebars after you regisrerPartials and set the view ENGINE
//IMPORTANT:   $nodemon will not see the hbs file extensions so type $nodemon server.js -e js,hbs
//hbs.registerHelper('functionname',() => {});
hbs.registerHelper('getCurrentYear',() => {
  return new Date().getFullYear();
});
hbs.registerHelper('screamIt',(text) => {
  return text.toUpperCase();
})


/*** EXPRESS MIDDLEWARE  It is important that your middleware is placed before any get methods*/
app.use((req,res,next) => {  //more infomration can be found at express.js > API > request
    var now = new Date().toString();
    var log = `${now}  Method: ${req.method}  URL: ${req.url} \n`;
    fs.appendFile('server.log',log,(err) => {
      if (err) {
        console.log('Can not append to the file');
      }
    });
    console.log(log);
    next();
});




//*** Static pages Create a new folder Public where you plan to place files accessible to anyone
//This is where we will place the static page. Create new file help.html
//This tells express to look for a files in that folder. It requires full directory of the folder. __dirname provides the directory of the current file server.js so we then add  /public
app.use(express.static(__dirname + '/public'));   //easy it is to serve static pages from a server usign node

//** Setting up handlers retrieves for the path below. req stores details about the request res is what we decide to send back
//run the app in terminal $nodemon server.js  This tells the program to start in the server
//now if you go to the browser (client) and type localhost:3000 then this client requests, tries to
//retrieve information from the server at the path '/' which is the standard parth of the project
//In chrome developer tools  cmd+option+i in Network you can see a lot of information
//look at the Content-Type within the Response Headers, when you click localhost
//This reads text/html Also General => Request Method = GET  and Staus Code : 200 which is OK,success
app.get('/aboutt',(req,res) => {
  res.send('Aboutt Page');
});
//Now if the user types localhost:3000/about our app will call the app.get('about')  part

app.get('/bad',(req,res) => {
  res.send({
    errorMessage : 'Unable to handle request'
  });
  //if ypu click View Source at the browser you can see the actual JSON
});

app.get('/about',(req,res) => {
  res.render('about.hbs',{
    pageTitle: 'About Ang Page',
    currentYear: new Date().getFullYear()
  });
});


let g = 1;
console.log(`g: ${g}`);
let z = setInterval(function () {
  ++g
  console.log(`g: ${g}`);
},2000);


//TODO LINK SIMULATOR FROM BARCONSTRUCTOR TO CREATE BARS AND TIMEFRAMES
//TODO USE MONGODB AND MONGOOSE TO CREATE DATABASES
//TODO CREATE CHARTS
//TODO BROADCAST USING SOCKETS.IO   NEED STUDYING *****


app.get('/',(req,res) => {
  res.render('home.hbs',{
    pageTitle: 'Home Page',
    // currentYear: new Date().getFullYear(),
    welcomeMessage: 'Welcome to my website',
    ga: g
  })
});

app.get('/projects',(req,res) => {
  res.render('projects.hbs',{
    pageTitle: 'Projects'
  })
})


app.listen(port, () => {      //*** start listening to client requests
  console.log(`Server is up on port ${port}`);
});
