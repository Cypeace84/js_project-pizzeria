import { select, templates, settings } from '../settings.js';
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
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventRepeat: [settings.db.repeatParam, endDateParam],
    };
    // console.log('getData params:', params);

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.booking.join('&'),
      eventCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventCurrent.join('&'),
      eventRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventRepeat.join('&'),
    };
    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventCurrent),
      fetch(urls.eventRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventCurrentResponse = allResponses[1];
        const eventRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventCurrentResponse.json(),
          eventRepeatResponse.json(),
        ]);
      })
      .then(function ([booking, eventCurrent, eventRepeat]) {
        console.log('bookings::', booking);
        console.log('eventCurrent::', eventCurrent);
        console.log('eventRepeat::', eventRepeat);
      });
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
