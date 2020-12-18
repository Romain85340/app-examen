require('../controllers/auth')

module.exports = {
    checkUser: (req, res, next) => {
        // console.log("session", req.session.userID);
        // console.log("url", req.params.id);
        if(req.session.userID == req.params.id){
            next();
        } else {
            res.redirect("/")
        }
    },
    actionUser: (req, res, next) => {
        if(req.session.userID > 0) {
            next();
        }else {
            res.redirect("/auth/login")
        }
    }
}