const {
  models: { Order_items, Order_details, Cart_item, Product, User, Discount },
} = require('../models');

const sequelize = require('sequelize');
// status in Order_details need to be enum - to choose
// provider ?

class orderController {
  // [GET] /get-all-orders - author: admin
  // get information of all orders
  //
  async getAllOrders(req, res, next) {
    try {
      const Orders = await Order_details.findAll({
        attributes: ['total', 'provider', 'status', 'created_at'],
        include: [
          {
            model: User,
            attributes: ['name', 'telephone'],
          },
          {
            model: Order_items,
            attributes: ['quantity'],
            include: {
              attributes: ['name', 'image'],
              model: Product,
              attributes: [
                ['id', 'product_id'],
                'name',
                'image',
                'price',
                [sequelize.literal('price*(1-discount_percent)'), 'salePrice'],
              ],
              include: {
                model: Discount,
                attributes: [],
              },
            },
          },
        ],
      });
      if (Orders.length) {
        return res.status(200).json({
          Orders: Orders,
        });
      } else {
        return res.json({
          msg: "User's order is empty!",
        });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
  // [GET] /order-by-user
  async getOrderByUser(req, res, next) {
    try {
      const user_id = req.session.userId;
      const Orders = await Order_details.findAll({
        attributes: ['total', 'provider', 'status', 'created_at'],
        include: {
          model: Order_items,
          attributes: ['quantity'],
          include: {
            model: Product,
            attributes: [
              'name',
              'image',
              'price',
              [sequelize.literal('price*(1-discount_percent)'), 'salePrice'],
            ],
            include: {
              model: Discount,
              attributes: [],
            },
          },
        },
        where: { user_id },
      });
      if (Orders.length) {
        return res.status(200).json({
          Orders: Orders,
        });
      } else {
        return res.status(200).json({
          msg: 'Your order is empty!',
        });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
  // [POST] /create-order
  async postCreateOrder(req, res, next) {
    const user_id = req.session.userId;
    const cartProduct = req.session.cart;
    const totalPrice = req.session.totalPrice;

    //check products in cart. if having nothing => fail
    if (!cartProduct.length) {
      return res.status(400).json({
        msg: "Cant create order! Order's empty!",
      });
    }

    //get userInfo
    console.log(cartProduct, user_id, totalPrice);
    if (!cartProduct || !user_id || !totalPrice) {
      return res.status(400).json({ msg: 'Cant create order!' });
    } else {
      try {
        // TO DO

        const newOrder = await Order_details.create({
          user_id,
          total: totalPrice,
          provider: 1,
          status: 'Chờ xử lý',
        });
        if (newOrder) {
          // order_id : Foreign key
          const order_id = newOrder.dataValues.id;

          // get product in cart_item
          let productsInCartFilter = [];
          for (let i = 0; i < cartProduct.length; i++) {
            productsInCartFilter.push({
              order_id,
              product_id: cartProduct[i].product_id,
              quantity: cartProduct[i].quantity,
            });
          }
          console.log(productsInCartFilter);
          // add to order_item
          let insertProducts = await Order_items.bulkCreate(
            productsInCartFilter,
          );

          // if insert true, delete all products in cart
          if (insertProducts) {
            const deleteProduct = await Cart_item.destroy({
              where: { user_id },
            })
              .then(() => {
                req.session.cart = [];
                return res.json({ success: 'Order created successfully' });
              })
              .catch((err) => console.log(err));
          }
        }
      } catch (err) {
        console.log(err);
        next(err);
      }
    }
  }

  // [PUT] /update-order
  async postUpdateOrder(req, res, next) {}

  // [DELETE] /delete-order
  async postDeleteOrder(req, res, next) {}
}

module.exports = new orderController();
