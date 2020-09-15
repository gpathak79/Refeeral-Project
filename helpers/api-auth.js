var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
passport.use(new BasicStrategy(
    function (username, password, callback) {
        if (process.env.AUTHUSERNAME === username && process.env.AUTHPASSWORD === password) {
            return callback(null, true);
        } else {
            return callback(null, false);
        }
    }
));
exports.isAuthenticated = passport.authenticate('basic', { session: false });


/*For Token Varify*/
exports.checkToken = (req, res, next) => {

    jwt.verify(req.headers.authtoken, process.env.JWTPASS, function (err, decoded) {
        if (err) {
            return res.status(200).json({
                httpCode: 200,
                code: 302,
                message: 'Please login again.'
            });
        }
        else {
            req.userId = decoded.id;     
            console.log(req.userId) 
            next();
        }
    })

}

/*For Token Varify*/
exports.checkTokenWithoutLogin = (req, res, next) => {
    jwt.verify(req.headers.authtoken, process.env.JWTPASS, function (err, decoded) {
        if (err) {
            req.userId = '';      
            next();
        }
        else {
            req.userId = decoded.id;      
            next();
        }
    })
}

/*Check existence of user id that find through token*/
exports.userExist = (req, res, next) => {

if (req.userId!==''){
    User.find({ '_id': req.userId }).exec(function (err, userec) {
        if (err) {
            console.log('err',err)
            return res.status(CodesAndMessages.invalidTokenHttpCode).json({
                httpCode: CodesAndMessages.invalidTokenHttpCode,
                code: CodesAndMessages.invalidTokenCode,
                message: CodesAndMessages.invalidTokenMessage
            });
        }
        else {
            if (userec.length) {
                                req.userData = userec[0];
                                next();
            } else {
                return res.status(501).json({
                    'code': 401,
                    'httpcode':401,
                    'message': 'User Does Not Exist!'
                });
            }
        }
    })
}else{
                    return res.status(200).json({
                    'code': 501,
                    'message': 'Please login into the application!'
                });
}

}