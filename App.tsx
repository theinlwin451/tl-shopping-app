import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { AppState, Product, CartItem, Size, Order } from './types';
import { MOCK_PRODUCTS, formatPrice } from './utils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.BROWSING);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopPhone, setShopPhone] = useState('09123456789');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(undefined);

  // Checkout State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Admin Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Clothing',
    description: '',
    image: 'https://picsum.photos/seed/' + Math.random() + '/600/800',
    sizes: []
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('stylehub_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedOrders = localStorage.getItem('stylehub_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedPhone = localStorage.getItem('stylehub_phone');
    if (savedPhone) setShopPhone(savedPhone);
  }, []);

  const generateOrderText = (order: Order) => {
    const itemsText = order.items.map(i => `- ${i.name} ${i.selectedSize ? `(${i.selectedSize})` : ''} x ${i.quantity}`).join('\n');
    return `📦 *New Order: ${order.id}*\n\n👤 Customer: ${order.customerName}\n📞 Phone: ${order.customerPhone}\n📍 Address: ${order.customerAddress}\n\n🛒 Items:\n${itemsText}\n\n💰 Total: ${formatPrice(order.total)}\n\nOrder at: ${order.createdAt}`;
  };

  const sendToViber = (order: Order) => {
    const text = encodeURIComponent(generateOrderText(order));
    window.open(`viber://forward?text=${text}`, '_blank');
  };

  const sendToMessenger = (order: Order) => {
    const text = encodeURIComponent(generateOrderText(order));
    // Messenger doesn't support direct text pre-fill via URL as well as Viber, 
    // but we can use a share link or just copy to clipboard
    navigator.clipboard.writeText(generateOrderText(order));
    alert("Order details copied to clipboard! Opening Messenger...");
    window.open(`https://m.me/your_page_id`, '_blank');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category || 'Other',
      description: newProduct.description || '',
      image: newProduct.image || 'https://picsum.photos/seed/default/600/800',
      sizes: newProduct.sizes as Size[]
    };

    const updatedProducts = [product, ...products];
    setProducts(updatedProducts);
    localStorage.setItem('stylehub_products', JSON.stringify(updatedProducts));
    setAppState(AppState.BROWSING);
    setNewProduct({
      name: '',
      price: 0,
      category: 'Clothing',
      description: '',
      image: 'https://picsum.photos/seed/' + Math.random() + '/600/800',
      sizes: []
    });
  };

  const handleConfirmOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Please fill in all delivery information");
      return;
    }

    const newOrder: Order = {
      id: 'SH-' + Math.floor(Math.random() * 100000),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      items: [...cart],
      total: cartTotal + 2000,
      status: 'Pending',
      createdAt: new Date().toLocaleString()
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('stylehub_orders', JSON.stringify(updatedOrders));
    setAppState(AppState.ORDER_SUCCESS);
  };

  const addToCart = (product: Product, size?: Size) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, selectedSize: size, quantity: 1 }];
    });
    setAppState(AppState.CART);
  };

  const removeFromCart = (id: string, size?: Size) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const updateQuantity = (id: string, size: Size | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderProductCard = (product: Product) => (
    <motion.div 
      key={product.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => {
        setSelectedProduct(product);
        setSelectedSize(product.sizes?.[0]);
        setAppState(AppState.PRODUCT_DETAIL);
      }}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-stone-500">
          {product.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-stone-900 font-bold">{formatPrice(product.price)}</span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-medium text-stone-500">4.8</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-bottom border-stone-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-stone-100 rounded-full transition-colors lg:hidden">
              <Menu size={20} />
            </button>
            <h1 
              className="text-xl font-black tracking-tighter cursor-pointer"
              onClick={() => setAppState(AppState.BROWSING)}
            >
              STYLEHUB<span className="text-stone-400">.MM</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-500">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`hover:text-stone-900 transition-colors ${selectedCategory === cat ? 'text-stone-900 font-bold' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <Search size={20} />
            </button>
            <button 
              className="p-2 hover:bg-stone-100 rounded-full transition-colors relative"
              onClick={() => setAppState(AppState.CART)}
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-stone-900 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {appState === AppState.BROWSING && (
            <motion.div 
              key="browsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="relative h-[280px] md:h-[450px] rounded-3xl overflow-hidden bg-stone-900">
                <img 
                  src="https://picsum.photos/seed/fashion/1200/600" 
                  className="w-full h-full object-cover opacity-60"
                  alt="Hero"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-16 text-white max-w-2xl">
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-7xl font-black tracking-tight mb-2 md:mb-6 leading-none"
                  >
                    NEW SUMMER <br/> COLLECTION
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-stone-300 text-xs md:text-lg mb-4 md:mb-10 max-w-md line-clamp-2 md:line-clamp-none"
                  >
                    Discover the latest trends in Myanmar fashion. Premium quality, local prices.
                  </motion.p>
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white text-stone-900 px-6 md:px-10 py-2 md:py-4 rounded-full font-bold text-sm md:text-base w-fit hover:bg-stone-200 transition-colors shadow-lg"
                  >
                    Shop Now
                  </motion.button>
                </div>
              </div>

              {/* Categories Mobile */}
              <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-stone-900 text-white' 
                        : 'bg-white text-stone-500 border border-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredProducts.map(renderProductCard)}
              </div>
            </motion.div>
          )}

          {appState === AppState.PRODUCT_DETAIL && selectedProduct && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16"
            >
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-xl">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col justify-center space-y-8">
                <button 
                  onClick={() => setAppState(AppState.BROWSING)}
                  className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors w-fit"
                >
                  <ArrowLeft size={20} /> Back to Shop
                </button>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 block">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-4xl font-black tracking-tight text-stone-900 mb-4">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-2xl font-bold text-stone-900">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
                <p className="text-stone-500 leading-relaxed">
                  {selectedProduct.description}
                </p>

                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-900">
                        Select Size
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 rounded-xl border-2 font-bold transition-all ${
                            selectedSize === size 
                              ? 'border-stone-900 bg-stone-900 text-white' 
                              : 'border-stone-200 text-stone-400 hover:border-stone-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => addToCart(selectedProduct, selectedSize)}
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>
            </motion.div>
          )}

          {appState === AppState.CART && (
            <motion.div 
              key="cart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight">Your Cart</h2>
                <button 
                  onClick={() => setAppState(AppState.BROWSING)}
                  className="text-stone-500 hover:text-stone-900 font-medium"
                >
                  Continue Shopping
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-stone-500 font-medium">Your cart is empty</p>
                  <button 
                    onClick={() => setAppState(AppState.BROWSING)}
                    className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedSize || 'nosize'}`} className="bg-white p-4 rounded-2xl flex gap-4 border border-stone-100 shadow-sm">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-stone-900">{item.name}</h3>
                            {item.selectedSize && (
                              <span className="text-xs font-bold text-stone-400">Size: {item.selectedSize}</span>
                            )}
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 bg-stone-50 rounded-lg px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                              className="p-1 hover:text-stone-900 text-stone-400"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                              className="p-1 hover:text-stone-900 text-stone-400"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-bold text-stone-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-white p-6 rounded-3xl space-y-4 border border-stone-100 shadow-xl">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Delivery</span>
                      <span>{formatPrice(2000)}</span>
                    </div>
                    <div className="h-px bg-stone-100" />
                    <div className="flex justify-between text-xl font-black">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal + 2000)}</span>
                    </div>
                    <button 
                      onClick={() => setAppState(AppState.CHECKOUT)}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {appState === AppState.CHECKOUT && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setAppState(AppState.CART)} className="p-2 hover:bg-stone-100 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-3xl font-black tracking-tight">Checkout</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">KPay / WavePay</h3>
                        <p className="text-xs text-stone-400">Scan QR to pay</p>
                      </div>
                    </div>
                    <CheckCircle2 className="text-stone-900" size={24} />
                  </div>
                  <div className="aspect-square bg-stone-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-stone-200">
                    <div className="text-center space-y-2">
                      <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-sm mx-auto">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=StyleHubPayment" alt="QR Code" />
                      </div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Scan with KPay or Wave</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-4 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-400">Credit Card</h3>
                      <p className="text-xs text-stone-400">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-6 shadow-sm">
                <h3 className="font-bold text-lg">Delivery Information</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                  />
                  <textarea 
                    placeholder="Delivery Address" 
                    value={customerInfo.address}
                    onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-900 outline-none transition-all h-24 resize-none" 
                  />
                </div>
              </div>

              <button 
                onClick={handleConfirmOrder}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
              >
                Confirm Order & Pay {formatPrice(cartTotal + 2000)}
              </button>
            </motion.div>
          )}

          {appState === AppState.ORDER_SUCCESS && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto py-20 text-center space-y-8"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight">ORDER PLACED!</h2>
                <p className="text-stone-500">Thank you for shopping with StyleHub. Your order is being processed.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm text-left">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm text-stone-500">
                  <div className="flex justify-between">
                    <span>Order ID</span>
                    <span className="font-mono text-stone-900">{orders[0]?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="text-green-600 font-bold">Paid</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Notify Shop Owner via:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => sendToViber(orders[0])}
                    className="flex items-center justify-center gap-2 bg-[#7360f2] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Viber
                  </button>
                  <button 
                    onClick={() => sendToMessenger(orders[0])}
                    className="flex items-center justify-center gap-2 bg-[#0084ff] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Messenger
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setCart([]);
                  setCustomerInfo({ name: '', phone: '', address: '' });
                  setAppState(AppState.BROWSING);
                }}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold"
              >
                Back to Home
              </button>
            </motion.div>
          )}

          {appState === AppState.ADMIN && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setAppState(AppState.BROWSING)} className="p-2 hover:bg-stone-100 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-3xl font-black tracking-tight">Admin Dashboard</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl space-y-4">
                    <h3 className="text-lg font-bold">Shop Settings</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Shop Phone (for Viber)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={shopPhone}
                          onChange={e => {
                            setShopPhone(e.target.value);
                            localStorage.setItem('stylehub_phone', e.target.value);
                          }}
                          className="flex-1 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl space-y-6">
                    <h3 className="text-xl font-bold">Add New Product</h3>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-stone-400">Name</label>
                        <input 
                          type="text" 
                          required
                          value={newProduct.name}
                          onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-stone-400">Price</label>
                        <input 
                          type="number" 
                          required
                          value={newProduct.price || ''}
                          onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-stone-400">Category</label>
                        <select 
                          value={newProduct.category}
                          onChange={e => {
                            const cat = e.target.value;
                            setNewProduct({
                              ...newProduct, 
                              category: cat,
                              // Auto-clear sizes if not clothing or shoes
                              sizes: (cat === 'Clothing' || cat === 'Shoes') ? newProduct.sizes : []
                            });
                          }}
                          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-sm outline-none"
                        >
                          <option value="Clothing">Clothing</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-stone-400">Description</label>
                        <textarea 
                          value={newProduct.description}
                          onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-sm outline-none h-20 resize-none"
                          placeholder="Product details..."
                        />
                      </div>
                      {(newProduct.category === 'Clothing' || newProduct.category === 'Shoes') && (
                        <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="hasSizes"
                              checked={!!newProduct.sizes?.length}
                              onChange={e => {
                                const defaultSizes = newProduct.category === 'Clothing' 
                                  ? ['S', 'M', 'L', 'XL', 'XXL'] 
                                  : ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
                                setNewProduct({
                                  ...newProduct, 
                                  sizes: e.target.checked ? defaultSizes : []
                                });
                              }}
                              className="w-4 h-4 accent-stone-900"
                            />
                            <label htmlFor="hasSizes" className="text-xs font-bold uppercase text-stone-900 cursor-pointer">
                              Enable Size Selection
                            </label>
                          </div>
                          
                          {!!newProduct.sizes?.length && (
                            <div className="space-y-2 pt-2 border-t border-stone-200">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase text-stone-400">Select Available Sizes</label>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(newProduct.category === 'Clothing' 
                                  ? ['S', 'M', 'L', 'XL', 'XXL'] 
                                  : ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
                                ).map(size => (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => {
                                      const currentSizes = newProduct.sizes || [];
                                      if (currentSizes.includes(size)) {
                                        setNewProduct({ ...newProduct, sizes: currentSizes.filter(s => s !== size) });
                                      } else {
                                        setNewProduct({ ...newProduct, sizes: [...currentSizes, size] });
                                      }
                                    }}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                                      (newProduct.sizes || []).includes(size)
                                        ? 'bg-stone-900 text-white border-stone-900'
                                        : 'bg-white text-stone-400 border-stone-200'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-stone-400">Product Image</label>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl overflow-hidden flex items-center justify-center group relative">
                            {newProduct.image ? (
                              <img src={newProduct.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Plus size={16} className="text-stone-300" />
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setNewProduct({...newProduct, image: reader.result as string});
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                          <p className="text-[10px] text-stone-400">Click to upload</p>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm">
                        Add Product
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                    <h3 className="font-bold mb-4">Inventory ({products.length})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {products.map((p, idx) => (
                        <div key={`${p.id}-${idx}`} className="flex items-center justify-between text-xs p-2 bg-stone-50 rounded-lg">
                          <span className="font-medium truncate max-w-[120px]">{p.name}</span>
                          <button 
                            onClick={() => {
                              const updated = products.filter(item => item.id !== p.id);
                              setProducts(updated);
                              localStorage.setItem('stylehub_products', JSON.stringify(updated));
                            }}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Recent Orders 
                        <span className="bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded-full">{orders.length}</span>
                      </div>
                      {orders.length > 0 && (
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to clear all orders? This cannot be undone.")) {
                              setOrders([]);
                              localStorage.setItem('stylehub_orders', JSON.stringify([]));
                            }
                          }}
                          className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest"
                        >
                          Clear All
                        </button>
                      )}
                    </h3>
                    
                    {orders.length === 0 ? (
                      <div className="py-20 text-center text-stone-400">
                        <ShoppingBag size={40} className="mx-auto mb-2 opacity-20" />
                        <p>No orders yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map(order => (
                          <div key={order.id} className="border border-stone-100 rounded-2xl p-4 space-y-4 hover:border-stone-200 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div>
                                <h4 className="font-black text-stone-900">{order.id}</h4>
                                <p className="text-xs text-stone-400">{order.createdAt}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                  {order.status}
                                </span>
                                <span className="font-bold">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-50">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase text-stone-400">Customer</p>
                                <p className="text-sm font-bold">{order.customerName}</p>
                                <p className="text-sm text-stone-500">{order.customerPhone}</p>
                                <p className="text-xs text-stone-400 leading-relaxed">{order.customerAddress}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase text-stone-400">Items</p>
                                <div className="space-y-1">
                                  {order.items.map((item, idx) => (
                                    <p key={`${order.id}-${item.id}-${item.selectedSize || 'nosize'}-${idx}`} className="text-xs text-stone-600 flex justify-between">
                                      <span>{item.quantity}x {item.name} {item.selectedSize ? `(${item.selectedSize})` : ''}</span>
                                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button 
                                onClick={() => {
                                  const updated = orders.filter(o => o.id !== order.id);
                                  setOrders(updated);
                                  localStorage.setItem('stylehub_orders', JSON.stringify(updated));
                                }}
                                className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest"
                              >
                                Delete Order
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h1 className="text-xl font-black tracking-tighter">STYLEHUB<span className="text-stone-400">.MM</span></h1>
            <p className="text-stone-500 text-sm">Premium fashion destination in Myanmar. Quality you can trust.</p>
            <button 
              onClick={() => setAppState(AppState.ADMIN)}
              className="text-[10px] font-bold uppercase tracking-widest text-stone-300 hover:text-stone-900 transition-colors"
            >
              Manage Store (Admin)
            </button>
          </div>
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="text-stone-500 text-sm space-y-2">
              <li>New Arrivals</li>
              <li>Best Sellers</li>
              <li>Men's Fashion</li>
              <li>Women's Fashion</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="text-stone-500 text-sm space-y-2">
              <li>Shipping Policy</li>
              <li>Returns & Exchanges</li>
              <li>FAQs</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Payment Methods</h4>
            <div className="flex gap-2">
              <div className="bg-stone-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-stone-100">KPAY</div>
              <div className="bg-stone-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-stone-100">WAVEPAY</div>
              <div className="bg-stone-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-stone-100">CASH</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-50 text-center text-stone-400 text-xs">
          © 2024 StyleHub Myanmar. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
