// In a real app, this would come from a database.
// Find image URLs online for these places.
export const districts = {
  "Kota Kinabalu": {
    description:
      "The vibrant capital of Sabah, offering a mix of urban life, beautiful islands, and cultural markets.",
    background: "/backgrounds/explore-bg.jpg", // Example path
    attractions: [
      {
        name: "Tunku Abdul Rahman Park",
        image:
          "https://echoadventures.com.my/storage/media/tours/152/01HR6GC1ENF88V9MW61JW592AR.jpg",
        desc: "A cluster of 5 idyllic islands perfect for snorkeling, diving, and relaxing.",
      },
      {
        name: "Gaya Street Sunday Market",
        image:
          "https://image.arrivalguides.com/1230x800/13/5d4a49872143618f088cebf3c5229b73.jpg",
        desc: "A bustling weekly market offering everything from local crafts to delicious street food.",
      },
      {
        name: "Signal Hill Observatory",
        image:
          "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/d1/d2/ce/signal-hill-sunset.jpg?w=1400&h=800&s=1",
        desc: "Offers a stunning panoramic view of Kota Kinabalu city and the surrounding islands.",
      },
    ],
    stamps: [
      {
        id: "stamp_kk_1",
        name: "TAR Park Visit",
        location: "Tunku Abdul Rahman Park",
      },
    ],
  },
  Ranau: {
    description:
      "Nestled in the highlands, Ranau is the gateway to Mount Kinabalu and home to stunning natural landscapes.",
    background: "/backgrounds/explore-bg.jpg",
    attractions: [
      {
        name: "Mount Kinabalu",
        image:
          "https://lp-cms-production.imgix.net/2024-10/GettyRF641291398.jpg?auto=format,compress&q=72&fit=crop",
        desc: "Malaysia's highest peak, a UNESCO World Heritage site and a climber's paradise.",
      },
      {
        name: "Poring Hot Springs",
        image:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/0d/57/0f/caption.jpg?w=1100&h=800&s=1",
        desc: "Natural hot sulphur springs where you can relax your muscles after a long hike.",
      },
      {
        name: "Desa Dairy Farm",
        image:
          "https://myhalalxplorer.com/wp-content/uploads/2023/06/image-25.jpg",
        desc: "Known as the 'Little New Zealand' of Sabah, offering fresh dairy products and breathtaking views.",
      },
    ],
    stamps: [
      {
        id: "stamp_ranau_1",
        name: "Desa Farm Selfie",
        location: "Desa Dairy Farm",
      },
    ],
  },
  Sandakan: {
    description:
      "A historical town rich in wildlife, known for its orangutan sanctuary and proboscis monkeys.",
    background: "/backgrounds/explore-bg.jpg",
    attractions: [
      {
        name: "Sepilok Orangutan Rehabilitation Centre",
        image:
          "https://cdn.audleytravel.com/1050/750/79/15975748-baby-orangutan-at-the-sanctuary.webp",
        desc: "Watch orphaned orangutans being rehabilitated for their return to the wild.",
      },
      {
        name: "Kinabatangan River",
        image:
          "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=620,height=400,dpr=2/tour_img/44767ef5665909872675388587d66ff3b87b38dcda2927e8c0071939bbd0eb1b.jpg",
        desc: "Take a river cruise to spot proboscis monkeys, pygmy elephants, and diverse birdlife.",
      },
      {
        name: "Agnes Keith House",
        image: "https://helengray.net/_Media/_mg_9967_med.jpeg",
        desc: "A restored colonial house offering a glimpse into Sabah's pre-war history.",
      },
    ],
    stamps: [
      { id: "stamp_sdk_1", name: "Orangutan Sighting", location: "Sepilok" },
    ],
  },
};
