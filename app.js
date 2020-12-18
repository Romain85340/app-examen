////// Dependance ///////
const express = require('express');
const mysql = require('mysql');
const util = require('util');
const fileUpload = require('express-fileupload');
const path = require('path');
const session = require('express-session')
require('dotenv').config();
const methodOverride = require('method-override');
const flash = require('connect-flash');
const PORT = 3000;

// Express
const app = express()
// Body parser
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
// Express static
app.use(express.static(path.join(__dirname, './public')));
// File Upload
app.use(fileUpload());
// Express-session
app.use(session({
    secret: 'shhuuuuut',
    resave: false,
    saveUninitialized: true,
    name: 'biscuit',
    cookie: {   maxAge: 24 * 60 * 60 * 7 * 1000 }
  }));
// MySQL
var connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE
  });
connection.connect(() => {
    console.log("Connectez à la base de donnée");
});
const query = util.promisify(connection.query).bind(connection);
global.connection = connection;
global.query = query;
// EJS
app.set('view engine', 'ejs');
// Method Override
app.use(methodOverride('_method'))
// Connect flash
app.use(flash());


///// Middleware ////////
const { checkUser, actionUser } = require('./middleware/auth')

///// Controllers ///////
// All access
const { homePage,
        listBySport,
        onePost } = require("./controllers/home")
// User power
const { createItem,
        getUserPage,
        commentItem,
        like, 
        dislike,
        deleteItem,
        deleteComment,
        editItem,
        editProfileUser,
        editImageUser,
        editPasswordUser,
        userDeleteAccount,
        deleteLikeOrDislike } = require("./controllers/user")
// Authentification
const { getRegister,
        register,
        login,
        getLogin,
        logout } = require("./controllers/auth")
// Admin power
const { showAllUser,
        statusUser,
        statusItem,
        adminDeleteItem,
        showItem,
        adminCreateItem,
        getListComment,
        getListUserReview,
        adminCreateCategory,
        adminDeleteCategory,
        adminUpdateCategory } = require("./controllers/admin")


////// Session //////
app.use(function(req, res, next){
  const userID = req.session.userID
  const roleID = req.session.roleID
  const userNAME = req.session.userNAME
  const userLASTNAME = req.session.userLASTNAME
  const userIMG = req.session.image

  res.locals.userSession = {userID, roleID, userNAME, userLASTNAME, userIMG}
  // console.log(res.locals.userSession);
  next();
})


/////// Routes ////////
// All Access
app.get("/", homePage) // Show home page
app.get("/articles/:category", listBySport) // Show list post by sport
app.get("/articles/:category/:post", onePost) // Show only one post
// Authentication
app.get("/auth/register", getRegister) // Get register page
app.post("/auth/register", register) // Register account
app.get("/auth/login", getLogin) // Get login page
app.post("/auth/login", login) // User login
app.get("/auth/logout", logout) // Disconnect user
// User area/power
app.get("/user/:id", checkUser, getUserPage) // Show user page
app.delete("/user/:id", actionUser, userDeleteAccount) // User delete account
app.post("/user/item/:id", actionUser, createItem) // User add post
app.put("/user/edit/item/:id", actionUser, editItem) // User edit post
app.put("/user/edit/profil/:id", actionUser, editProfileUser) // User edit profile
app.put("/user/edit/profil/:id/image", actionUser, editImageUser) // User edit image profile
app.put("/user/edit/profil/:id/password", actionUser, editPasswordUser) // User edit password
app.post("/comment/:id", actionUser, commentItem) // Comment one post
app.delete("/user/item/:id", actionUser, deleteItem) // User delete post
app.delete("/user/comment/:id", actionUser, deleteComment) // User delete comment
app.get("/like/:id", actionUser, like) // Like post
app.get("/dislike/:id", actionUser, dislike) // Dislike post
app.get("/delete-status/:id", deleteLikeOrDislike) // Delete status of this post
// Admin power/Area
app.get("/admin/user", showAllUser) // Display list user
app.get("/admin/item", showItem) // Display list item
app.post("/admin/item", adminCreateItem) // Create post
app.post("/admin/category", adminCreateCategory) // Create category
app.get("/admin/user/:id/status", statusUser) // Switch status user block/unblock
app.get("/admin/item/:id/status", statusItem) // Switch status post visible/unvisible
app.delete("/admin/delete/item/:id", adminDeleteItem) // Delete one post
app.delete("/admin/category/:id", adminDeleteCategory) // Delete a category
app.get("/admin/item/:id/comment", getListComment) // Show list of comment of item
app.get("/admin/item/:id/user-review", getListUserReview) // Show list of like and dislike of item
app.put("/admin/category/edit/:id", adminUpdateCategory) // Admin update category


/////// Serveur /////////
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur le port ${PORT}`);
})