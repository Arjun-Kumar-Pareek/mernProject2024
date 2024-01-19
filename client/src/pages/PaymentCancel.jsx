import React from 'react';
import { NavLink } from 'react-router-dom';
import { RxCrossCircled } from "react-icons/rx";

const PaymentCancel = () => {
    return (
        <>
            <div className="text-center">
                <RxCrossCircled className='svg-icon1' />
            </div>
            <div className="text-center">
                <p className='payment1'> Payment Failed </p>
                <h1>Sorry !</h1>
                <h1>&#128542;</h1>
                <NavLink to="/"> <button className='cancel'>Return Home</button></NavLink>
            </div>
        </>
    )
}

export default PaymentCancel