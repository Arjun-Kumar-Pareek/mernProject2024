import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../store/auth";

const MyOrders = () => {

    const { token } = useContext(AuthContext);
    const [orderDetail, setOrderDetail] = useState([]);
    console.log(orderDetail);

    const fetchOrderDetails = async () => {
        try {

            const response = await fetch("http://localhost:5000/api/view-order", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
            });

            if (response.ok) {
                const completeRes = await response.json();
                const completeData = completeRes.data;
                setOrderDetail(completeData);
            } else {
                const errorResponse = await response.json();
                console.log("Error on My Orders Page :", errorResponse.message);
            }

        } catch (error) {
            console.log("Error on My Orders Page :", error);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    return (
        <section className='section1'>
            <h1 className='order'>My Orders</h1>
            {orderDetail && orderDetail.map((curOrder) => (
                <div className="container1">
                    <div className="row">
                        <div className="colum">
                            <div className="card-stepper" >
                                <div className="card-header">
                                    <div className=" details">
                                        <div>
                                            <p className="text-muted "> Order ID : <span className="fw-bold text-body">{curOrder.orderNumber}</span></p>
                                            <p className="text-muted "> Ordered On : <span className="fw-bold text-body">{new Date(curOrder.createdAt).toLocaleString(
                                                "en-US",
                                                {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                }
                                            )}</span> </p>
                                        </div>
                                        <div>
                                            <h6 className="mb-0"> <a href="#">View Details</a> </h6>
                                        </div>
                                    </div>
                                    <hr />
                                </div>

                                <div className="card-body">
                                    {curOrder.orderItems.map((curItem) => (
                                        <div className=" img-product">
                                            <div className="flex-fill">
                                                <p className="bold">Name: {curItem.productName}</p>
                                                <p className="text-muted"> Qty: {curItem.quantity}</p>
                                                <p className="mb-3"> &#8377; {curItem.price} <br /> <span className="small text-muted"> via ({curOrder.paymentMode}) </span></p>
                                            </div>
                                            <div>
                                                <img className=" img-product1"
                                                    src={curItem.productId.image} width="80" />
                                            </div>
                                        </div>
                                    ))
                                    }
                                    <hr />
                                    <ul id="progressbar-1" >
                                        <li className="step0 active" id="step1"><span
                                        >PENDING</span></li>
                                        <li className="step0 active" id="step2"><span
                                        >PROCESSING</span></li>
                                        <li className="step0 active " id="step3"><span>SHIPPED</span></li>
                                        <li className="step0 text-muted text-end" id="step4"><span
                                        >DELIVERED</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))
            }
        </section>
    )
}

export default MyOrders