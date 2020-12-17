const bcrypt = require('bcrypt');

module.exports = {
    getLogin: (req, res) => {
        res.render("login")
    },
    // Display register page
    getRegister: (req, res) => {
        res.render("register-account")
    },
    // Register account ("/auth/register")
    register: async (req, res) => {
        // var for request form
        let firstname = req.body.firstname
        let lastname = req.body.lastname
        let birthday = req.body.birthday
        let email = req.body.email
        let password = req.body.password
        let password2 = req.body.password2
        // request SQL in const for use after
        const emailQuery = "SELECT email FROM user WHERE email = '" + email + "';"

    if (!firstname || !lastname || !birthday || !email || !password || !password2 || !req.files) {
        res.json("Remplissez tous les champs")
    }
    // if password confirmation is correct
    else if(password === password2){
        try {
            const resultEmail = await query(emailQuery)
            // if the request have a result
            if(resultEmail.length > 0){
                res.json("Le compte existe deja")
            } else {
                let imageUpload = req.files.image
                let image = `/images/${imageUpload.name}`

                imageUpload.mv(`public/images/${imageUpload.name}`, async function(err) {
                    if (err){
                        return res.status(500).send(err);
                    }
                    try{
                        // use method hash of bcrypt for hash the password in form and insert in SQL 
                        bcrypt.hash(password, 10, async (err, hash) => {
                            await query ("INSERT INTO user (image, firstname, lastname, birthday, email, password, id_role) VALUES (?, ?, ?, ?, ?, ?, 1)", [image, firstname, lastname, birthday, email, hash]);
        
                            if(!err){
                                res.json("Vous etes enregistrer") 
                            } else {
                                res.send(err)
                            }
                        })
                    }catch(err) {
                        res.send(err)
                    }
                })    
            }
        } catch(err) {
            res.send(err)
        }
    } else{
        res.json("Les mots de passe ne sont pas identique")
    }
    },
    // User login ("/auth/login")
    login: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        // Request SQL for check if the email exists in the database
        connection.query('SELECT firstname, lastname, email, password, id_role, id, image, status FROM user WHERE email= ?', [email], (err, result) => {
            if (err || result.length === 0) {
                res.json("vous n etes pas inscrit")
            } else {
                // use compare method of bcrypt for compare the password insert on the form and the password in my DB
                bcrypt.compare(password, result[0].password, (err, success) => {
                    if (err) {
                        res.json("Mot de passe incorrect")
                    }
                    if (success) {
                        if(result[0].status === 0) {
                            console.log(result[0].status);
                            res.json("votre compte est bloqué")
                        } else {
                            // if email and password is correct, select this user 
                            connection.query('SELECT firstname, lastname, birthday, email, id_role, id, image FROM user WHERE email = ? AND password = ?', [email, result[0].password], function (err, results) {
                                if (results.length) {
                                    // if there is a result, insert in session:
                                    req.session.loggedin = true;
                                    req.session.userNAME = result[0].firstname;
                                    req.session.userLASTNAME = result[0].lastname;
                                    req.session.userID = result[0].id;
                                    req.session.roleID = result[0].id_role;
                                    req.session.image = result[0].image;
                                    // console.log("session",  req.session);
                                
                                    // res.json("Vous etes connecté")
                                    res.redirect("/")
                                
                                } else {
                                    res.send(err)
                                }
                            });
                        }
                    } else {
                        res.json("Email ou mot de passe incorrect")
                    }
                })
            }
        })
    },
    // Disconnect user
    // Callback for disconnect user
    logout: (req, res) => {
        req.session.destroy()
        res.redirect("/")
    }
}