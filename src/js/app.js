//const { firebrick } = require('color-name');    - skąd sie to wzięło :) ?????
import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    thisApp.activatePage(thisApp.pages[0].id);
  },
  activatePage: function (pageId) {
    const thisApp = this;

    /*add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      // if(page.id == pageId){
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }
      // toggle w przeciwienstwie do add
      // i remove moze przyjąć równiez parametr np. poyszczy warunek
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /*add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
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

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(
        event.detail.Product.prepareCartProduct(event.detail.Product)
      );
    });
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
    thisApp.initPages();
  },
};

app.init();

export default app;

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
