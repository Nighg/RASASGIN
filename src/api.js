
import axios from 'axios';
const RAZORPAY_KEY = 'rzp_test_qUtLOVt2Ge3dFM';

// Verify OTP and get a bearer token
export const verifyOtpAndGetToken = async () => {
  try {
    const response = await axios.post('https://api.testbuddy.live/v1/auth/verifyotp', {
      mobile: '+919098989999', // Replace with the correct mobile number
      otp: '8899', // Replace with the correct OTP
    });

    const token = response.data.token;
    console.log('Generated Bearer Token: ', token);
    return token;
  } catch (error) {
    console.error('Error verifying OTP:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject('Failed to load Razorpay script');
    document.body.appendChild(script);
  });
};

// Fetch Razorpay key using the token
export const fetchRazorpayKey = async (token) => {
  try {
    const response = await axios.post('https://api.testbuddy.live/v1/payment/key', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.key; // Ensure 'key' is the correct field
  } catch (error) {
    console.error('Error fetching Razorpay key:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Create an order
export const createOrder = async (token, packageId, pricingId, finalAmount, couponCode) => {
  try {
    const response = await axios.post(
      'https://api.testbuddy.live/v1/order/create',
      {
        packageId,
        pricingId,
        finalAmount,
        couponCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data._id; // Ensure '_id' is the correct field for the transaction ID
  } catch (error) {
    console.error('Error creating order:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Initiate payment using Razorpay
export const initiatePayment = async (orderId, razorpayKey, verifyOrder) => {
  try {
    const options = {
      key: razorpayKey || RAZORPAY_KEY, // Use the fetched Razorpay key
      amount: 44100, // Amount in paise (e.g., 441.00 INR)
      currency: 'INR',
      name: 'Company Name',
      description: 'Test Transaction',
      order_id: orderId,
      handler: async (response) => {
        try {
          await verifyOrder(response.razorpay_payment_id, response.razorpay_signature, orderId);
          alert('Payment Successful!');
        } catch (error) {
          alert('Payment Verification Failed!');
        }
      },
      prefill: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        contact: '9999999999',
      },
    };

    await loadRazorpayScript(); 
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Error initiating payment:', error.message);
    alert('Payment initiation failed!');
  }
};

// Verify order payment details
export const verifyOrder = async (razorpayPaymentId, razorpaySignature, transactionId) => {
    try {
      const token = await verifyOtpAndGetToken(); // Fetch the token here
      const response = await axios.post(
        'https://api.testbuddy.live/v1/order/verify',
        {
          transactionId,
          razorpayPaymentId,
          razorpaySignature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Order Verification Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying order:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
