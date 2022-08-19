import { uiActions } from './ui-slice';
import { cartActions } from './cart-slice';

let timerSuccess; // timer to reset success notification
let timerError; // timer to reset error notification

// This is a creator action Fn
// We can return a Fn. This Fn receive the dispatch Fn as arg. This dispatch Fn comes from redux-toolkit, since if we return a Fn and not an obj as action, it pass the dispatch as arg to that Fn.
// Thx to redux-toolkit we dont have to dispatch an obj with an action (type, payload..), now we can dispatch a Fn.
export const sendCartData = (cart) => {
  clearTimeout(timerSuccess);
  clearTimeout(timerError);
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: 'pending',
        title: 'Sending...',
        message: 'Sending cart data!',
      })
    );

    const sendRequest = async () => {
      const response = await fetch(
        'https://react-htttp-b0014-default-rtdb.europe-west1.firebasedatabase.app/cart.json',
        { method: 'PUT', body: JSON.stringify(cart) }
      );
      if (!response.ok) {
        throw new Error('Sending Cart Data failed!');
      }
      // We dont need this data actually.
      await response.json();
    };

    try {
      await sendRequest();
      dispatch(
        uiActions.showNotification({
          status: 'success',
          title: 'Success!',
          message: 'Sent cart data successfully!',
        })
      );
      timerSuccess = setTimeout(() => {
        dispatch(uiActions.resetNotification());
      }, 2000);
    } catch (error) {
      dispatch(
        uiActions.showNotification({
          status: 'error',
          title: 'Error',
          message: 'Sending cart data failed!',
        })
      );
      timerError = setTimeout(() => {
        dispatch(uiActions.resetNotification());
      }, 2000);
    }
  };
};

export const fetchCartData = () => {
  clearTimeout(timerError);
  return async (dispatch) => {
    const fetchData = async () => {
      const response = await fetch(
        'https://react-htttp-b0014-default-rtdb.europe-west1.firebasedatabase.app/cart.json'
      );

      if (!response.ok) {
        throw new Error('Could not fetch cart data!');
      }

      const data = await response.json();

      return data;
    };

    try {
      const cartData = await fetchData();

      // Since firebase DB deletes the items property in case the cart is empty, we create the items property and assign an empty array to pass it to the state. If not, we would pass undefined and crash the app when we try to map undefined and not an empty array.
      if (!cartData.items) {
        cartData.items = [];
      }

      dispatch(cartActions.replaceCart(cartData));
    } catch (error) {
      dispatch(
        uiActions.showNotification({
          status: 'error',
          title: 'Error',
          message: 'Fetching cart data failed!',
        })
      );
      timerError = setTimeout(() => {
        dispatch(uiActions.resetNotification());
      }, 2000);
    }
  };
};
