var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var uuid = require('node-uuid');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongo-news-scraper", { useNewUrlParser: true });

// Routes
app.delete("/comments", (req,res)=>{
  console.log(req.body);
  db.Article.updateOne({ 
    _id: req.body.articleId 
  }, { 
    $pull: {      
      'commentList': { 
        id: req.body.commentId 
      },
    } 
  }).then(function(param){
   return res.status(200).json(param);
  }).catch(function(err){
    return res.status(500).json({ 
      error: true, 
      message: "Database error"
    });
  });

//   update({}, {
//     $pull: {
//        'widgets.commands._id': req.params.id,
//     },
// });

  // db.Article.deleteOne({
  //   commentList
  // }, (err)=>{
  //   console.log(err);
  // });
});

app.get("/", function(req, res) {
  db.Article.find({}).then((dbArticle)=>{ 
    let mappedArticles = dbArticle.map((p, i)=>{
      let mappedComments = p.commentList.map((q, x)=>{
        q["articleId"] = p._id;
        return q;  
      });      
      p["commentList"] = mappedComments;
      return p 
    })
    mappedArticles.forEach((p,i)=>console.log(p));
    // If we were able to successfully find Articles, send them back to the client
    return res.render("index", {
      articles: dbArticle
    });      
  }).catch((err)=>{
    // If an error occurred, send it to the client
    return res.json(err);
  });
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // db.Article.deleteMany({}, (err)=>{
  //   console.log(err);
  // });
  axios.get("http://www.southernillinoisnow.com/local-news/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".post-content").each(function(i, element) {
      db.Article.create({
          title: $(this).children("h2").children("a").text(),
          content: $(this).children("p").text(),
          url: $(this).children("h2").children("a").attr("href")
        },{
        upsert: true
      }).then(function(dbArticle) {
          console.log(dbArticle);          
        }).catch(function(err) {
          console.log(err);
      });

    });
    res.send("Scrape Complete");
  });
});

// // Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   // Grab every document in the Articles collection
//   db.Article.find({})
//     .then(function(dbArticle) {
//       // If we were able to successfully find Articles, send them back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article.findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

//Route for saving/updating an Article's associated Note
app.post("/comments", function(req, res) {
  let commentId = uuid.v1();
  db.Article.findOneAndUpdate({ 
    _id: req.body.articleId 
  }, { 
    $push: { 
      commentList: {
        message: req.body.message,
        userName: req.body.userName,
        id: commentId
      } 
    }
  }, { 
    new: true 
  }).then(function(newComment){
    return res.json({
      message: req.body.message,
      userName: req.body.userName,
      id: commentId
    });    
  }).catch(function(err){
    return res.status(500).json(err);
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
