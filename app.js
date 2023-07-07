//jshint esversion:6
require('dotenv').config()

const express = require("express");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const bodyParser = require("body-parser");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
app.use(bodyParser.urlencoded({ extended: true }));
app.set(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(() => {
    console.log("connected to db");
}).catch(function (err) {
    console.log(err);
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);



app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {

    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});
app.post("/register", function (req, res) {
    // console.log(req.body);
    bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
        const newuser = new User({
            email: req.body.username,
            password: hash  
        });

        newuser.save().then(function () {
            console.log("saved successfully");
            res.render("secrets");
        });
    });

});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }).then(function (foundUser) {
        console.log(foundUser);
        bcrypt.compare(password , foundUser.password).then(function(result) {
            if (result===true) {
                res.render("secrets");   
            }
        });
    }).catch(function (err) { console.log(err); });
});

app.listen(3000, function () {
    console.log("connected successfully");
})