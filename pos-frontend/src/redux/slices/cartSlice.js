import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const normalizeCartItem = (item) => {
  const rawId = item?.id ?? item?._id ?? `${item?.name || "item"}-${Date.now()}`;

  return {
    ...item,
    id:
      rawId instanceof Date
        ? rawId.toISOString()
        : typeof rawId === "object"
        ? String(rawId)
        : String(rawId),
    price: Number(item?.price || 0),
    quantity: Number(item?.quantity || 1),
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItems: (state, action) => {
      const incomingItem = normalizeCartItem(action.payload);

      const existingItem = state.find((item) => item.id === incomingItem.id);

      if (existingItem) {
        existingItem.quantity += incomingItem.quantity;
      } else {
        state.push(incomingItem);
      }
    },

    removeItem: (state, action) => {
      const itemId =
        action.payload instanceof Date
          ? action.payload.toISOString()
          : String(action.payload);

      return state.filter((item) => item.id !== itemId);
    },

    removeAllItems: () => {
      return [];
    },
  },
});

export const getTotalPrice = (state) =>
  state.cart.reduce((total, item) => total + item.price * item.quantity, 0);

export const { addItems, removeItem, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;