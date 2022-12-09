import { templates } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.element = element;

    thisHome.render();
  }

  render() {
    const thisHome = this;

    const generateHTML = templates.homePage();

    thisHome.dom = thisHome.element;

    const generateDom = utils.createDOMFromHTML(generateHTML);

    thisHome.dom.appendChild(generateDom);
  }
}
export default Home;
