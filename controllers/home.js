module.exports = {
    // Show home page ("/")
    homePage : async (req, res) => {
        try {
            // const posts = await query("SELECT i.id, c.title AS category , u.firstname, u.lastname, i.title, i.content, i.image, i.date, ifnull(count(s.bad), 0) as good_status, ifnull(count(s.good), 0) AS bad_status FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category LEFT OUTER JOIN status AS s ON s.id_item = i.id GROUP BY i.id ORDER BY i.date DESC LIMIT 3")
            const posts = await query("SELECT i.id, c.title AS category, c.id AS id_category , u.firstname, u.lastname, i.title, i.content, i.image, i.date, ifnull(count(s.bad), 0) as bad_status, ifnull(count(s.good), 0) AS good_status, ifnull(count(comment.id), 0) AS comment FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category LEFT OUTER JOIN comment ON comment.id_item = i.id LEFT OUTER JOIN status AS s ON s.id_item = i.id GROUP BY i.id ORDER BY i.date DESC LIMIT 3") 
            const categories = await query("SELECT id, title, image FROM category")
            res.render("home", {categories, posts})
            // res.json({posts, categories})
        } catch(err) {
            res.send(err)
        }
    },
    // Show list post by sport ("/articles/:category")
    listBySport : async (req, res) => {
        const id = req.params.category;
        try {
            const posts = await query("SELECT i.id AS id_post, c.id AS id_category, c.title AS category , u.firstname, u.lastname, i.title, i.content, i.image, i.date, ifnull(count(s.bad), 0) as bad_status, ifnull(count(s.good), 0) AS good_status, ifnull(count(comment.id), 0) AS comment FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category LEFT OUTER JOIN comment ON comment.id_item = i.id LEFT OUTER JOIN status AS s ON s.id_item = i.id WHERE c.id = ? GROUP BY i.id ORDER BY i.date DESC", [id])
            res.render("post-by-category", {posts})
        } catch(err){
            res.send(err)
        }
    },
    // Show only one post ("/articles/:category/:post")
    onePost: async (req, res) => {
        const category = req.params.category;
        const post = req.params.post;
        const userID = req.session.userID
        try {
            if(userID != undefined){
                const posts = await query("SELECT i.id AS id_post, c.title AS category, c.id AS id_category , u.firstname, u.lastname, i.title, i.content, i.image, i.date, ifnull(count(s.bad), 0) as bad_status, ifnull(count(s.good), 0) AS good_status, ifnull(count(comment.id), 0) AS comment FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category LEFT OUTER JOIN comment ON comment.id_item = i.id LEFT OUTER JOIN status AS s ON s.id_item = i.id WHERE c.id = ? AND i.id = ? GROUP BY i.id ORDER BY i.date DESC", [category, post])
                const bad_status = await query("SELECT u.firstname, u.lastname, u.image AS image_profil FROM status AS s INNER JOIN user AS u ON u.id = s.id_user WHERE s.id_item = ? AND s.bad = 1", [post])
                const good_status = await query("SELECT u.firstname, u.lastname, u.image AS image_profil FROM status AS s INNER JOIN user AS u ON u.id = s.id_user WHERE s.id_item = ? AND s.good = 1", [post])

                const urComment = await query("SELECT c.content FROM comment AS c INNER JOIN user AS u ON u.id = c.id_user WHERE c.id_item = ? AND u.id = ?", [post, userID])
                const comment = await query("SELECT u.firstname, u.lastname, u.image AS image_profil, c.content FROM comment AS c INNER JOIN user AS u ON u.id = c.id_user WHERE c.id_item = ? AND u.id <>?", [post, userID])
                console.log(comment);
                console.log(urComment);
                res.render("one-post", {post: posts[0], bad_status, good_status, comment, urComment})
            } else {
                const posts = await query("SELECT i.id AS id_post, c.title AS category, c.id AS id_category , u.firstname, u.lastname, i.title, i.content, i.image, i.date, ifnull(count(s.bad), 0) as bad_status, ifnull(count(s.good), 0) AS good_status, ifnull(count(comment.id), 0) AS comment FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category LEFT OUTER JOIN comment ON comment.id_item = i.id LEFT OUTER JOIN status AS s ON s.id_item = i.id WHERE c.id = ? AND i.id = ? GROUP BY i.id ORDER BY i.date DESC", [category, post])
                const bad_status = await query("SELECT u.firstname, u.lastname, u.image AS image_profil FROM status AS s INNER JOIN user AS u ON u.id = s.id_user WHERE s.id_item = ? AND s.bad = 1", [post])
                const good_status = await query("SELECT u.firstname, u.lastname, u.image AS image_profil FROM status AS s INNER JOIN user AS u ON u.id = s.id_user WHERE s.id_item = ? AND s.good = 1", [post])

                const comment = await query("SELECT u.firstname, u.lastname, u.image AS image_profil, c.content FROM comment AS c INNER JOIN user AS u ON u.id = c.id_user WHERE c.id_item = ?", [post])

                res.render("one-post", {post: posts[0], bad_status, good_status, comment})
            }
        } catch(err){
            res.send(err)
        }
    }
}