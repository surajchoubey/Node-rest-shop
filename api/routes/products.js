const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => { // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, false);
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find().select("name price _id productImage").exec().then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                console.log("OK binod");
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: "GET",
                        url: "http://localhost:3000/products/" + doc._id
                    }
                };
            })
        };
        res.status(200).json(response);
        
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
    /*
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
    */
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({name: req.body.name, price: req.body.price, productImage: req.file.path});

    product.save().then(result => {
        console.log(result);
        res.status(201).json({message: 'Handling POST requests to /products', createdProduct: product});
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).select("name price _id productImage").exec().then(doc => {
        console.log("From MongoDB database: ", doc);
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({message: 'No valid entry found for the provided ID'})
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
    /*
    if(id === 'special') {
        res.status(200).json({
            message: 'You discovered the special ID',
            id: id
        });
    } else {
        res.status(200).json({
            message: 'You passed an ID'
        });
    }
    */
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;

    var updateOps = {};

    console.log(req.body);

    (req.body).forEach(element => {
        updateOps[element.propname] = element.value;
    });

    console.log(updateOps);

    Product.updateOne({
        _id: id
    }, {$set: updateOps}).exec().then(result => {
        console.log(result);
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });

    /*
    // name: req.body.newName,
    // price: req.body.newPrice

    res.status(200).json({
        message: 'Updated product!'
    });
    */
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        res.status(500).json({error: err});
    });
    /*
    res.status(200).json({
        message: 'Deleted product!'
    });
    */
});

module.exports = router;
