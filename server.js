
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var session = require("express-session");
var flash = require("express-flash");


app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use(express.static(__dirname + "/static"));
app.use(session({
    secret: "QWERT!@#$%^&*(",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));


app.set("views", __dirname + "/views");
app.set("view engine", "ejs");


mongoose.connect("mongodb://localhost/message_board", {useNewUrlParser: true, useUnifiedTopology: true});

var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    comment: {type: String, required: true},
    }, {timestamps: true})

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true},
    message: {type: String, required: true},
    comments: [CommentSchema]
    }, {timestamps: true})

mongoose.model("Comment", CommentSchema);
mongoose.model("Message", MessageSchema);

var Comment = mongoose.model("Comment");
var Message = mongoose.model("Message");

app.get("/", function(req, res){
    Message.find().populate("comments").exec(function(error, messages){
        if(error){
            console.log(error);
        }
        else{
            // console.log(messages)
            res.render("index", {posts:messages});
        }
    })
});

app.post("/message", function(req, res){
    console.log("Request Data", req.body);
    var message = new Message({name: req.body.name, message: req.body.message});
    message.save(function(error){
        if(error){
            console.log(error);
            for(var key in error.errors){
                req.flash("messageform", error.errors[key].message);
            }
            res.redirect("/");
        }
        else{
            console.log("Successfully added a message");
            res.redirect("/");
        }
    })
});

app.post("/comment", function(req, res){
    console.log("Request Data ", req.body);
    Comment.create({name: req.body.name, comment: req.body.comment}, function(error, comment){
        if(error){
            console.log(error);
            for(var key in error.errors){
                req.flash("commentform", error.errors[key].message);
            }
            res.redirect('/');
        }
        else{
            Message.findOneAndUpdate({_id: req.body.msgId}, {$push: {comments: comment}}, function(error, data) {
                if(error){
                    console.log(error);
                    res.redirect('/');
                }
                else{
                    console.log(data)
                    res.redirect('/');
                }
            })
        }
    })
});

//Port
app.listen(8000, function(){
    console.log("Listening on port: 8000");
});