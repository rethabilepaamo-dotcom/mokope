import crypto from 'node:crypto';

/** Starter menu. All prices are in Maloti (M). */
const STARTER_MENU = [
  ['Espresso', 'Coffee', 22, 'espresso', 'A short, intense shot of our house blend with a golden crema.'],
  ['Americano', 'Coffee', 28, 'americano', 'Double espresso lengthened with hot water. Smooth and clean.'],
  ['Cappuccino', 'Coffee', 35, 'cappuccino', 'Espresso topped with velvety steamed milk and a deep layer of foam.'],
  ['Café Latte', 'Coffee', 38, 'latte', 'Espresso with silky steamed milk and a thin crown of microfoam.'],
  ['Flat White', 'Coffee', 36, 'flat-white', 'A double ristretto with finely textured milk. Strong and creamy.'],
  ['Mocha', 'Coffee', 42, 'mocha', 'Espresso, rich dark chocolate and steamed milk, finished with whipped cream.'],
  ['Rooibos Tea', 'Tea', 25, 'rooibos', 'Naturally caffeine-free red bush tea, served hot with honey on request.'],
  ['Chai Latte', 'Tea', 38, 'chai', 'Spiced black tea simmered with milk, cinnamon and cardamom.'],
  ['Green Tea', 'Tea', 24, 'green-tea', 'Delicate, fresh and lightly grassy. Brewed to order.'],
  ['Iced Latte', 'Cold Drinks', 40, 'iced-latte', 'Chilled espresso poured over ice and cold milk. Refreshing and smooth.'],
  ['Caramel Frappé', 'Cold Drinks', 48, 'frappe', 'Blended iced coffee with caramel, topped with whipped cream.'],
  ['Butter Croissant', 'Pastries', 25, 'croissant', 'Flaky, golden and baked fresh every morning.'],
  ['Blueberry Muffin', 'Pastries', 28, 'muffin', 'Soft vanilla muffin packed with juicy blueberries.'],
  ['Cinnamon Roll', 'Pastries', 30, 'cinnamon-roll', 'Warm, gooey spiral of cinnamon sugar with vanilla glaze.'],
  ['Chocolate Cake Slice', 'Pastries', 45, 'chocolate-cake', 'Three layers of moist chocolate sponge with rich ganache.'],
  ['Chicken Mayo Sandwich', 'Light Bites', 55, 'chicken-sandwich', 'Toasted bread with shredded chicken, lettuce, tomato and creamy mayo.'],
  ['Cheese & Tomato Toastie', 'Light Bites', 48, 'cheese-sandwich', 'Grilled until golden with melted cheddar and ripe tomato.'],
];

export async function seedMenuIfEmpty(store) {
  if (await store.get('meta:seeded')) return false;
  const existing = await store.list('menu:');
  if (existing.length === 0) {
    const now = new Date().toISOString();
    for (const [name, category, price, slug, description] of STARTER_MENU) {
      const id = crypto.randomUUID();
      await store.set(`menu:${id}`, {
        id,
        name,
        category,
        price,
        description,
        available: true,
        image: `/images/menu/${slug}.svg`,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`Seeded ${STARTER_MENU.length} starter menu items.`);
  }
  await store.set('meta:seeded', true);
  return true;
}
