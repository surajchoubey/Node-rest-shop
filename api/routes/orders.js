const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const order = require('../models/order');
const checkAuth = require('../middleware/check-auth')

const Order = require('../models/order');
const Product = require('../models/product');

// Handle incoming GET requests to /orders
router.get('/', checkAuth, (req, res, next) => {
    Order.find()
     .select('product quantity _id')
     .populate('product','name price')
     .exec()
     .then(docs => res.status(200).json({
         count: docs.length,
         orders: docs.map(doc => {
             return {
                _id: doc._id,
                product: doc.product,
                quantity: doc.quantity,
                request: {
                    type: 'GET',
                    url: "http://localhost:3000/orders/" +doc._id
                }
             }
         })
     }))
     .catch(err => {
        res.status(500).json({
          error: err
        });
    });
    /*
    res.status(200).json({
        message: 'Ordered were fetched'
    });
    */
});

router.post('/', checkAuth,(req, res, next) => {
    Product.findById(req.body.productId)
     .then(product => {
        if (!product) {
            return res.status(404).json({
              message: "Product not found"
            });
        }
        if(!product) {
            return res.status(404).json({
                message: 'Product not found!'
            });
        }
        const order = new Order({
            quantity: req.body.quantity,
            product: req.body.productId
        });
        return order.save();
     })
     .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order stored!',
            createdOrder: {
               product: result.product,
               quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: "http://localhost:3000/orders/" + result._id
            }
       });
     })
     .catch(err => { 
        console.log(err);
        res.status(500).json({
            message: 'Yes error right here!',
            error: err
        });
     });

    /*
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    }
    */
    /*
    res.status(201).json({
        message: 'Orders were created',
        order: order
    });
    */
});

router.get("/:orderId", checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
      .populate('product','name price')
      .exec()
      .then(order => {
        if (!order) {
          return res.status(404).json({
            message: "Order not found"
          });
        }
        res.status(200).json({
          order: order,
          request: {
            type: "GET",
            url: "http://localhost:3000/orders"
          }
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
    /*
    res.status(200).json({
        message: 'Ordered details',
        orderId: req.params.orderId
    });
    */
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    Order.remove({_id: req.params.orderId })
    .exec()
    .then(result => {
        res.status(200).json({
           message: "Order deleted",
           request: {
             type: "DELETE",
             url: "http://localhost:3000/orders/",
             body: { productId: "ID", quantity: "Number"}
           }
        });
    })
    .catch(err => {
       res.status(500).json({
           error: err
       });
    });

    /*
    res.status(200).json({
        message: 'Ordered deleted',
        orderId: req.params.orderId
    });
    */
});


module.exports = router;