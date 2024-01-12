const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Product = require("../models/productModel");
const { ObjectId } = require("mongodb");
const path = require("path");
const fs = require("fs");

// require("dotenv").config();
const stripe = require("stripe")('sk_test_51OGy4BSEWW2cslHik2PtEBrFhq4uJL33DD428TzkcPZtAYC7oY70dzr0jHc409HHa9DE1tmtMh9a8bfdrPZCMs6c00d8UNy4R5');


module.exports.createOrder = async (req, res) => {
    const { name, email, _id } = req.user.data;
    const { totalAmount, paymentMode, orderItems, deliveryDetails } = req.body;

    try {
        const orderItemIds = [];

        for (const cur of orderItems) {
            const createOrderItem = new OrderItem({
                productId: cur.productId,
                quantity: cur.quantity,
                price: cur.price,
                productName: cur.productName,
            });

            const savedOrderItem = await createOrderItem.save();
            orderItemIds.push(savedOrderItem._id);
        }

        const rand = Math.random().toString(16).substr(2, 16);

        const createOrder = new Order({
            orderItems: orderItemIds,
            customerName: name,
            email: email,
            totalAmount: totalAmount,
            paymentMode: paymentMode,
            userId: _id,
            deliveryDetails: deliveryDetails,
            orderNumber: rand,
        });

        const savedOrder = await createOrder.save();

        const lineItems = orderItems.map((product) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: product.productName,
                    images: [product.imgdata]

                },
                unit_amount: product.price * 100,
            },
            quantity: product.quantity
        }));

        // console.log(lineItems);
        // return false;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `http://localhost:5173/sucess/id=${savedOrder._id}`,
            cancel_url: `http://localhost:5173/cancel/id=${savedOrder._id}`,
        });
        res.json({ id: session.id })

    } catch (error) {
        console.error("Error in createOrder function:", error);
        res.status(400).send({
            success: false,
            message: "Error in createOrder function",
            error,
        });
    }
};

module.exports.changeOrderStatus = async (req, res) => {
    try {
        const { _id } = req.query;
        const findOrder = await Order.findOne({ _id: new ObjectId(_id) });

        if (findOrder) {
            if (findOrder.orderStatus == "Pending") {
                const changeStatus = await Order.updateOne({ _id }, { $set: { orderStatus: "Processing" } });
            } else if (findOrder.orderStatus == "Processing") {
                const changeStatus = await Order.updateOne({ _id }, { $set: { orderStatus: "Shipped" } });
            } else if (findOrder.orderStatus == "Shipped") {
                const changeStatus = await Order.updateOne({ _id }, { $set: { orderStatus: "Delivered" } });
            }
            res.status(200).send({ success: true, message: "Status Updated Successfully" });
        } else {
            res.status(400).send({ success: false, message: "Order not found" });
        }

    } catch (error) {
        console.log("Error from changeOrderStatus function", error);
    }
};

module.exports.viewOrder = async (req, res) => {
    try {
        const { _id } = req.user.data;
        const findOrder = await Order.find({ userId: new ObjectId(_id) }, { createdAt: 0, updatedAt: 0 })
            .select("-__v")
            .populate({
                path: "orderItems",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: [{
                        path: "categoryId",
                        model: "Category"
                    },
                    {
                        path: "companyId",
                        model: "Company"
                    }]
                }
            });

        if (findOrder) {
            res.status(200).send({ success: true, message: "Order viewed successfully", data: findOrder });
        } else {
            res.status(200).send({ success: true, message: "Order not Found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};