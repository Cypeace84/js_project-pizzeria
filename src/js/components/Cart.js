import { settings, select, templates } from './settings.js';
import CartProduct from './components/CartProduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = []; // skąd się wzieło products? skad on wie itp.??
    thisCart.getElements(element);
    console.log('new cart', thisCart);
    thisCart.initActions();
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle('active');
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event); ///???thisCartProduct??????????????????????????????
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;
    console.log('adding product', menuProduct);

    const generateHTML = templates.cartProduct(menuProduct);

    const generateDom = utils.createDOMFromHTML(generateHTML);

    thisCart.dom.productList.appendChild(generateDom);

    thisCart.products.push(new CartProduct(menuProduct, generateDom));
    console.log('thisCart.products:', thisCart.products);
    thisCart.update();
  }
  update() {
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    console.log('deliveryFee', thisCart.deliveryFee);
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for (const thisCartProduct of thisCart.products) {
      thisCart.totalNumber += thisCartProduct.amount;
      thisCart.subtotalPrice += thisCartProduct.price;
    }
    if (thisCart.totalNumber == 0) {
      thisCart.deliveryFee = 0;
    }
    thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;

    for (let TotalPriceInDom of thisCart.dom.totalPrice) {
      TotalPriceInDom.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

    /* czy gdybym zostawił const deliveryFee i potem zrobił właściwość 
      thisCart.delFeeVale = deliveryFee to ta właściwość te byłaby dostępna w medodzie sendOrder? */
  }
  remove(event) {
    const thisCart = this;
    console.log('thisCart', thisCart);
    /* remove product from dom HTML */
    const cartProductToRemove = event.detail.cartProduct.dom.wrapper;
    console.log('cartToRemove', cartProductToRemove);
    cartProductToRemove.remove();
    /* remove product from thisCart.products array */
    const indexOfCartProductyToRemove = thisCart.products.indexOf(
      event.detail.cartProduct
    );
    thisCart.products.splice(indexOfCartProductyToRemove, 1);

    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders; //http://localhost:3131/orders//

    const payload = {};

    /* address: adres klienta wpisany w koszyku,
      phone: numer telefonu wpisany w koszyku,
      totalPrice: całkowita cena za zamówienie,
      subtotalPrice: cena całkowita - koszt dostawy,
      totalNumber: całkowita liczba sztuk,
      deliveryFee: koszt dostawy,
      products: tablica obecnych w koszyku produktów */
    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.deliveryFee = thisCart.deliveryFee;
    payload.totalNumber = thisCart.totalNumber;
    payload.totalPrice = thisCart.totalPrice;
    payload.subtotalPrice = thisCart.subtotalPrice;
    payload.products = [];

    console.log('payload', payload);
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    /* fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }); poniej tworzymy stałą z opcjami*/
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;
