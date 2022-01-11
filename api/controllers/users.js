const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.users_get_all = (req, res, next) => {
    User.find().exec().then(users => {
        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(200).json({message: 'Database empty!'});
        }
    }).catch(err => {
        console.log(err);
        res.status(404).json({error: err});
    });
}

module.exports.users_login_user = (req, res, next) => {
    User.find({email: req.body.email}).exec().then(user => {
        if (user.length < 1) {
            return res.status(401).json({message: 'Invalid email ID!'});
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({message: 'Auth failed'});
            }
            if (result) {
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                }, process.env.JWT_KEY, {expiresIn: '1h'});
                return res.status(200).json({message: 'Auth successful', token: token});
            }
            res.status(401).json({message: 'Auth failed'});
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}

module.exports.users_signup_user = (req, res, next) => {
    User.find({email: req.body.email}).exec().then(user => {
        if (user.length >= 1) {
            return res.status(409).json({message: "Email already exists!"});
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({error: err});
                } else {
                    user = new User({email: req.body.email, password: hash});
                    user.save().then(result => {
                        console.log(result);
                        res.status(201).json({message: 'User created'});
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({error: err});
                    });
                }
            });
        }
    });
}

module.exports.users_delete_user = (req, res, next) => {

    User.find({_id: req.params.userId}).exec().then(result => {
        if (result < 1) {
            return res.status(404).json({message: 'Not found in database'})
        } else {
            User.remove({_id: req.params.userId}).exec().then(result => {
                res.status(200).json({message: "User deleted"});
            })
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}