const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotasSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    usuario_id: {
        type: String,
    }
});

module.exports = mongoose.model('Nota', NotasSchema);