// client/src/api/cart.routes.js
import axiosAuth from "../axios/axiosAuth";

export const getCart = async () => {
  try {
    const res = await axiosAuth.get("/orders/cart/me");
    return res.data; // { success, message, data }
  } catch (error) {
    return error.response?.data || { success: false, message: "Network error" };
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const res = await axiosAuth.post("/orders/cart/items", {
      productId,
      quantity,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Network error" };
  }
};

export const removeCartItem = async (itemId) => {
  try {
    const res = await axiosAuth.delete(`/orders/cart/items/${itemId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Network error" };
  }
};

export const checkoutCart = async () => {
  try {
    const res = await axiosAuth.post("/orders/cart/checkout");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Network error" };
  }
};
