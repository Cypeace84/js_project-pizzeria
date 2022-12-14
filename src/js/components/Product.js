import { select, templates, classNames } from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';
import utils from '../utils.js';
//import app from '../app.js';
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

    // const clickableTrigger = thisProduct.element.querySelector( ///zast??pione przez thisProduct.accordingTrigger///
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
    // app.cart.add(thisProduct.prepareCartProduct(thisProduct));

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        Product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;
