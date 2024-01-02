const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const catSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imgSrc: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    isMale: {
        type: Boolean,
        required: true
    },
    href: {
        type: String,
        required: true
    }
}, {timestamps: true});

// Create the Cat model using the schema
const Cat = mongoose.model('Cat', catSchema);

module.exports = Cat;