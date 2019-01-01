const express = require('express');
const mongoose = require('mongoose'); 
const passport = require('passport'); 

const app = express();
// Llamar rutas
const auth = require('./routes/auth');

// Passport

require('./config/passport')(passport); 

app.get('/', (req, res) => {
    res.send('It Works'); 
})

// Requerir rutas
app.use('/auth', auth); 


const PORT = process.env.PORT || 5000; 

app.listen(PORT,  () => console.log(`Servidor listo en http://localhost:${PORT}`)); 

