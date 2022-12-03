const mongoose = require('mongoose');

const url = "mongodb+srv://notas:notas.2022@cluster0.h70hwng.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(url)
    .then(console.log("Base de datos conectada"))
    .catch(error => console.log(error));