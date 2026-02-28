export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-MM', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
  }).format(price).replace('MMK', 'Ks');
};

export const MOCK_PRODUCTS: any[] = [
  {
    id: '1',
    name: 'Classic White Tee',
    price: 15000,
    category: 'Clothing',
    image: 'https://picsum.photos/seed/tee/600/800',
    description: 'Premium cotton basic tee for everyday wear.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: '2',
    name: 'Denim Jacket',
    price: 45000,
    category: 'Clothing',
    image: 'https://picsum.photos/seed/jacket/600/800',
    description: 'Vintage wash denim jacket with reinforced stitching.',
    sizes: ['M', 'L', 'XL']
  },
  {
    id: '3',
    name: 'Smart Watch Pro',
    price: 85000,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/watch/600/800',
    description: 'Stay connected with our latest smart watch.',
  },
  {
    id: '4',
    name: 'Leather Wallet',
    price: 25000,
    category: 'Accessories',
    image: 'https://picsum.photos/seed/wallet/600/800',
    description: 'Handcrafted genuine leather wallet.',
  },
  {
    id: '5',
    name: 'Summer Linen Shirt',
    price: 32000,
    category: 'Clothing',
    image: 'https://picsum.photos/seed/shirt/600/800',
    description: 'Breathable linen shirt perfect for hot weather.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '6',
    name: 'Wireless Earbuds',
    price: 55000,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/earbuds/600/800',
    description: 'Crystal clear sound with noise cancellation.',
  },
  {
    id: '7',
    name: 'Urban Sneakers',
    price: 65000,
    category: 'Shoes',
    image: 'https://picsum.photos/seed/sneakers/600/800',
    description: 'Comfortable and stylish sneakers for daily use.',
    sizes: ['38', '39', '40', '41', '42', '43']
  }
];
