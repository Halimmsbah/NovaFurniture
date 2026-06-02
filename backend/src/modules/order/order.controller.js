import { catchAsyncError } from "../../middleware/catchError.js";
import { cartModel } from "../../../database/models/cart.model.js";
import { AppError } from "../../utils/AppError.js";
import { orderModel } from "../../../database/models/order.model.js";
import { productModel } from "../../../database/models/product.model.js";
import Stripe from "stripe";
import { createInvoice } from "../../utils/pdf.js";

const stripe = new Stripe(process.env.STRIPE_SECRET || "sk_test_missing");

const createCashOrder = catchAsyncError(async (req, res, next) => {
  //1- get cart -> cartId
  let cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("cart not found", 404));
  //2- total order price
  let totalOrderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  //3- create order -> cash
  let order = new orderModel({
    user: req.user._id,
    orderItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
    status: 'confirmed',
  });
  await order.save();
  //4- increment sold & decrement quantity
  let options = cart.cartItems.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod.product },
        update: { $inc: { sold: prod.quantity, quantity: -prod.quantity } },
      },
    };
  });
  await productModel.bulkWrite(options);

  //pdf invoice

  const invoice = {
    shipping: {
      name: req.user.name,
      address: req.body.shippingAddress,
      city: req.body.city,
    },
    items: [
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000,
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000,
      },
    ],
    subtotal: 8000,
    paid: 0,
    invoice_nr: 1234,
  };

  createInvoice(invoice, "invoice.pdf");

  //5- clear cart
  await cartModel.findByIdAndDelete(req.params.id);

  res.json({ message: "success", order });
});

const getSpecififcOrder = catchAsyncError(async (req, res, next) => {
  let order = await orderModel
    .findOne({ user: req.user._id })
    .populate("orderItems.product");
  res.json({ message: "success", order });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  let orders = await orderModel.find().populate("orderItems.product").populate("user");
  res.json({ message: "success", orders });
});

const getOrdersWithFilters = catchAsyncError(async (req, res, next) => {
  const filter = {};
  const { status, paymentStatus, userId, startDate, endDate } = req.query;

  if (status === "delivered") filter.isDelivered = true;
  if (status === "pending") filter.isDelivered = false;
  if (paymentStatus === "paid") filter.isPaid = true;
  if (paymentStatus === "unpaid") filter.isPaid = false;
  if (userId) filter.user = userId;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const orders = await orderModel
    .find(filter)
    .populate("orderItems.product")
    .populate("user");
  res.json({ message: "success", orders });
});

const updateOrderDeliveryStatus = catchAsyncError(async (req, res, next) => {
  const update = { isDelivered: Boolean(req.body.isDelivered) };
  update.deliveredAt = update.isDelivered ? Date.now() : undefined;
  update.status = update.isDelivered ? 'delivered' : 'pending';

  const order = await orderModel.findByIdAndUpdate(req.params.orderId, update, {
    new: true,
  });
  if (!order) return next(new AppError("order not found", 404));

  res.json({ message: "success", order });
});

const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled', 'refunded'];
  const status = String(req.body.status || '').toLowerCase();
  if (!allowedStatuses.includes(status)) return next(new AppError('invalid order status', 400));

  const update = {
    status,
    isDelivered: status === 'delivered',
    deliveredAt: status === 'delivered' ? Date.now() : undefined,
  };

  const order = await orderModel.findByIdAndUpdate(req.params.orderId, update, {
    new: true,
  });
  if (!order) return next(new AppError('order not found', 404));

  res.json({ message: 'success', order });
});

const updateOrderNotes = catchAsyncError(async (req, res, next) => {
  const order = await orderModel.findByIdAndUpdate(
    req.params.orderId,
    { notes: String(req.body.notes ?? '') },
    { new: true },
  );
  if (!order) return next(new AppError('order not found', 404));

  res.json({ message: 'success', order });
});

const updateOrderPaymentStatus = catchAsyncError(async (req, res, next) => {
  const update = { isPaid: Boolean(req.body.isPaid) };
  update.paidAt = update.isPaid ? Date.now() : undefined;

  const order = await orderModel.findByIdAndUpdate(req.params.orderId, update, {
    new: true,
  });
  if (!order) return next(new AppError("order not found", 404));

  res.json({ message: "success", order });
});

const deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel.findByIdAndDelete(req.params.orderId);
  if (!order) return next(new AppError("order not found", 404));

  res.json({ message: "success" });
});

const createCheckOutSession = catchAsyncError(async (req, res, next) => {
  let cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("cart not found", 404));

  if (!process.env.STRIPE_SECRET) {
    return res.json({
      message: "success",
      session: {
        id: `mock_session_${req.params.id}`,
        url: `http://localhost:5173/checkout?mockSession=${req.params.id}`,
        mode: "mock",
      },
    });
  }

  let totalOrderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  let session = await stripe.checkout.sessions.create({
    //doc api sessions to get this details
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://route-comm.netlify.app/#/", // frontend url
    cancel_url: "https://route-comm.netlify.app/#/cart",
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    metadata: req.body.shippingAddress,
    //we put email and cartId to get easey when bank send webhook with email for user and id for cart
  });
  res.json({ message: "success", session });
});

export {
  createCashOrder,
  getSpecififcOrder,
  getAllOrders,
  createCheckOutSession,
  getOrdersWithFilters,
  updateOrderDeliveryStatus,
  updateOrderPaymentStatus,
  updateOrderStatus,
  updateOrderNotes,
  deleteOrder,
};

//bulk -> to increment sold & decrement quantity

// <- payment cycle ->
//1- place order in frontend
//2- backend call bank with any getway
//4- backend ask bank  for payment form
//5- bank give me URL session (payment form)
//6- backend give front this URL session (payment form)
//7- user sumbit the form and press pay
//8- money is reach to bank not to dev
//9- dev make specific api only for bank
//10- bank request to dev to tell him the payment is completed or not that notification called => (webhook)
//11- dev check if it's completed -> create order and delivered it to user
//****************NOTE****************
//this URL session (payment form) contain user information like email and id
