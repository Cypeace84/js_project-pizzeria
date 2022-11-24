/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { firebrick } = require('color-name');    - skąd sie to wzięło :) ?????

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renederInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      //console.log('thisProduct.accordionTrigger', thisProduct.accordionTrigger);

      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      //console.log('thisProduct.form', thisProduct.form);

      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      //console.log('thisProduct.formInputs', thisProduct.formInputs);

      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      //console.log('thisProduct.cartButton', thisProduct.cartButton);

      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      //console.log('thisProduct.priceElem', thisProduct.priceElem);

      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      //console.log('thisProduct.imageWrapper', thisProduct.imageWrapper);

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
      console.log('thisProduct.amountWidgetElem', thisProduct.amountWidgetElem);
    }

    renederInMenu() {
      const thisProduct = this;

      /* generate HTML Based on Template */
      const generateHTML = templates.menuProduct(thisProduct.data);
      // console.log('genetarteHTML', generateHTML);

      /* create element using utils.createElementFromHtml */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element); //element??
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */

      // const clickableTrigger = thisProduct.element.querySelector( ///zastąpione przez thisProduct.accordingTrigger///
      //   select.menuProduct.clickable
      // );

      /* START: add event listener to clickable trigger on event click */

      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('.product.active');

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if (activeProduct != null && activeProduct != thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          // console.log('activeProduct:', activeProduct);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );

        // console.log('thisProductElement', thisProduct.element);
        // console.log('thisProduct:', thisProduct);

        // console.log('clicableTrigger:', clickableTrigger);
      });
    }
    initOrderForm() {
      const thisProduct = this;
      //console.log('initOrderForm:', thisProduct.data);

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      //console.log('processOrder:', thisProduct);
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          const optionImage = thisProduct.imageWrapper.querySelector(
            '.' + paramId + '-' + optionId
          );
          if (optionImage) {
            console.log('mam zdjecie');
          }
          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            // check if the option is not default
            if (!option.default) {
              // add option price to price variable
              price += option.price;
            }
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price -= option.price;
            }
          }
          // all images
          if (optionImage) {
            //add class active to selected img
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            //remove class active from other img
            else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      /* multiply price by amont */
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct(thisProduct));
    }
    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(thisProduct),
      };
      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this;
      //console.log('processOrder:', thisProduct);
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      const params = {};
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);
        params[paramId] = {
          label: param.label,
          options: {},
        };

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      console.log('amountWidget:', thisWidget);
      console.log('constrctor argument:', element);

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element; // element jest referencją do do tego samego elementu DOM, co thisProduct.amountWidgetElem. ?jak????????
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      /* TODO Add validation */
      if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        thisWidget.value = newValue;
        this.annonce();
      }

      //thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value; //thisWidget.input.value = newValue??? po co te 2 linie kodu?
    }
    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function () {
        thisWidget.setValue(thisWidget.value - 1); // czemu nie thisWidget.input.value??
      });
      thisWidget.linkIncrease.addEventListener('click', function () {
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    annonce() {
      //custom event
      const thisWidget = this;

      const event = new CustomEvent('updated', { bubbles: true });
      thisWidget.element.dispatchEvent(event);
    }
  }

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
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(
        select.cart.phone
      );
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
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.getElements(element);
      console.log('thisCartProduct:', thisCartProduct);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget =
        thisCartProduct.dom.wrapper.querySelector(
          select.cartProduct.amountWidget
        );
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.price
      );
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.edit
      );
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.remove
      );
    }
    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(
        thisCartProduct.dom.amountWidget
      );
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        console.log(
          'thisCartProduct.amountWidget:',
          thisCartProduct.dom.amountWidget
        );
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price =
          thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('remove:', thisCartProduct.remove);
    }
    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    getData() {
      const thisCartProduct = this;
      const productDataSum = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
      return productDataSum;

      // console.log('productDataSum', productDataSum);
    }
  }

  const app = {
    initData: function () {
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function (rawResponse) {
          return rawResponse.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as ThisApp.data.products*/
          thisApp.data.products = parsedResponse;
          /*execute initMenu method */

          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        // new Product(productData, thisApp.data.products[productData]);// zmienine przy tworzeniuu api
        new Product(
          thisApp.data.products[productData].id,
          thisApp.data.products[productData]
        );
      }
    },
    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      //thisApp.initMenu(); - wywoływana w funkcji parsedResponse
      thisApp.initCart();
    },
  };

  app.init();
}

/*Ćwiczenie
Spróbuj wprowadzić ten sam pomysł w klasie Product. Tak, 
żeby wszystkie referencje do elementów DOM były "schowane" w 
dodatkowym obiekcie thisProduct.dom. (9.3) */

/* (302)  prepareCartProductParams
 params[paramId] = {
          label: param.label,
          options: {},
        };
czemuu params[x] ??? -> objekty[objekt x ??]
*/

//!!!!!!!!!!!!!!!!!!!!
/* event - customEvent - dispatchEvent(jak działa?)- (400); potem uwamy addeventlistenner(event - czy to ten nasz customowy?)*/
