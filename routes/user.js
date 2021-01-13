const express = require('express');
const router = express.Router();

// Callback
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
    deleteLikeOrDislike 
} = require("../controllers/user")

// Middleware
const { checkUser } = require("../middleware/auth")

// Request
router.route("/:id").get(getUserPage).delete(userDeleteAccount) // Show user page & User delete account
router.route("/item/:id").post(createItem) // User add post
router.route("/edit/item/:id").put(editItem) // User edit post
router.route("/edit/profil/:id").put(editProfileUser) // User edit profile
router.route("/edit/profil/:id/image").put(editImageUser) // User edit image profile
router.route("/edit/profil/:id/password").put(editPasswordUser) // User edit password
router.route("/comment/:id").post(commentItem) // Comment one post
router.route("/item/:id").delete(deleteItem) // User delete post
router.route("/comment/:id").delete(deleteComment) // User delete comment
router.route("/like/:id").get(checkUser, like) // Like post
router.route("/dislike/:id").get(checkUser, dislike) // Dislike post
router.route("/delete-status/:id").get(deleteLikeOrDislike) // Delete status of this post

module.exports = router