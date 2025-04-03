import React from "react";
import "../styles/Cart.css";
import { RiShoppingBasketLine } from "react-icons/ri";

const Cart = ({ cartItems, onClick }) => {

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
 
  return (
    cartItems.length > 0 && ( // Отображаем только если в корзине есть товары
      <div className={`cart cart-visible`} onClick={onClick}>
        <div className="box_add__Kr">
          <div className="fx_add">
            <RiShoppingBasketLine className="Shop_bike" />
            <h3>: {cartItems.length}</h3>
          </div>
          <h3>Итого: {calculateTotal()} сом</h3>
        </div>
      </div>
    )
  );
};

export default Cart;
