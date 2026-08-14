import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const packages = [
  {
    name: 'Goa Beach Paradise',
    destination: 'Goa',
    description:
      'Experience the stunning beaches, vibrant nightlife, and Portuguese heritage of Goa. Perfect for beach lovers and party enthusiasts alike.',
    price: 15000,
    duration: 5,
    availableSeats: 20,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    itinerary:
      'Day 1: Arrival at Goa airport, hotel check-in, evening at Baga Beach\nDay 2: North Goa tour - Calangute, Anjuna, Vagator beaches\nDay 3: Old Goa heritage - Basilica of Bom Jesus, Se Cathedral, Fontainhas\nDay 4: South Goa - Palolem Beach, Colva Beach, water sports\nDay 5: Dudhsagar Falls excursion, departure',
  },
  {
    name: 'Kerala Backwaters Escape',
    destination: 'Kerala',
    description:
      'Cruise through the serene backwaters of Kerala on a traditional houseboat. Enjoy lush greenery, coconut groves, and authentic Kerala cuisine.',
    price: 22000,
    duration: 6,
    availableSeats: 15,
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    itinerary:
      'Day 1: Arrive Kochi, Fort Kochi sightseeing, Kathakali performance\nDay 2: Drive to Munnar, tea garden tour\nDay 3: Munnar - Eravikulam National Park, Mattupetty Dam\nDay 4: Drive to Alleppey, board houseboat\nDay 5: Backwater cruise to Kollam, village walks\nDay 6: Kovalam Beach, departure from Trivandrum',
  },
  {
    name: 'Rajasthan Royal Heritage',
    destination: 'Rajasthan',
    description:
      'Explore the land of kings with visits to majestic forts, colourful bazaars, and golden sand dunes. Experience a camel safari under the stars.',
    price: 28000,
    duration: 7,
    availableSeats: 18,
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed31920?w=800',
    itinerary:
      'Day 1: Arrive Jaipur, Amber Fort, City Palace\nDay 2: Jaipur - Hawa Mahal, Jantar Mantar, local bazaars\nDay 3: Drive to Pushkar, Brahma Temple, Pushkar Lake\nDay 4: Drive to Jodhpur, Mehrangarh Fort, Jaswant Thada\nDay 5: Drive to Jaisalmer, Sonar Fort\nDay 6: Sam Sand Dunes, camel safari, cultural evening\nDay 7: Drive to Bikaner, departure',
  },
  {
    name: 'Himalayan Adventure - Manali',
    destination: 'Himachal Pradesh',
    description:
      'Thrill-seekers paradise! Enjoy snow-capped peaks, river rafting, paragliding and the scenic Rohtang Pass. Perfect for adventure and nature lovers.',
    price: 18500,
    duration: 6,
    availableSeats: 12,
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    itinerary:
      'Day 1: Arrive Manali, hotel check-in, Mall Road evening\nDay 2: Solang Valley - skiing, zorbing, paragliding\nDay 3: Rohtang Pass excursion (subject to weather)\nDay 4: Kullu - river rafting on Beas, Manikaran hot springs\nDay 5: Old Manali, Hadimba Devi Temple, Vashisht village\nDay 6: Departure from Manali',
  },
  {
    name: 'Andaman Island Getaway',
    destination: 'Andaman & Nicobar Islands',
    description:
      'Discover crystal-clear waters, white sandy beaches, and vibrant coral reefs. Enjoy scuba diving, snorkelling, and the historic Cellular Jail.',
    price: 35000,
    duration: 7,
    availableSeats: 10,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    itinerary:
      'Day 1: Arrive Port Blair, Cellular Jail light & sound show\nDay 2: Ross Island, North Bay Island snorkelling\nDay 3: Ferry to Havelock Island, Radhanagar Beach\nDay 4: Havelock - Elephant Beach scuba diving\nDay 5: Ferry to Neil Island, Bharatpur & Laxmanpur beaches\nDay 6: Return Port Blair, Anthropological Museum\nDay 7: Corbyn\'s Cove Beach, departure',
  },
  {
    name: 'Varanasi Spiritual Journey',
    destination: 'Uttar Pradesh',
    description:
      'Experience the spiritual capital of India. Witness the mesmerizing Ganga Aarti, ancient ghats, and the sacred rituals of one of the world\'s oldest living cities.',
    price: 12000,
    duration: 4,
    availableSeats: 25,
    imageUrl: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800',
    itinerary:
      'Day 1: Arrive Varanasi, evening Dashashwamedh Ghat Aarti\nDay 2: Sunrise boat ride on Ganges, Kashi Vishwanath Temple, Sarnath\nDay 3: Ghats walk - Manikarnika, Assi, Tulsi Ghat, silk weaving workshop\nDay 4: Morning meditation session, Ramnagar Fort, departure',
  },
];

async function main() {
  console.log('Seeding database...');

  // Clear existing packages
  await prisma.package.deleteMany();
  console.log('Cleared existing packages');

  for (const pkg of packages) {
    const created = await prisma.package.create({ data: pkg });
    console.log(`✓ Created: ${created.name}`);
  }

  console.log(`\nSeed complete! ${packages.length} packages added.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
