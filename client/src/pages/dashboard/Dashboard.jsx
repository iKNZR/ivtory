import React, {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductList from '../../components/product/productList/ProductList.jsx';
import ProductSummary from '../../components/product/productSummary/ProductSummary.jsx';
import useRedirectLoggedOutUser from '../../customHook/useRedirectLoggedOutUser.jsx';
import { selectIsLoggedIn } from '../../redux/features/auth/authSlice.jsx';
import { getProducts } from '../../redux/features/product/productSlice.jsx';

const Dashboard = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    if (isLoggedIn === true) {
      dispatch(getProducts());
    }

    if (isError) {
      console.log(message);
    }
  }, [isLoggedIn, isError, message, dispatch]);

  return (
    <div>
      <ProductSummary products={products} />
      <ProductList products={products} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;