const Product = require('../models/product');

exports.products_get_all = (req, res, next) => {
    Product.find().select("name price _id productImage").exec().then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
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
}

exports.products_add_product = (req, res, next) => {
    console.log(req.file);
    const product = new Product({name: req.body.name, price: req.body.price, productImage: req.file.path});

    product.save().then(result => {
        console.log(result);
        res.status(201).json({message: 'Handling POST requests to /products', createdProduct: product});
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}

exports.products_get_product = (req, res, next) => {
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
}

exports.products_patch_product = (req, res, next) => {
    var updateOps = {};

    (req.body).forEach(element => {
        updateOps[element.propname] = element.value;
    });

    Product.updateOne({
        _id: req.params.productId
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
}

exports.products_delete_product = (req, res, next) => {
    const id = req.params.productId;

    Product.findById(req.params.productId).exec().then(doc => {
        if(doc) {
            Product.remove({_id: id}).exec().then(result => {
                res.status(200).json(result);
            }).catch(err => {
                res.status(500).json({error: err});
            });
        } else {
            return res.status(404).json({
                message: 'Not found in database'
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
    /*
    res.status(200).json({
        message: 'Deleted product!'
    });
    */
}