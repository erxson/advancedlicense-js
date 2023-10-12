import { License } from './license.js';

const license = new License('xxxx-xxxx-xxxx-xxxx');

license.isValid().then((validationType) => {
  console.log(validationType)
});
