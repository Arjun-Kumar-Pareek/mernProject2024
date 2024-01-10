const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
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
            success_url: "http://localhost:5173/sucess",
            cancel_url: "http://localhost:5173/cancel",
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