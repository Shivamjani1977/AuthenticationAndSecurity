//jshint esversion:6
require('dotenv').config()

const express = require("express");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const bodyParser = require("body-parser");
const md5 = require("md5");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
app.use(bodyParser.urlencoded({ extended: true }));
app.set(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(() => {
    console.log("connected to db");
}).catch(function (err) {
    console.log(err);
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.get("/", function (req, res) {
    res.render("home");
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});


app.get("/login", function (req, res) {

    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/logout", function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });



app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password).then(function (user) {
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
        });

        ///so here we do not reder the secret page instead we redirect it because when the us
        //user is authenticated he/she could directly access the secrets page.

    }).catch(function (err) {
        console.log(err);
    });
});

app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err, result) {

        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });


});

app.listen(3000, function () {
    console.log("connected successfully");
})