// scripts/app.js
import { auth, db, googleProvider } from './firebase-config.js';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, onSnapshot, enableIndexedDbPersistence, doc, setDoc, getDoc, serverTimestamp, writeBatch } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Enable Offline Persistence for slow internet
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Persistence failed: multiple tabs open");
    } else if (err.code == 'unimplemented') {
        console.warn("Persistence is not available in this browser");
    }
});

// DOM Elements
const userDisplay = document.getElementById('user-display');
const cartCount = document.getElementById('cart-count');

// --- Auth State Listener ---
onAuthStateChanged(auth, async (user) => {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (user) {
        if (userDisplay) {
            userDisplay.innerText = user.displayName || user.email;
            userDisplay.style.display = 'inline';
        }
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline';
        
        console.log("User Logged In:", user.email);
        
        // Sync User Profile to Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName || "User",
                email: user.email,
                createdAt: serverTimestamp(),
                shippingAddress: "",
                billingAddress: "",
                phoneNumber: ""
            });
        }
    } else {
        if (userDisplay) {
            userDisplay.innerText = 'Guest';
            userDisplay.style.display = 'none';
        }
        if (loginBtn) loginBtn.style.display = 'inline';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
});

// --- Auth Functions ---
export const checkLogin = () => {
    if (!auth.currentUser) {
        alert("ကျေးဇူးပြု၍ Login အရင်ဝင်ပေးပါခင်ဗျာ။ (Please Login First)");
        const modal = document.getElementById('login-modal-overlay');
        if (modal) modal.style.display = 'block';
        return false;
    }
    return true;
};
window.checkLogin = checkLogin;

export const googleLogin = () => {
    console.log("Attempting Google Login...");
    signInWithPopup(auth, googleProvider).then((result) => {
        console.log("Google Login Success:", result.user.email);
        alert("Welcome " + (result.user.displayName || result.user.email));
        const modal = document.getElementById('login-modal-overlay');
        if (modal) modal.style.display = 'none';
        // Force a small delay then reload to ensure state is fresh
        setTimeout(() => window.location.reload(), 500);
    }).catch((error) => {
        console.error("Google Login Error:", error);
        const currentDomain = window.location.hostname;
        if (error.code === 'auth/popup-blocked') {
            alert("Popup blocked! ကျေးဇူးပြု၍ Browser ရဲ့ Popup Blocker ကို ပိတ်ပေးပါ (သို့မဟုတ်) ခွင့်ပြုပေးပါခင်ဗျာ။");
        } else if (error.code === 'auth/unauthorized-domain') {
            alert("Domain Error: အခုသုံးနေတဲ့ Domain (" + currentDomain + ") ကို Firebase မှာ ခွင့်ပြုချက် (Authorized Domain) ထည့်ရပါဦးမယ်။\n\nFirebase Console > Authentication > Settings > Authorized Domains မှာ အခု Domain ကို ထည့်ပေးပါခင်ဗျာ။");
        } else {
            alert("Google Login Error: " + error.message + "\n(Error Code: " + error.code + ")");
        }
    });
};
window.googleLogin = googleLogin;

export const emailSignUp = (email, password) => {
    if (!email || !password) return alert("ကျေးဇူးပြု၍ Email နှင့် Password ဖြည့်ပေးပါ");
    console.log("Attempting Email Sign Up...");
    createUserWithEmailAndPassword(auth, email, password)
    .then((result) => {
        console.log("Sign Up Success:", result.user.email);
        alert("Registered Successfully! (အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်)");
        const modal = document.getElementById('login-modal-overlay');
        if (modal) modal.style.display = 'none';
    })
    .catch((error) => {
        console.error("Sign Up Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            alert("ဤ Email သည် အသုံးပြုပြီးသား ဖြစ်နေပါသည်။ အခြား Email တစ်ခု သုံးပေးပါ သို့မဟုတ် Login ဝင်ပါခင်ဗျာ။");
        } else if (error.code === 'auth/weak-password') {
            alert("Password သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။");
        } else if (error.code === 'auth/invalid-email') {
            alert("Email ပုံစံ မှားယွင်းနေပါသည်။");
        } else {
            alert("Sign Up Error: " + error.message);
        }
    });
};
window.emailSignUp = emailSignUp;

export const emailLogin = (email, password) => {
    if (!email || !password) return alert("ကျေးဇူးပြု၍ Email နှင့် Password ဖြည့်ပေးပါ");
    console.log("Attempting Email Login...");
    signInWithEmailAndPassword(auth, email, password)
    .then((result) => {
        console.log("Login Success:", result.user.email);
        alert("Logged In! (Login ဝင်ပြီးပါပြီ)");
        const modal = document.getElementById('login-modal-overlay');
        if (modal) modal.style.display = 'none';
    })
    .catch((error) => {
        console.error("Login Error:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            alert("Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။ ကျေးဇူးပြု၍ ပြန်စစ်ပေးပါခင်ဗျာ။");
        } else if (error.code === 'auth/invalid-email') {
            alert("Email ပုံစံ မှားယွင်းနေပါသည်။");
        } else {
            alert("Login Error: " + error.message);
        }
    });
};
window.emailLogin = emailLogin;

export const logout = () => signOut(auth).then(() => window.location.reload());
window.logout = logout;

// --- Product Logic (Shared) ---
export async function loadProducts(containerId, filterCategory = 'all') {
    const container = document.getElementById(containerId);
    if(!container) {
        console.error("Container not found:", containerId);
        return;
    }
    
    console.log("Loading products for container:", containerId, "Category:", filterCategory);
    container.innerHTML = '<p style="padding:20px;">Loading products...</p>';
    
    try {
        const q = query(collection(db, "products"));
        
        // Use onSnapshot for real-time updates and better reliability
        onSnapshot(q, (snapshot) => {
            console.log("Home: Received products snapshot, size:", snapshot.size);
            container.innerHTML = '';
            
            if (snapshot.empty) {
                container.innerHTML = '<p style="padding:20px;">No products found. Please add some in Admin panel.</p>';
                return;
            }

            let found = false;
            snapshot.forEach(doc => {
                const data = doc.data();
                // Ensure category matching is case-insensitive or consistent
                const itemCategory = (data.category || "").toLowerCase();
                const targetCategory = filterCategory.toLowerCase();

                if(targetCategory === 'all' || itemCategory === targetCategory) {
                    found = true;
                    const imageUrl = data.imageUrl || data.image || 'https://picsum.photos/400/400?text=No+Image';
                    const stock = data.stockQuantity !== undefined ? data.stockQuantity : 'N/A';
                    
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    card.style.justifyContent = 'space-between';
                    
                    card.innerHTML = `
                        <div onclick="window.location.href='product-detail.html?id=${doc.id}'" style="cursor: pointer;">
                            <div style="position: relative; width: 100%; padding-top: 100%; overflow: hidden; background: #fff; border-radius: 12px; margin-bottom: 8px; border: 1px solid #f0f0f0;">
                                <img src="${imageUrl}" 
                                     alt="${data.name}" 
                                     style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; padding: 5px;"
                                     onerror="this.src='https://picsum.photos/400/400?text=Image+Error'"
                                     referrerPolicy="no-referrer">
                            </div>
                        </div>
                        <div class="card-info" style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 5px 5px;">
                            <div style="flex: 1; min-width: 0; cursor: pointer;" onclick="window.location.href='product-detail.html?id=${doc.id}'">
                                <h3 style="margin: 0; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #333;">${data.name}</h3>
                                <div style="display: flex; flex-direction: column; margin-top: 2px;">
                                    <p style="margin: 0; font-weight: bold; color: #ff5a5f; font-size: 0.9rem;">Ks ${data.price}</p>
                                    <span style="font-size: 0.7rem; color: #888;">Stock: ${stock}</span>
                                </div>
                            </div>
                            <button class="add-btn" onclick="event.stopPropagation(); addToCart('${doc.id}', '${data.name}', ${data.price})">+</button>
                        </div>
                    `;
                    container.appendChild(card);
                }
            });

            if (!found && filterCategory !== 'all') {
                container.innerHTML = `<p style="padding:20px;">No products found in ${filterCategory} category.</p>`;
            }
        }, (error) => {
            console.error("Firestore Snapshot Error:", error);
            container.innerHTML = `<p style="color:red; padding:20px;">Error: ${error.message}</p>`;
        });

    } catch (error) {
        console.error("Error setting up products listener:", error);
        container.innerHTML = `<p style="color:red; padding:20px;">Error: ${error.message}</p>`;
    }
}

// --- Cart Logic ---
let cart = [];
export const addToCart = (id, name, price) => {
    cart.push({id, name, price});
    updateCartUI();
};
window.addToCart = addToCart;

function updateCartUI() {
    if(cartCount) cartCount.innerText = cart.length;
}

// --- Checkout Logic ---
export const submitOrder = async (e) => {
    e.preventDefault();
    console.log("Submit Order Triggered");
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) {
        console.error("Submit button not found");
        return;
    }
    const originalText = btn.innerText;
    
    const user = auth.currentUser;
    if (!user) {
        alert("ကျေးဇူးပြု၍ Login အရင်ဝင်ပေးပါခင်ဗျာ။ (Please Login First)");
        const loginModal = document.getElementById('login-modal-overlay');
        if (loginModal) loginModal.style.display = 'block';
        return;
    }

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const slipFile = document.getElementById('payment-slip').files[0];

    if(cart.length === 0) return alert("Cart ထဲမှာ ပစ္စည်းမရှိသေးပါဘူး။");
    if(!slipFile) return alert("ကျေးဇူးပြု၍ ငွေလွှဲစလစ်ပုံ တင်ပေးပါဦး။");

    btn.disabled = true;
    btn.innerText = "Processing... (ခဏစောင့်ပေးပါ)";

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    try {
        console.log("Starting order process for user:", user.uid);
        
        // 1. Create Order Document
        const orderRef = await addDoc(collection(db, "orders"), {
            user: doc(db, "users", user.uid),
            orderDate: serverTimestamp(),
            totalAmount: totalAmount,
            status: "pending",
            customer: { name, phone, address },
            timestamp: new Date().toLocaleString()
        });

        console.log("Order document created:", orderRef.id);

        // 2. Create OrderItems and Update Stock
        const batch = writeBatch(db);
        
        for (const item of cart) {
            const orderItemRef = doc(collection(db, "orderItems"));
            batch.set(orderItemRef, {
                order: orderRef,
                product: doc(db, "products", item.id),
                quantity: 1,
                priceAtTimeOfOrder: item.price
            });

            // Update Stock
            const productRef = doc(db, "products", item.id);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                const currentStock = productSnap.data().stockQuantity || 0;
                if (currentStock > 0) {
                    batch.update(productRef, { stockQuantity: currentStock - 1 });
                }
            }
        }

        await batch.commit();
        console.log("Batch commit successful");
        
        // 3. Send Data to Node.js Backend for notification
        const formData = new FormData();
        formData.append('order_data', JSON.stringify({
            id: orderRef.id,
            customer: { name, phone, address },
            total: totalAmount
        }));
        formData.append('slip', slipFile);

        try {
            const response = await fetch('/api/order', { 
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            console.log("Backend response:", result);
            
            alert("Order Placed Successfully! (အော်ဒါတင်ပြီးပါပြီ)");
            cart = [];
            updateCartUI();
            const modal = document.getElementById('checkout-modal-overlay');
            if (modal) modal.style.display = 'none';
            form.reset();
        } catch (fetchErr) {
            console.error("Backend notification error:", fetchErr);
            alert("Order saved, but notification failed. (အော်ဒါတင်ပြီးပါပြီ)");
            cart = [];
            updateCartUI();
            const modal = document.getElementById('checkout-modal-overlay');
            if (modal) modal.style.display = 'none';
            form.reset();
        }

    } catch (err) {
        console.error("Order process error:", err);
        alert("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
};
window.submitOrder = submitOrder;
console.log("App.js Initialization Complete");
