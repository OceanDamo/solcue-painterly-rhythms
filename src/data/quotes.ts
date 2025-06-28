
export interface Quote {
  text: string;
  author: string;
  origin: string;
}

export const quotes: Quote[] = [
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson", origin: "USA" },
  { text: "The sun shines not on us but in us.", author: "John Muir", origin: "Scotland/USA" },
  { text: "To sit in the shade on a fine day and look upon verdure is the most perfect refreshment.", author: "Jane Austen", origin: "England" },
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive.", author: "Marcus Aurelius", origin: "Rome" },
  { text: "May the road rise up to meet you. May the sun shine warm upon your face.", author: "Irish Blessing", origin: "Ireland" },
  { text: "Look deep into nature, and then you will understand everything better.", author: "Albert Einstein", origin: "Germany/USA" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu", origin: "China" },
  { text: "Live in each season as it passes; breathe the air, drink the drink, taste the fruit.", author: "Henry David Thoreau", origin: "USA" },
  { text: "A man's heart away from nature becomes hard.", author: "Standing Bear", origin: "Lakota Nation" },
  { text: "The moon moves slowly, but it crosses the town.", author: "African Proverb", origin: "Congo" },
  { text: "Light is the shadow of God.", author: "Plato", origin: "Greece" },
  { text: "The earth has music for those who listen.", author: "George Santayana", origin: "Spain/USA" },
  { text: "He who learns to listen to the trees, no longer desires to be a tree himself.", author: "Hermann Hesse", origin: "Germany" },
  { text: "In every walk with nature one receives far more than he seeks.", author: "John Muir", origin: "Scotland/USA" },
  { text: "Touch the earth, speak with the sun.", author: "Hopi Proverb", origin: "Hopi Nation" },
  { text: "The clearest way into the Universe is through a forest wilderness.", author: "John Muir", origin: "Scotland/USA" },
  { text: "Let us walk softly on the Earth with all living beings great and small.", author: "Indigenous Teaching", origin: "Various Nations" },
  { text: "Even after all this time, the sun never says to the earth, 'You owe me.'", author: "Hafiz", origin: "Persia (Iran)" },
  { text: "Listen to the wind, it talks. Listen to the silence, it speaks.", author: "Native American Proverb", origin: "Navajo Nation" },
  { text: "Those who contemplate the beauty of the earth find reserves of strength that will endure.", author: "Rachel Carson", origin: "USA" },
  { text: "We return thanks to the sun, that has looked upon the earth with a beneficent eye.", author: "Haudenosaunee Thanksgiving Address", origin: "Indigenous" },
  { text: "Let the beauty we love be what we do. There are hundreds of ways to kneel and kiss the ground.", author: "Rumi", origin: "Persia (Iran)" },
  { text: "Time spent amongst trees is never wasted time.", author: "Katrina Mayer", origin: "USA" },
  { text: "Walk as if you are kissing the Earth with your feet.", author: "Thich Nhat Hanh", origin: "Vietnam" },
  { text: "I am the breeze that nurtures all things green.", author: "Hildegard of Bingen", origin: "Germany" },
  { text: "Nature is not a place to visit. It is home.", author: "Gary Snyder", origin: "USA" },
  { text: "The body is the shore on the ocean of being.", author: "Sufi Saying", origin: "Islamic" },
  { text: "When you light a lamp for someone else, it also brightens your path.", author: "Buddha", origin: "India" },
  { text: "We are part of the Earth and it is part of us.", author: "Chief Seattle", origin: "Duwamish Nation" },
  { text: "Sky above, earth below, peace within.", author: "Unknown", origin: "Universal" },
  { text: "The sun is new each day.", author: "Heraclitus", origin: "Greece" },
  { text: "To forget how to dig the earth and to tend the soil is to forget ourselves.", author: "Mahatma Gandhi", origin: "India" },
  { text: "The world is full of magic things, patiently waiting for our senses to grow sharper.", author: "W.B. Yeats", origin: "Ireland" },
  { text: "As the ocean is never full of water, so is the heart never full of love.", author: "Zulu Proverb", origin: "South Africa" },
  { text: "The rhythm of the body, the melody of the mind & the harmony of the soul create the symphony of life.", author: "B.K.S. Iyengar", origin: "India" },
  { text: "After you have exhausted what there is in business, politics, and a love life, what remains? Nature.", author: "Walt Whitman", origin: "USA" },
  { text: "We are stardust, we are golden.", author: "Joni Mitchell", origin: "Canada" },
  { text: "It is not the mountain we conquer, but ourselves.", author: "Sir Edmund Hillary", origin: "New Zealand" },
  { text: "We do not inherit the Earth from our ancestors, we borrow it from our children.", author: "Native American Proverb", origin: "Indigenous" },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo", origin: "France" },
  { text: "Sunlight is painting.", author: "Nathaniel Hawthorne", origin: "USA" },
  { text: "All flourishing is mutual.", author: "Robin Wall Kimmerer", origin: "Potawatomi Nation" },
  { text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", author: "Marcel Proust", origin: "France" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius", origin: "China" },
  { text: "Daylight follows a dark night.", author: "Maasai Proverb", origin: "Kenya" },
  { text: "Let nature be your teacher.", author: "William Wordsworth", origin: "England" },
  { text: "You carry Mother Earth within you.", author: "Thich Nhat Hanh", origin: "Vietnam" },
  { text: "The sky is the daily bread of the eyes.", author: "Ralph Waldo Emerson", origin: "USA" }
];

export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
