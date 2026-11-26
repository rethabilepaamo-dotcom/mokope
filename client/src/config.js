// Edit these details to match the coffee shop. They appear in the header, footer and home page.
export const SHOP = {
  name: 'Lesedi Coffee House',
  tagline: 'Freshly brewed. Made for Maseru.',
  address: 'Maseru, Lesotho',
  phone: '+266 5000 0000',
  email: 'hello@lesedicoffee.example',
  hours: [
    ['Monday to Friday', '07:00 – 18:00'],
    ['Saturday', '08:00 – 17:00'],
    ['Sunday', '09:00 – 14:00'],
  ],
};

export const CATEGORIES = ['Coffee', 'Tea', 'Cold Drinks', 'Pastries', 'Light Bites'];
export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Collected'];

// Pictures that ship with the site; staff can pick one when adding or editing a menu item.
export const BUILT_IN_IMAGES = [
  ['espresso', 'Espresso'], ['americano', 'Americano'], ['cappuccino', 'Cappuccino'], ['latte', 'Latte'],
  ['flat-white', 'Flat white'], ['mocha', 'Mocha'], ['rooibos', 'Rooibos tea'], ['chai', 'Chai latte'],
  ['green-tea', 'Green tea'], ['iced-latte', 'Iced latte'], ['frappe', 'Frappé'], ['croissant', 'Croissant'],
  ['muffin', 'Muffin'], ['cinnamon-roll', 'Cinnamon roll'], ['chocolate-cake', 'Chocolate cake'],
  ['chicken-sandwich', 'Chicken sandwich'], ['cheese-sandwich', 'Cheese toastie'],
].map(([slug, label]) => ({ value: `/images/menu/${slug}.svg`, label }));
