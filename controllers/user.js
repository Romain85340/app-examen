const bcrypt = require('bcrypt');
const fileUpload = require("express-fileupload");

module.exports = {
    // User add post ("/user/item/:id")
    createItem: async (req, res) => {
        const id = req.params.id
        const title = req.body.title
        const content = req.body.content
        const id_category = req.body.category
        
        if(!title || !content || !id_category ){
            res.json("Remplissez tout les champs")
        } else {
            if(!req.files){
                res.json("Ajouter une image a votre article")
            } else {
                let imageUpload = req.files.image
                let image = `/images/${imageUpload.name}`

                if(imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png"){
                    imageUpload.mv(`public/images/${imageUpload.name}`, async function(err){
                        if(err){
                            res.send(err)
                        }
                        try {
                            const post = await query("INSERT INTO item (title, content, image, date, id_user, id_category, status) VALUES (?, ?, ?, now(), ?, ?, 0)", [title, content, image, id, id_category])
                            res.json({post})
                        }catch(err){
                            res.send(err)
                        }
                    })
                } else {
                    res.json("L'image n'a pas le format adequate")
                }
            }
        }
    },
    // User delete post ("/user/item/:id")
    deleteItem: async (req, res) => {
        const id = req.params.id;

        try {
            await query("DELETE FROM item WHERE id = ? AND id_user = 3", [id])
            res.json("L'article à bien été supprimé")
        } catch(err){
            res.send(err)
        }
    },
    // User edit post ("/user/edit/item/:id")
    editItem: async (req, res) => {
        const id = req.params.id
        const title = req.body.title
        const content = req.body.content

        if(!title || !content){
            res.json("Remplissez tout les champs")
        }
        if(!req.files){
            try{
                await query("UPDATE item SET title = ?, content = ?, date = now(), status = 0 WHERE id = ?", [title, content, id])
                res.json("Article à bien été mis à jour mais pas l'image")
            } catch(err){
                res.send(err)
            }
        }
        let imageUpload = req.files.image
        let image = `/images/${imageUpload.name}`

        if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {
            imageUpload.mv(`public/images/${imageUpload.name}`, async function(err) {
                if (err){
                    return res.status(500).send(err);
                }
                try{
                    await query("UPDATE item SET image = ?, title = ?, content = ?, date = now(), status = 0 WHERE id = ?",[image, title, content, id])
                    res.json("L'article à bien été mis a jour ainsi que l'image")
                }catch(err) {
                    res.send(err)
                }
            });
        }
    },
    // Show user page ("/user/:id")
    getUserPage: async (req, res) => {
        const id = req.params.id;

        try {
            const posts = await query("SELECT i.id AS id_post, c.title AS category ,u.id, u.firstname, u.lastname, i.title, i.content, i.image, i.date, ifnull(count(s.bad), 0) as bad_status, ifnull(count(s.good), 0) AS good_status, ifnull(count(comment.id), 0) AS comment FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category LEFT OUTER JOIN comment ON comment.id_item = i.id LEFT OUTER JOIN status AS s ON s.id_item = i.id WHERE u.id = ? GROUP BY i.id ORDER BY i.date DESC", [id])
            const profil = await query("SELECT firstname, lastname, DATE_FORMAT(birthday, '%d/%m/%Y') AS birthday, email, image FROM user WHERE id = ?", [id])
            // res.json({post, profil})
            console.log(posts);
            res.render("user-area", {profil: profil[0], posts})
        } catch(err){
            res.send(err)
        }
    },
    // Comment one post ("/comment/:id")
    commentItem: async (req, res) => {
        const idItem = req.params.id;
        const content = req.body.comment

        try {
            const comment = await query("INSERT INTO comment (content, id_user, id_item) VALUES (?, 3, ?)", [content, idItem])
            res.json("Votre commentaire a bien été ajouté")
        } catch(err){
            res.send(err)
        }
    },
    // User delete comment ("/user/comment/:id")
    deleteComment: async (req, res) => {
        const id = req.params.id
        try {
            await query("DELETE FROM comment WHERE id = ?", [id])
            res.json("Ton commentaire est supprimé")
        } catch(err){
            res.send(err)
        }
    },
    // Like post ("/like/:id")
    like : async (req, res) => {
        const idItem = req.params.id

        try {
            const checkLike = await query("SELECT id_user, id_item, bad, good FROM status WHERE id_item = ? AND id_user = 2", [idItem])
            console.log(checkLike.length);
            if(checkLike.length === 0){
                const like = await query("INSERT INTO status (good, id_user, id_item) VALUES (1,2,?)", [idItem])
                console.log(like);
                res.json("Vous venez de liker l'item")
            }
            else if(checkLike[0].bad === 1){
                const changeForLike = await query("UPDATE status SET bad = 0, good = 1 WHERE status.id_item = ?  AND status.id_user = 2", [idItem])
                console.log(changeForLike);
                res.json("Vous venez de liker l'item")
            } else {
                res.json("Vous avez deja liker cette item")
            }
        } catch(err){
            res.send(err)
        }
    },
    // Dislike post ("/dislike/:id")
    dislike : async (req, res) => {
        const idItem = req.params.id
        
        try {
            const checkDislike = await query("SELECT id_user, id_item, bad, good FROM status WHERE id_item = ? AND id_user = 2", [idItem])
            console.log(checkDislike);
            if(checkDislike.length === 0){
                await query("INSERT INTO status (bad, id_user, id_item) VALUES (1,2,?)", [idItem])
                res.json("Vous venez de disliker l'item")
            }
            else if(checkDislike[0].good === 1){
                await query("UPDATE status SET bad = 1, good = 0 WHERE status.id_item = ?  AND status.id_user = 2", [idItem])
                res.json("Vous venez de disliker l'item")
            } else {
                res.json("Vous avez deja disliker l'item")
            }
        } catch(err){
            // res.send(err)
            res.json("bug")
        }
    },
    // User edit profile ("/user/edit/profil/:id")
    editProfileUser: async (req, res) => {
        const id = req.params.id
        const { firstname, lastname, birthday, email } = req.body

        try{
            await query("UPDATE users SET firstname = ?, lastname = ?, email = ?, birthday = ? WHERE id = ?", [firstname, lastname, email, birthday, id])
            res.json("Le profil à été mis a jour")  
        } catch(err) {
            res.send(err)
        }
    },
    // User edit image profile ("/user/edit/profil/:id/image")
    editImageUser: async (req, res) => {
        const id = req.params.id

        if (!req.files){
            res.json("Selectionner une image")
        } else {
    
        let imageUpload = req.files.image
        // var for upload name image in mySQL
        let image = `/images/${imageUpload.name}` 
            
            
        // if the image has the correct format
        if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {
            // Use the mv() method to place the file somewhere in NodeJS
            imageUpload.mv(`public/images/${imageUpload.name}`, async function(err) {
                if (err){
                    return res.status(500).send(err);
                }
                try{
                    await query("UPDATE user SET image = ? WHERE id = ?", [image, id])
                    res.json("L'image du profil à bien été modifier")
                } catch(err) {
                    res.send(err)
                }
            });
        }}
    },
    // User edit password ("/user/edit/profil/:id/password")
    editPasswordUser: (req, res) => {
        const id = req.params.id
        password = req.body.password
        password2 = req.body.password2

        if(!password || !password2){
            res.json("Remplissez tout les champs")
        } else if(password !== password2) {
            res.json("Les mots de passe ne sont pas identiques")
        } else {
            bcrypt.hash(password, 10, async (err, hash) => {
                if(err){
                    res.send(err)
                }
                try {
                    await query("UPDATE user SET password = ? WHERE id = ?", [hash, id])
                    res.json("Le mot de passe à bien été mis a jour")
                } catch(err){
                    res.send(err)
                }
            });
        }
        
    },
    // User delete account ("/user/:id")
    userDeleteAccount: (req, res) => {
        const id = req.params.id
        const queryDB = "DELETE FROM user WHERE id = ?"

        connection.query(queryDB, [id], function (err) {
            if(err){
                res.send(err)
            } else {
                res.json("Le compte a bien été supprimé")
            }
        });
    }
}