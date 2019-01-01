const express = require('express');
const mongoose = require('mongoose'); 

const app = express();


app.get('/', (req, res) => {
    res.send('It Works'); 
})

const PORT = process.env.PORT || 5000; 

app.listen(PORT,  () => console.log(`Servidor listo en http://localhost:${PORT}`)); 

