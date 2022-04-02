const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require('./routes/userRoutes')


const connect = mongoose.connect(
"mongodb://localhost:27017/music-app",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);
connect.then(
    (db) => {
        console.log("Connected correctly to server");
    },
    (err) => {
        console.log(err);
    }
);


var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/send', (req, res) => {
res.send('Hello, I am Music Backend')
});

app.use("/api/user", userRoutes);

module.exports = app;
  