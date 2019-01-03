const express = require('express');
const mongoose = require('mongoose'); 
const passport = require('passport'); 
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const handlebars = require('express-handlebars'); 
const path = require('path'); 
const bodyParser = require('body-parser'); 


const app = express();
// Llamar rutas
const auth = require('./routes/auth');
const index = require('./routes/index'); 
const stories = require('./routes/stories'); 

// Passport
require('./config/passport')(passport); 

// Cookie Parser 

app.use(cookieParser()); 

// Express Sessions 

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Handlebars middleware

app.engine('handlebars', handlebars({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars'); 

// parse application/x-www-form-urlencoded and json 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()); 
// Static Folder 

app.use(express.static(path.join(__dirname, 'public'))); 


// Global Variables 

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next(); 
})

// Mongoose Connect and Load Keys
const keys = require('./config/keys'); 

// Map Global Promises

mongoose.Promise = global.Promise; 

mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
      console.log(err); 
  })

// Requerir rutas /* estas deben ir siempre hasta abajo */ 
app.use('/auth', auth); 
app.use('/', index); 
app.use('/stories', stories); 


const PORT = process.env.PORT || 5000; 

app.listen(PORT,  () => console.log(`Servidor listo en http://localhost:${PORT}`)); 

