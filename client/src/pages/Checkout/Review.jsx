import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import { AuthContext } from '../../store/auth';

const products = [
    {
        name: 'Product 1',
        desc: 'A nice thing',
        price: '$9.99',
    },
    {
        name: 'Product 2',
        desc: 'Another thing',
        price: '$3.45',
    },
    {
        name: 'Product 3',
        desc: 'Something else',
        price: '$6.51',
    },
    {
        name: 'Product 4',
        desc: 'Best thing of all',
        price: '$14.11',
    },
    { name: 'Shipping', desc: '', price: 'Free' },
];

const addresses = ['1 MUI Drive', 'Reactville', 'Anytown', '99999', 'USA'];
const payments = [
    { name: 'Card type', detail: 'Visa' },
    { name: 'Card holder', detail: 'Mr John Smith' },
    { name: 'Card number', detail: 'xxxx-xxxx-xxxx-1234' },
    { name: 'Expiry date', detail: '04/2024' },
];

export default function Review() {
    const { token, } = useContext(AuthContext);

    const [cartItemDetail, setCartItemDetail] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);

    const fetchCartItems = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/get-cart-item-details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
            });
            if (response.ok) {
                const completeRes = await response.json();
                const cartData = completeRes.data;
                // console.log(cartData[1].grandTotal);
                setGrandTotal(cartData[1].grandTotal);
                setCartItemDetail(cartData[0].cartitem);
            } else {
                const errorResponse = await response.json();
            }
        } catch (error) {
            console.log("Error on fetchCartItems function", error);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, [])

    return (
        <React.Fragment>
            <Typography variant="h4" gutterBottom>
                Order summary
            </Typography>
            <List disablePadding sx={{ flexDirection: "column", width: "80%", margin: "auto" }}>
                {cartItemDetail.map((product, i) => (
                    <ListItem key={i} sx={{ py: 1, px: 0 }}>
                        <img className='order-product-img' src={product.productImage} alt="" />
                        <ListItemText primary={product.productName} secondary={"Quantity  --  " + product.quantity} />
                        <Typography variant="body2">&#8377;{product.productPrice * product.quantity}</Typography>
                    </ListItem>
                ))}

                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        &#8377; {grandTotal}
                    </Typography>
                </ListItem>
            </List>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Shipping
                    </Typography>
                    <Typography gutterBottom>John Smith</Typography>
                    <Typography gutterBottom>{addresses.join(', ')}</Typography>
                </Grid>
                <Grid item container direction="column" xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Payment details
                    </Typography>
                    <Grid container>
                        {payments.map((payment) => (
                            <React.Fragment key={payment.name}>
                                <Grid item xs={6}>
                                    <Typography gutterBottom>{payment.name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography gutterBottom>{payment.detail}</Typography>
                                </Grid>
                            </React.Fragment>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment >
    );
}