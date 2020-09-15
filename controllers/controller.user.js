
exports.Registration = (req, res) => {
    try {
        //Check mobile no. in database
        const mobileCheck = new Promise( (resolve, reject) => {
            User.find({'mobile': req.body.mobile}, (err, results) => {
                if(err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {

                    results.length ? reject({ 'message': 'Mobile Number already Registered', 'code': 210,"httpCode":200}): resolve(1) 
                }

            });
        });
        //check email in database
        const emailCheck = new Promise( (resolve, reject) => {
            User.find({'email': req.body.email}, (err, results) => {
                if(err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {
                    results.length ?  reject({ 'message': 'Email already Registered', 'code': 210,"httpCode":200}):resolve(1)
                }
            });
        });
        Promise.all([mobileCheck, emailCheck]).then(() => {
            var random=randomstring.generate(5);
            console.log(random)

            
            //Generate Hash Password ANd Compare When Login
            bcrypt.hash(req.body.password,10, (err, hash) => {
              
                if(err) {
                    res.send({'code':400,'message':'User Error.','data':""});
                } else {
                    User.create({
                        "referalcode":random,
                        "name": req.body.name,
                        "email": req.body.email,
                        "password": hash,
                        "gender":req.body.gender,
                        "mobile":req.body.mobile,
                        "countryCode": req.body.countryCode,
                    }, (err, results) => {
                        if(err) {
                            if(err) 
                            {
                            return res.send({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                            }
                        } else {
                            res.send({'code':200,'message':'Sucess.','data':results});
                        }
                    });
                }
            })
        }).catch(function (err) {
                        console.log('errerrerrerr', err)
                        res.status(err.httpCode).json(err);
                    }); 
    } catch (err) {
        res.status(500).json({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage });
        console.log('catch login', err);
    }
}

//Login User
exports.Login = (req, res) => {
    try {
        /* check user mobile in database*/
        var mobileCheck = new Promise(function (resolve, reject) {
            User.find({'email': req.body.email}, function (err, results) {
                console.log(results);
                if (err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {
                    !results.length ? reject({ 'message': "Email Not Found", 'code': CodesAndMessages.notFoundCode, "httpCode": CodesAndMessages.HttpCode }) : resolve(results[0]);
                }   
            })
        });
        Promise.all([mobileCheck]).then(function (results) {
            bcrypt.compare(req.body.password, results[0].password, function(err, bcrypt_res) {
                console.log(bcrypt_res)
                if(err) return res.send({httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage,'data':[]});
                if(bcrypt_res)
                {
                    var token = jwt.sign({
                        id: results[0]._id
                    }, process.env.JWTPASS, {
                            expiresIn: process.env.JWTEXPIRETIME
                        });
                    res.send({'code':200,'message':'Sucess.','data':results[0],"auth":token});
                }
                else {
                    res.send({'code':410,'message':'Invalid Username or Password'});
                }
            });
        }).catch(function (err) {
            console.log('errerrerrerr', err)
            res.status(err.httpCode).json(err);
        });        
    } catch (e) {
        res.status(500).json({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage });
        console.log('catch login', e);
    }
}

//ReferUser
exports.ReferUser = (req, res) => {
    try {
        /* check user mobile in database*/
        var userCheck = new Promise(function (resolve, reject) {
            User.find({'_id': req.userId}, function (err, results) {
                console.log(results);
                if (err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {
                    !results.length ? reject({ 'message': "User Not Found", 'code': CodesAndMessages.notFoundCode, "httpCode": CodesAndMessages.HttpCode }) : resolve(results[0]);
                }   
            })
        });
        var refcodeCheck = new Promise(function (resolve, reject) {
            User.find({'referalcode': req.body.refcode}, function (err, results) {
                console.log(results);
                if (err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {
                    !results.length ? reject({ 'message': "User Not Found", 'code': CodesAndMessages.notFoundCode, "httpCode": CodesAndMessages.HttpCode }) : resolve(results[0]);
                }   
            })
        });
        //User Existence CHECK
        var refuserexistCheck = new Promise(function (resolve, reject) {
            User.find({'referalcode': req.body.refcode}, function (err, results) {
                console.log(results);
                if (err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {
                    User.find( { $and: [ { '_id': results[0]._id}, { "refIds": { $eq: req.userId } }  ] }
,                function (err, response) {
                        console.log(response);
                        if (err) {
                            reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                        } else {
                           console.log('checkuser',results)
                            response.length ? reject({ 'message': "User Already Rewared By This Code", 'code': CodesAndMessages.notFoundCode, "httpCode": CodesAndMessages.HttpCode }) : resolve(1);
                        }   
                    })
                }   
            })
        });
        //find holiday
        var findHoliday = new Promise(function (resolve, reject) {
               //find national holiday from date of day
             var d = new Date();
            var month = d.getUTCMonth() + 1; // Since getUTCMonth() returns month from 0-11 not 1-12
            var year = d.getUTCFullYear();
            console.log(year, month)
               let url = `https://holidays.abstractapi.com/v1/?api_key=b695e2eed9e54d638f77745cb6f526a9&country=IN&year=${year}&month=${month}&day=${dayofmonth()}`;
               let options = { json: true };
               request(url, options, (error, res, body) => {
                   if (error) {
                       return console.log(error)
                   };
                   if (!error && res.statusCode == 200) {
                    if(body[0])
                    {
                       resolve(body[0])
                    }
                    else
                    {
                        resolve([])
                    }
                   };
               });
        });
        Promise.all([userCheck,refcodeCheck,refuserexistCheck,findHoliday]).then(function (results) {
            //When There Will Be No Holiday
            if(results[3].length==0)
            {
            var today = new Date();
            var day = today.getDay();
            var daylist = ["Sunday", "Monday", "Tuesday", "Wednesday ", "Thursday", "Friday", "Saturday"];
          console.log( daylist[day])
        //   refbonus
            if(daylist[day]=="Sunday"||daylist[day]=="Saturday")
            {

                if(results[1].count<3)
                {
                    var Increment={ "count": 1,"refbonus": 20 } 
                    var refIds={"refIds":results[0]._id }
                }
                else
                {
                    var Increment={ "count": 1,"refbonus": 10 } 
                    var refIds={"refIds":results[0]._id }

                }
                //When Count Equal To 3 They Will Get 20
            }
            //Weekdays
            else
            {
                if(results[1].count<2)
                {
                    var Increment={ "count": 1,"refbonus": 40 } 
                    var refIds={"refIds":results[0]._id }
                }
                else
                {
                    var Increment={ "count": 1,"refbonus": 20 } 
                    var refIds={"refIds":results[0]._id }

                }
            }
        }
        else
        {
            //When There Will Be Holiday Amount Will Be Double For Every User
                var Increment={ "refbonus": 80 } 
                    var refIds={"refIds":results[0]._id }

        }
            User.update(
                { "_id": results[1]._id },
                { $inc:  Increment  }
                , { new: true }, (err, result) => {
                    if (err) {
                        return res.send({ "httpCode": CodesAndMessages.dbErrHttpCode, "code": CodesAndMessages.dbErrCode, "message": CodesAndMessages.dbErrMessage });
                    }
                    else {
                        //Update On User And Store Parent Id
                        User.update(
                            { "_id": req.userId },
                            { $set:  {"parentId":results[1]._id} }
                            , { new: true }, (err, result) => {
                                if (err) {
                                    return res.send({ "httpCode": CodesAndMessages.dbErrHttpCode, "code": CodesAndMessages.dbErrCode, "message": CodesAndMessages.dbErrMessage });
                                }
                                else {
                                    //
                                }
                            })
                        //Update On Parent User
                        User.update(
                            { "_id": results[1]._id },
                            { $push:  refIds }
                            , { new: true }, (err, result) => {
                                if (err) {
                                    return res.send({ "httpCode": CodesAndMessages.dbErrHttpCode, "code": CodesAndMessages.dbErrCode, "message": CodesAndMessages.dbErrMessage });
                                }
                                else {
                                    res.send({ 'code': 200, 'httpcode': 200, 'message': "Sucess" })
                                }
                            })
                    }
                })

        }).catch(function (err) {
            console.log('errerrerrerr', err)
            res.status(err.httpCode).json(err);
        });        
    } catch (e) {
        res.status(500).json({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage });
        console.log('catch login', e);
    }
}

//List Of Parent 
exports.ParentList = (req, res) => {
    try {
     
        var userCheck = new Promise(function (resolve, reject) {
            User.find({'_id': req.userId}, function (err, results) {
                console.log(results);
                if (err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {
                    !results.length ? reject({ 'message': "User Not Found", 'code': CodesAndMessages.notFoundCode, "httpCode": CodesAndMessages.HttpCode }) : resolve(results[0]);
                }   
            })
        });
        Promise.all([userCheck]).then(function (results) {
            
           
            User.find({ '_id': results[0].parentId }).select('name email gender countryCode mobile').lean().exec(function (err, response) {
                if (err) {
                    res.send({"code":200,"httpcode":200,"message":"No Parent Found",})
                } else {
                    res.send({"code":200,"httpcode":200,"message":"sucess","data":response[0]})
                }
            });
        
        }).catch(function (err) {
            console.log('errerrerrerr', err)
            res.status(err.httpCode).json(err);
        });        
    } catch (e) {
        res.status(500).json({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage });
        console.log('catch login', e);
    }
}

//Children List
exports.ChildList = (req, res) => {
    try {

        var userCheck = new Promise(function (resolve, reject) {
            User.find({'_id': req.userId}, function (err, results) {
                console.log(results);
                if (err) {
                    reject({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage })
                } else {
                    !results.length ? reject({ 'message': "User Not Found", 'code': CodesAndMessages.notFoundCode, "httpCode": CodesAndMessages.HttpCode }) : resolve(results[0]);
                }   
            })
        });
        Promise.all([userCheck]).then(function (results) {
          
            User.find({ _id: { $in: results[0].refIds} },).select('name email gender countryCode mobile').lean().exec(function (err, response) {
                if (err) {
                    res.send({
                        "httpCode": CodesAndMessages.HttpCode,
                        "code": CodesAndMessages.notFoundCode,
                        "message": CodesAndMessages.notFoundMessage
                    })
                } else {
                    res.send({"code":200,"httpcode":200,"message":"sucess","data":response})
                }
            });
       
        }).catch(function (err) {
            console.log('errerrerrerr', err)
            res.status(err.httpCode).json(err);
        });        
    } catch (e) {
        res.status(500).json({ httpCode: CodesAndMessages.dbErrHttpCode, code: CodesAndMessages.dbErrCode, message: CodesAndMessages.dbErrMessage });
        console.log('catch login', e);
    }
}



