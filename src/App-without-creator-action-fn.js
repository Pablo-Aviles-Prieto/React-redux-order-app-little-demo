import Cart from './components/Cart/Cart';
import Layout from './components/Layout/Layout';
import Products from './components/Shop/Products';
import Notification from './components/UI/Notification';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { useEffect } from 'react';
import { uiActions } from './store/ui-slice';

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
    const sendCartData = async () => {
      dispatch(
        uiActions.showNotification({
          status: 'pending',
          title: 'Sending...',
          message: 'Sending cart data!',
        })
      );
      const response = await fetch(
        'https://react-htttp-b0014-default-rtdb.europe-west1.firebasedatabase.app/cart.json',
        { method: 'PUT', body: JSON.stringify(cart) }
      );
      if (!response.ok) {
        throw new Error('Sending Cart Data failed!');
      }
      // We dont need this data actually.
      await response.json();
      dispatch(
        uiActions.showNotification({
          status: 'success',
          title: 'Success!',
          message: 'Sent cart data successfully!',
        })
      );
    };
    // If isInitial is true, we want to set it as false and return. (this will only happen once when this file is parsed, since we defined outside the component the variable, so it wont be re-initialized never).
    if (isInitial) {
      isInitial = false;
      return;
    }
    // We want to catch any error inside the async Fn, so instead of using the dispatch error to the Notification component inside the ui-slice piece of state, we use it in the catch, after calling the async Fn inside the useEffect().
    sendCartData().catch((error) => {
      dispatch(
        uiActions.showNotification({
          status: 'error',
          title: 'Error',
          message: 'Sending cart data failed!',
        })
      );
    });
  }, [cart, dispatch]);

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
