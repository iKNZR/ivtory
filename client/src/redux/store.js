import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../redux/features/auth/authSlice.jsx';
import productReducer from '../redux/features/product/productSlice.jsx';
import filterReducer from '../redux/features/product/filterSlice.jsx';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        filter: filterReducer,
    },
});