import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    thisBooking.render();
    thisBooking.initWidgets();
  }

  render() {
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;

    const generateDom = utils.createDOMFromHTML(generateHTML);
    thisBooking.dom.wrapper.appendChild(generateDom);

    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );

    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
