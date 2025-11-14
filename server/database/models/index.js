const User = require('./user'); //aici user e cu u mic si e posibil sa trebuiasca modificat in viitor pentru ca am schimbat eu in U mare si cumva nu a vazut modificarea; de modificat pe viitor

const Product = require('./Product');

const Order = require('./Order');
const OrderItem = require('./OrderItem');

// User 1 - N Order
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
});

Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Order 1 - N OrderItem
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

// Product 1 - N OrderItem
Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  as: 'orderItems',
});

OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

module.exports ={User , Product, Order, OrderItem};