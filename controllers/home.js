module.exports = {
    // Show home page ("/")
    homePage : async (req, res) => {
        try {
            const posts = await query("SELECT i.id, u.firstname AS author_firstname, u.lastname AS author_lastname, i.title, c.title AS category, i.content, i.image, i.date FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category ORDER BY date DESC LIMIT 3")
            const categories = await query("SELECT title FROM category")
            res.json({posts, categories})
        } catch(err) {
            res.send(err)
        }
    },
    // Show list post by sport ("/articles/:id")
    listBySport : async (req, res) => {
        const id = req.params.id;
        try {
            const posts = await query("SELECT i.id, c.title AS category , u.firstname, u.lastname, i.title, i.content, i.image, i.date FROM item AS i INNER JOIN user AS u ON u.id = i.id_user INNER JOIN category AS c ON c.id = i.id_category WHERE id_category = ?", [id])
            res.json({posts})
        } catch(err){
            res.send(err)
        }
    }
}