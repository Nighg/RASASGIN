
import React, { useEffect, useState } from 'react';
import { verifyOtpAndGetToken, fetchRazorpayKey, createOrder, initiatePayment, verifyOrder } from '../api';
import './Payment.css';
import img1 from '../images/frontk.jpg'
import img2 from '../images/img22.png'
import img33 from '../images/img33.png'



const Payment = () => {
  const [token, setToken] = useState('');
  const [razorpayKey, setRazorpayKey] = useState('');

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Generate the token
        const generatedToken = await verifyOtpAndGetToken();
        setToken(generatedToken);

        // Fetch the Razorpay key
        const key = await fetchRazorpayKey(generatedToken);
        setRazorpayKey(key || 'rzp_test_qUtLOVt2Ge3dFM'); // Fallback to hardcoded key if fetch fails
      } catch (error) {
        console.error('Initialization error:', error.message);
      }
    };

    // Ensure Razorpay script is loaded
    const checkRazorpayScript = () => {
      if (window.Razorpay) {
        initializePayment();
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = initializePayment;
        script.onerror = () => console.error('Failed to load Razorpay script');
        document.body.appendChild(script);
      }
    };

    checkRazorpayScript();
  }, []);

  const handlePayment = async () => {
    try {
      // Create an order
      const { _id: transactionId } = await createOrder(token, '6613d6fbbf1afca9aa1b519e', '662caa2d50bf43b5cef75232', 441, 'NEET25');
      
      // Initiate Razorpay payment
      const options = {
        key: razorpayKey, // Use the fetched or hardcoded key
        amount: 44100, // Amount in smallest unit (e.g., paise for INR)
        currency: 'INR',
        name: 'Test Order',
        description: 'Payment for Test Order',
        order_id: transactionId,
        handler: async (response) => {
          const { razorpay_payment_id, razorpay_signature } = response;
          console.log('Razorpay Response:', response);
          try {
            console.log('Verifying Order with:', {
              token,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
              transactionId
            });
            await verifyOrder(token, razorpay_payment_id, razorpay_signature, transactionId);
            alert('Payment successful!');
          } catch (error) {
            console.error('Order verification error:', error.response ? error.response.data : error.message);
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: 'Test User',
          email: 'testuser@example.com',
          contact: '+919999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
  
    } catch (error) {
      console.error('Payment initiation error:', error.message);
      alert('Payment initiation failed!');
    }
  };

  return (
<>
    <div className="payment-card">
         <div className="header">
             <p>Payment Gateway</p>
             <p>Powered by <span class="brand">Razorpay</span></p>
         </div>
         <div className='product'>  
             <img src={img1}/> 
             <p class="product-name">Neon T-shirt</p>
             <p class="product-price">₹ 441</p>
         </div>
         <div className='payment-method'>
              <button onClick={handlePayment} disabled={!razorpayKey}>
                    Pay Now
              </button>
         </div>
         <div className="founder-info">
                <img src={img2} />
         </div>
    </div> 
    <div className="background">
         <img className="person" src={img33} />
  </div>
</>
  );
};

export default Payment;
