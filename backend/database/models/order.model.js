import mongoose from "mongoose";

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },

    orderItems: [
        {
            product: {
                type: mongoose.Types.ObjectId,
                ref: 'product'
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: Number,
        }
    ],

    totalOrderPrice: Number,
    shippingAddress: {
        street: String,
        city: String,
        phone: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled', 'refunded'],
        default: 'pending',
    },
    notes: {
        type: String,
        default: '',
        trim: true,
    },
    paymentType: {
        type: String,
        enum: ['cash', 'card'],
        default: 'cash',
    },

    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date,
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,

}, { timestamps: true })

export const orderModel = mongoose.model('order', schema)