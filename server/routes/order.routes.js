const express = require('express');
const router = express.Router();

const { Order, OrderItem, Product } = require('../database/models');
const { verifyToken } = require('../utils/token');

// GET /orders - toate comenzile
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving orders',
      data: error.message,
    });
  }
});

// GET /orders/:id - detaliu comanda cu items
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Order id is not valid',
        data: {},
      });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: {},
      });
    }

    // verificare user curent/admin
    if (req.userRole !== 'admin' && order.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view this order',
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving order',
      data: error.message,
    });
  }
});

// POST /orders - create order
router.post('/', verifyToken, async (req, res) => {
  try {
    const order = await Order.create({
      user_id: req.userId,
      status: req.body.status || 'PENDING',
      total: req.body.total || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      data: error.message,
    });
  }
});

// PUT /orders/:id - update status / total
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Order id is not valid',
        data: {},
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: {},
      });
    }

    // doar owner-ul sau admin
    if (req.userRole !== 'admin' && order.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this order',
        data: {},
      });
    }

    const updatedOrder = await order.update({
      status: req.body.status || order.status,
      total: req.body.total ?? order.total,
    });

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      data: error.message,
    });
  }
});

// DELETE /orders/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Order id is not valid',
        data: {},
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: {},
      });
    }

    if (req.userRole !== 'admin' && order.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this order',
        data: {},
      });
    }

    await OrderItem.destroy({ where: { order_id: id } });
    await order.destroy();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      data: error.message,
    });
  }
});


// GET /orders/cart
router.get('/cart/me', verifyToken, async (req, res) => {
  try {
    let cart = await Order.findOne({
      where: { user_id: req.userId, status: 'CART' },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    // dacă nu exista, il cream
    if (!cart) {
      cart = await Order.create({
        user_id: req.userId,
        status: 'CART',
        total: 0,
      });
      cart = await Order.findByPk(cart.id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart',
      data: error.message,
    });
  }
});

// POST /orders/cart/items - adauga produs in cos
router.post('/cart/items', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = quantity ?? 1;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product id is not valid',
        data: {},
      });
    }

    // 1. Obtinem sau cream cosul
    let cart = await Order.findOne({
      where: { user_id: req.userId, status: 'CART' },
    });

    if (!cart) {
      cart = await Order.create({
        user_id: req.userId,
        status: 'CART',
        total: 0,
      });
    }

    // 2. Verificam produsul si stocul
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: {},
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
        data: { availableStock: product.stock },
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock for requested quantity',
        data: { availableStock: product.stock },
      });
    }

    // 3. Verificam daca item-ul exista deja in cos
    let item = await OrderItem.findOne({
      where: {
        order_id: cart.id,
        product_id: productId,
      },
    });

    if (item) {
      const newQty = item.quantity + qty;

      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Quantity exceeds available stock',
          data: { availableStock: product.stock },
        });
      }

      await item.update({ quantity: newQty });
    } else {
      item = await OrderItem.create({
        order_id: cart.id,
        product_id: productId,
        quantity: qty,
        price: product.price,
      });
    }

    // 4. Recalculam totalul cosului
    const allItems = await OrderItem.findAll({
      where: { order_id: cart.id },
    });

    const total = allItems.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0
    );

    await cart.update({ total });

    const updatedCart = await Order.findByPk(cart.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      data: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding product to cart',
      data: error.message,
    });
  }
});

// DELETE /orders/cart/items/:itemId 
router.delete('/cart/items/:itemId', verifyToken, async (req, res) => {
  try {
    const itemId = req.params.itemId;

    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Item id is not valid',
        data: {},
      });
    }

    const item = await OrderItem.findByPk(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        data: {},
      });
    }

    // verificam ca item-ul apartine unui cos al user-ului curent
    const cart = await Order.findByPk(item.order_id);

    if (!cart || cart.status !== 'CART' || cart.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to modify this cart',
        data: {},
      });
    }

    await item.destroy();

    // recalculam totalul
    const allItems = await OrderItem.findAll({
      where: { order_id: cart.id },
    });

    const total = allItems.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0
    );

    await cart.update({ total });

    const updatedCart = await Order.findByPk(cart.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      data: error.message,
    });
  }
});

// POST /orders/cart/checkout 
router.post('/cart/checkout', verifyToken, async (req, res) => {
  try {
    // cauta cos curent
    let cart = await Order.findOne({
      where: { user_id: req.userId, status: 'CART' },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: 'No cart found for this user',
        data: {},
      });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
        data: {},
      });
    }

    // check stock
    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with id ${item.product_id} not found`,
          data: {},
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product ${product.name}`,
          data: {
            productId: product.id,
            availableStock: product.stock,
            requested: item.quantity,
          },
        });
      }
    }

    // scade stockul
    for (const item of cart.items) {
      const product = item.product;
      const newStock = product.stock - item.quantity;
      await product.update({ stock: newStock });
    }

    await cart.update({ status: 'PAID' });

    // se creeaza alt cos
    const newCart = await Order.create({
      user_id: req.userId,
      status: 'CART',
      total: 0,
    });

    res.status(200).json({
      success: true,
      message: 'Checkout successful',
      data: {
        order: cart,
        newCartId: newCart.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during checkout',
      data: error.message,
    });
  }
});


module.exports = router;
