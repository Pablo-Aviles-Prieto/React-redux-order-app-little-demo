import Cart from './components/Cart/Cart';
import Layout from './components/Layout/Layout';
import Products from './components/Shop/Products';
import Notification from './components/UI/Notification';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { useEffect } from 'react';
import { sendCartData, fetchCartData } from './store/cart-actions.js';

// We need this variable to avoid the useEffect() hook executes the PUT request the first time it parses this code.
// We create this variable outside the App component so its not reinitialize if the component renders again.
let isInitial = true;

function App() {
  const dispatch = useDispatch();
  const showCart = useSelector((state) => state.ui.cartIsVisible);
  const cart = useSelector((state) => state.cart);
  const notification = useSelector((state) => state.ui.notification);

  // This re-executes whenever the cart dependency changes.
  // Basically we update first the cart state in out redux store, and when it changes, we update it in the DB.
  // We use the PUT method in the Firebase BD to override the existing data, the whole cart.json so to say. With post we would add the data in a 'list', with put we override all the data there.
  useEffect(() => {
    if (isInitial) {
      isInitial = false;
      return;
    }
    // We could use a switch property (like postSwitch) in the state obj and use it as dependency for whenever we change it in the action Fns, it would trigger this useEffect, but we have to add cart to the dependencies, so its better this approach.
    if (cart.changed) {
      dispatch(sendCartData(cart));
    }
  }, [cart, dispatch]);

  useEffect(() => {
    dispatch(fetchCartData());
  }, [dispatch]);

  return (
    <>
      {notification && (
        <Notification
          status={notification.status}
          title={notification.title}
          message={notification.message}
        />
      )}
      <Layout>
        {showCart && <Cart />}
        <Products />
      </Layout>
    </>
  );
}

export default App;
