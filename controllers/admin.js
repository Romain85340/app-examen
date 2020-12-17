const fileUpload = require("express-fileupload");

module.exports = {
    // Display list user ("/admin/user")
    showAllUser: async (req, res) => {
        try {
            const users = await query(`SELECT u.firstname, u.lastname, DATE_FORMAT(u.birthday, "%d/%m/%Y") AS birthday, u.email, u.image, r.name FROM user AS u INNER JOIN role AS r ON r.id = u.id_role`)
            res.json({ users })
        } catch(err){
            res.send(err)
        }
    },
    // Switch status user block/unblock ("/admin/user/:id/status")
    statusUser: async (req, res) => {
        const id = req.params.id;

        try {
            const switchStatus = await query("SELECT status FROM user WHERE id = ?", [id])
            if(switchStatus[0].status === 2){
                await query("UPDATE user SET status = 1 WHERE id = ?", [id])
            } else if (switchStatus[0].status === 1) {
                await query("UPDATE user SET status = 2 WHERE id = ?", [id])
            }
            res.json(switchStatus)

        }catch(err){
            res.send(err)
        }
    },
    // Switch status post visible/unvisible ("/admin/item/:id/status")
    statusItem: async (req, res) => {
        const id = req.params.id

        try {
            const switchStatus = await query("SELECT status FROM item WHERE id = ?", [id])
            if(switchStatus[0].status === 0){
                await query("UPDATE item SET status = 1 WHERE id = ?", [id])
            } else if (switchStatus[0].status === 1) {
                await query("UPDATE item SET status = 0 WHERE id = ?", [id])
            }
            res.json(switchStatus)
        } catch(err){
            res.send(err)
        }
    },
    // Delete one post ("/admin/delete/item/:id")
    adminDeleteItem: (req, res) => {
        const id = req.params.id
        const queryDB = "DELETE FROM item WHERE id = ?"

        connection.query(queryDB, [id], (error, results) => {
              if(error){
                  res.send(error)
              } else {
                  res.json("L'article à bien été supprimé")
              }
            }
        );
    },
    // Display list item ("/admin/item")
    showItem: async (req, res) => {
        try {
            const items = await query("SELECT i.id, c.title AS category , u.firstname, u.lastname, i.title, i.content, i.image, i.date FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category")
            res.json({items})
        } catch(err){
            res.send(err)
        }
    },
    // Create post ("/admin/item")
    adminCreateItem: async (req, res) => {
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
                            const post = await query("INSERT INTO item (title, content, image, date, id_user, id_category, status) VALUES (?, ?, ?, now(), ?, 3, 1)", [title, content, image, id_category])
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
    // Show list of comment of item ("/admin/item/:id/comment")
    getListComment: (req, res) => {
        const id = req.params.id
        const queryDB = "SELECT u.firstname, u.lastname, c.content FROM comment AS c INNER JOIN user AS u ON u.id = c.id_user WHERE c.id_item = ?"

        connection.query(queryDB, [id], (error, results) => {
            if(error){
                res.send(error)
            } else {
                console.log(results);
                res.json(results)
            }
          }
        );
    },
    // Show list of like and dislike of item ("/admin/item/:id/user-review")
    getListUserReview: async (req, res) => {
        const id = req.params.id

        try {
            const dislike = await query("SELECT i.title, u.firstname, u.lastname, s.user_review FROM status AS s INNER JOIN item AS i ON i.id = s.id_item INNER JOIN user AS u ON u.id = s.id_user WHERE s.user_review = 2 AND s.id_item = ?", [id])
            const like = await query("SELECT i.title, u.firstname, u.lastname, s.user_review FROM status AS s INNER JOIN item AS i ON i.id = s.id_item INNER JOIN user AS u ON u.id = s.id_user WHERE s.user_review = 1 AND s.id_item = ?", [id])
            res.json({dislike, like})
        } catch(err){
            res.send(err)
        }
    },
    // Admin create category ("/admin/category")
    adminCreateCategory: async (req, res) => {
        const title = req.body.title
        const content = req.body.content
        
        if(!title || !content){
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
                            await query("INSERT INTO category (title, content, image, date, id_user) VALUES (?, ?, ?, NOW(), 20)", [title, content, image])
                            res.json("La categorie à bien été ajoutée")
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
    adminDeleteCategory: (req, res) => {
        idCategory = req.params.id
        queryDB = "DELETE FROM category WHERE id = ?"

        connection.query(queryDB, [idCategory], (error) => {
            if(error){
                res.send(error)
            } else {
                res.json("La categorie à bien été supprimé")
            }
          }
        );
    },
    // Edit category ('/admin/category/edit/:id')
    adminUpdateCategory: (req, res) => {
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
                    await query("UPDATE category SET image = ? WHERE id = ?", [image, id])
                    res.json("L'image de la categorie à bien été modifier")
                } catch(err) {
                    res.send(err)
                }
            });
        }}
    }
}