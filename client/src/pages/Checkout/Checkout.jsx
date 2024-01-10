import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';
import Review from './Review';
import { createOrder } from '../../services/api';
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../store/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadStripe } from '@stripe/stripe-js';
import {
    PaymentElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

function Copyright() {
    return (
        <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="#">
                Bharat Tech
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const steps = ['Shipping address', 'Payment details', 'Review your order'];

function getStepContent(step) {
    switch (step) {
        case 0:
            return <AddressForm />;
        case 1:
            return <PaymentForm />;
        case 2:
            return <Review />;
        default:
            throw new Error('Unknown step');
    }
}

export default function Checkout() {

    const [activeStep, setActiveStep] = React.useState(0);
    const { token, API_BASE_URL } = useContext(AuthContext);

    const handleNext = async () => {
        setActiveStep(activeStep + 1);
        if (activeStep === 2) {
            const response = await createOrder(token, {
                "totalAmount": 27410,
                "orderItems": [
                    {
                        "productId": "650a802c629b22b4b347b528",
                        "productName": "Testing",
                        "quantity": 1,
                        "price": 1299
                    },
                    {
                        "productId": "650a7fcc629b22b4b347b522",
                        "productName": "Testing2",
                        "quantity": 2,
                        "price": 6556
                    }
                ],
                "paymentMode": "Cash On Delivery",
                "deliveryDetails": {
                    "address": "A3 Mall Road",
                    "state": "Rajshthan",
                    "city": "Jaipur",
                    "postalCode": "302039"
                }
            });

            // console.log(response.data.success);
            if (response.data.success) {
                toast.success(
                    response.data.message
                );
            } else {
                const errorResponse = await response;
                toast.error(
                    errorResponse.message
                );
            }
        }

    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };


    // payment integration
    const makePayment = async () => {
        const stripe = await loadStripe("pk_test_51OGy4BSEWW2cslHi0f17aZrw80XjrGri3c1xrmRkBuObWYSk5DmKU86w3pH5aN0BOXDUxx180N70ZiDQ3b7B0jmq00fuJJQGlF");

        const body = {
            "totalAmount": 27410,
            "orderItems": [
                {
                    "productId": "650a802c629b22b4b347b528",
                    "productName": "Testing",
                    "quantity": 1,
                    "price": 1299
                },
                {
                    "productId": "650a7fcc629b22b4b347b522",
                    "productName": "Testing2",
                    "quantity": 2,
                    "price": 6556
                }
            ],
            "paymentMode": "Cash On Delivery",
            "deliveryDetails": {
                "address": "A3 Mall Road",
                "state": "Rajshthan",
                "city": "Jaipur",
                "postalCode": "302039"
            }
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": token,
        }
        const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        const session = await response.json();
        console.log(session);
        const result = stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            console.log(result.error);
        }
    }


    return (
        <React.Fragment>
            <CssBaseline />
            <AppBar
                position="absolute"
                color="default"
                elevation={0}
                sx={{
                    position: 'relative',
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
            >

            </AppBar>
            <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center">
                        Checkout
                    </Typography>
                    <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            <Typography variant="h5" gutterBottom>
                                Thank you for your order.
                            </Typography>
                            <Typography variant="subtitle1">
                                Your order number is #2001539. We have emailed your order
                                confirmation, and will send you an update when your order has
                                shipped.
                            </Typography>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            {getStepContent(activeStep)}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {activeStep !== 0 && (
                                    <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                                        Back
                                    </Button>
                                )}

                                <Button
                                    variant="contained"
                                    onClick={makePayment}
                                    sx={{ mt: 3, ml: 1 }}
                                >
                                    {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                                </Button>
                            </Box>
                        </React.Fragment>
                    )}
                </Paper>
                <Copyright />
            </Container>
        </React.Fragment>
    );
}