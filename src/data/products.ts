// src/data/products.ts

export type Product = {
  id: string;
  name: string;
  slug: string;
  condition: string;
  price: number;
  priceFormatted: string;
  image: string;
};

// The image paths are now local
export const products: Product[] = [
  { id: "1", name: "2025-26 AC Milan Home Shirt", slug: "milan-home-2526", condition: "Brand New", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/AC Milan 25_26 Home.png" },
  { id: "2", name: "2025-26 AC Milan Away Shirt (Player Issue)", slug: "milan-away-player-2526", condition: "Brand New", price: 2500000, priceFormatted: "Rp 2,500,000", image: "/images/AC MIlan 25_26 Away.png" },
  { id: "3", name: "2025-26 AC Milan Third Shirt", slug: "milan-third-2425", condition: "Used - Excellent", price: 800000, priceFormatted: "Rp 800,000", image: "/images/AC Milan 25_26 Third.png" },
  { id: "4", name: "2025-26 AC Milan Home Shirt Long Sleeve", slug: "milan-home-0607", condition: "Used - Very Good", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/AC Milan 25_26 Long Sleeve.png" },
  { id: "5", name: "1993-94 AC Milan Home Shirt", slug: "milan-home-9394", condition: "Used - Good", price: 800000, priceFormatted: "Rp 800,000", image: "/images/AC Milan 93_94 Home.png" },
  { id: "6", name: "2024-25 AC Milan x Off-White Jersey (Black)", slug: "milan-off-white-2324", condition: "Brand New", price: 2500000, priceFormatted: "Rp 2,500,000", image: "/images/AC Milan Off White 24_25 Black.png" },
  { id: "7", name: "2024-25 AC Milan x Off-White Jersey (Red)", slug: "milan-away-9596", condition: "Match Worn", price: 5000000, priceFormatted: "Rp 5,000,000", image: "/images/AC Milan Off White 24_25 Red.png" },
  { id: "8", name: "2010-11 AC Milan Home Shirt (Scudetto)", slug: "milan-home-1011", condition: "Used - Excellent", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/AC Milan 2010_2011 Home.png" },
  { id: "9", name: "2025-26 AC Milan Goalkeeper Shirt", slug: "milan-gk-2223", condition: "Brand New", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/AC Milan 25_26 Goalkeeper.png" },
  { id: "10", name: "1988-89 AC Milan Home Shirt (Dutch Trio)", slug: "milan-home-8889", condition: "Used - Good", price: 800000, priceFormatted: "Rp 800,000", image: "/images/AC Milan 89_90 Home.png" },
  { id: "11", name: "2014-15 AC Milan Third Shirt", slug: "milan-third-1415", condition: "Player Issue", price: 2500000, priceFormatted: "Rp 2,500,000", image: "/images/AC Milan 14_15 Third.png" },
  { id: "12", name: "2002-03 AC Milan Away Shirt (UCL Champion)", slug: "milan-away-0203", condition: "Used - Very Good", price: 800000, priceFormatted: "Rp 800,000", image: "/images/AC Milan 02_03 Away.png" },
  { id: "13", name: "AC Milan Special Edition 120 Years Shirt", slug: "milan-120-years", condition: "Match Worn", price: 5000000, priceFormatted: "Rp 5,000,000", image: "/images/yellow-jersey.png" },
  { id: "14", name: "1999-00 AC Milan Home Shirt", slug: "milan-home-9900", condition: "Used - Excellent", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/white-jersey.png" },
  { id: "15", name: "2018-19 AC Milan Away Shirt", slug: "milan-away-1819", condition: "Brand New", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/yellow-jersey.png" },
  { id: "16", name: "1990-91 AC Milan European Cup Shirt", slug: "milan-euro-9091", condition: "Player Issue", price: 2500000, priceFormatted: "Rp 2,500,000", image: "/images/white-jersey.png" },
  { id: "17", name: "2021-22 AC Milan Home Shirt", slug: "milan-home-2122", condition: "Used - Excellent", price: 800000, priceFormatted: "Rp 800,000", image: "/images/yellow-jersey.png" },
  { id: "18", name: "1997-98 AC Milan Away Shirt", slug: "milan-away-9798", condition: "Used - Good", price: 800000, priceFormatted: "Rp 800,000", image: "/images/white-jersey.png" },
  { id: "19", name: "AC Milan x Pleasures 2023 Collab", slug: "milan-pleasures-23", condition: "Brand New", price: 2500000, priceFormatted: "Rp 2,500,000", image: "/images/yellow-jersey.png" },
  { id: "20", name: "2004-05 AC Milan Home Shirt", slug: "milan-home-0405", condition: "Match Worn", price: 5000000, priceFormatted: "Rp 5,000,000", image: "/images/white-jersey.png" },
  { id: "21", name: "2016-17 AC Milan Third Shirt", slug: "milan-third-1617", condition: "Used - Very Good", price: 800000, priceFormatted: "Rp 800,000", image: "/images/yellow-jersey.png" },
  { id: "22", name: "1992-93 AC Milan Away Shirt", slug: "milan-away-9293", condition: "Player Issue", price: 2500000, priceFormatted: "Rp 2,500,000", image: "/images/white-jersey.png" },
  { id: "23", name: "2019-20 AC Milan Home Shirt", slug: "milan-home-1920", condition: "Brand New", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/yellow-jersey.png" },
  { id: "24", name: "2009-10 AC Milan Away Shirt", slug: "milan-away-0910", condition: "Used - Excellent", price: 1250000, priceFormatted: "Rp 1,250,000", image: "/images/white-jersey.png" },
];