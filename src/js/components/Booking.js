import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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

    ///////////
    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;
