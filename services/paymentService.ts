
/**
 * Payment Service for রাগে অনুরাগে
 * Handles UPI Deep Linking and QR Code Generation
 */

export const getUPILink = (amount: number, orderId: string) => {
  // Updated to the UPI ID provided in the screenshot
  const merchantUPI = "karaditya2005-3@oksbi"; 
  const merchantName = "Aditya Kar";
  const transactionNote = `Rage Anurage Coffee - Order ${orderId}`;
  
  // Standard UPI Deep Link Protocol
  return `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
};

export const getQRCodeUrl = (amount: number, orderId: string) => {
  const upiLink = getUPILink(amount, orderId);
  // Using a public QR generator for the demo with the exact UPI link
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
};

export const simulateGatewayRedirect = async (method: string) => {
  return new Promise((resolve) => {
    // Realistic waiting time for UPI verification
    const delay = method === 'UPI' ? 8000 : 2500;
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};
