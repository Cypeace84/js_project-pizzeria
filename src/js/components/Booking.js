import { templates } from '../settings.js';
import utils from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    thisBooking.render();
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;

    const generateDom = utils.createDOMFromHTML(generateHTML);
    thisBooking.dom.wrapper.appendChild(generateDom);
  }
}

export default Booking;
