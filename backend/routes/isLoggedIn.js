function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }    
    res.status(401).json({success: false, postMessage: "unauthorized"})
}
module.exports = isLoggedIn;