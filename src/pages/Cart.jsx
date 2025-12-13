import './Cart.css';
import { useEffect, useState, useMemo, useCallback } from "react";
import { useUser } from "../context/UserContext";

function Cart() {
    const [currentStep, setCurrentStep] = useState(1);
    const { user } = useUser();
    const [items, setItems] = useState([]);
    const [appointmentItems, setAppointmentItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [appliedRewards, setAppliedRewards] = useState({});
    const [eligibleRewards, setEligibleRewards] = useState({}); 
    const [isRewardsLoading, setIsRewardsLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedWallets, setSavedWallets] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    const [promoInputs, setPromoInputs] = useState({});
    const [appliedPromos, setAppliedPromos] = useState({});
    const [promoValidation, setPromoValidation] = useState({});

    useEffect(() => {
        const loadAppointments = () => {
            const storedAppointments = JSON.parse(sessionStorage.getItem('appointmentCart') || '[]');
            console.log('Loaded appointments from sessionStorage:', storedAppointments);
            setAppointmentItems(storedAppointments);
        };
        
        loadAppointments();
        
        window.addEventListener('storage', loadAppointments);
        return () => window.removeEventListener('storage', loadAppointments);
    }, []);

    const allCartItems = useMemo(() => {
        const productItems = items.map(item => ({
            ...item,
            type: 'product',
            item_name: item.product_name,
            item_price: item.unit_price,
            total: item.line_total
        }));
        
        const apptItems = appointmentItems.map(item => ({
            ...item,
            type: 'appointment',
            item_name: item.service_name,
            item_price: item.service_price,
            quantity: 1,
            total: item.service_price
        }));
        
        return [...productItems, ...apptItems];
    }, [items, appointmentItems]);

    const handleApplyReward = (salonId, rewardData) => {
        setAppliedRewards(prev => {
            const isAlreadySelected = prev[salonId]?.loyalty_program_id === rewardData.loyalty_program_id;
            return {
                ...prev,
                [salonId]: isAlreadySelected ? null : rewardData
            };
        });
        console.log(`${rewardData ? 'Applied' : 'Removed'} reward for Salon ID ${salonId}`);
    };

    const fetchEligibleRewards = useCallback(async (salonIds) => {
        if (!user?.user_id || salonIds.length === 0) {
            setEligibleRewards({});
            return;
        }
        
        setIsRewardsLoading(true);
        try {
            const response = await fetch("/api/cart/allAvailableRewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    user_id: user.user_id, 
                    salon_ids: salonIds 
                }),
            });

            if (!response.ok) throw new Error(`Reward fetch failed: ${response.status}`);
            
            const rewardsList = await response.json();
            const rewardsMap = rewardsList.reduce((acc, salonData) => {
                acc[salonData.salon_id] = salonData;
                return acc;
            }, {});
            
            setEligibleRewards(rewardsMap);

        } catch (error) {
            console.error("Error fetching eligible rewards:", error);
            setEligibleRewards({});
        } finally {
            setIsRewardsLoading(false);
        }
    }, [user?.user_id]);

    const handlePromoInput = (salonId, value) => {
        setPromoInputs(prev => ({
            ...prev,
            [salonId]: value
        }));
    };

const validatePromoCode = async (salonId) => {
    const promoCode = promoInputs[salonId]?.trim();
    
    if (!promoCode) {
        setPromoValidation(prev => ({
            ...prev,
            [salonId]: null
        }));
        return;
    }
    
    try {
        const response = await fetch("/api/cart/validatePromo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                promo_code: promoCode,
                salon_id: salonId
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to validate promo code');
        }
        
        const result = await response.json();
        
        setPromoValidation(prev => ({
            ...prev,
            [salonId]: result
        }));
        
        if (result.valid) {
            setAppliedPromos(prev => ({
                ...prev,
                [salonId]: {
                    promo_id: result.promo_id,
                    name: result.name,
                    discount_value: result.discount_value,
                    is_percentage: result.is_percentage
                }
            }));
        } else {
            setAppliedPromos(prev => {
                const newPromos = { ...prev };
                delete newPromos[salonId];
                return newPromos;
            });
        }
    } catch (error) {
        console.error('Error validating promo code:', error);
        setPromoValidation(prev => ({
            ...prev,
            [salonId]: { valid: false, message: 'Error validating code' }
        }));
    }
};

const calculateSalonTotalWithDiscount = (salonTotal, salonId) => {
    let total = salonTotal;
    const reward = appliedRewards[salonId];
    if (reward) {
        let discount = 0;
        if (reward.is_percentage) {
            discount = total * (reward.discount_value / 100);
        } else {
            discount = Math.min(reward.discount_value, total);
        }
        total -= discount;
    }
    
    const promo = appliedPromos[salonId];
    if (promo) {
        let discount = 0;
        if (promo.is_percentage) {
            discount = total * (promo.discount_value / 100);
        } else {
            discount = Math.min(promo.discount_value, total);
        }
        total -= discount;
    }
    
    return total;
};

    const grandTotal = useMemo(() => {
        const productTotal = items.reduce((total, item) => 
            total + parseFloat(item.line_total), 0);
        const appointmentTotal = appointmentItems.reduce((total, item) => 
            total + parseFloat(item.service_price), 0);
        return productTotal + appointmentTotal;
    }, [items, appointmentItems]);

    const itemsGroupedBySalon = useMemo(() => {
        const salonMap = {};
        
        items.forEach(item => {
            const salonId = item.salon_id;
            const salonName = item.salon_name;
            
            if (!salonMap[salonId]) {
                salonMap[salonId] = {
                    id: salonId,
                    name: salonName,
                    total: 0,
                    items: []
                };
            }
            salonMap[salonId].items.push({
                ...item,
                type: 'product',
                item_name: item.product_name
            });
            salonMap[salonId].total += parseFloat(item.line_total);
        });
        
        appointmentItems.forEach(item => {
            const salonId = item.salon_id;
            const salonName = item.salon_name;
            
            if (!salonMap[salonId]) {
                salonMap[salonId] = {
                    id: salonId,
                    name: salonName,
                    total: 0,
                    items: []
                };
            }
            salonMap[salonId].items.push({
                ...item,
                type: 'appointment',
                item_name: item.service_name,
                line_total: item.service_price
            });
            salonMap[salonId].total += parseFloat(item.service_price);
        });
        
        console.log('Items grouped by salon:', salonMap);
        return salonMap;
    }, [items, appointmentItems]);

        useEffect(() => {
        if (currentStep === 2 && Object.keys(itemsGroupedBySalon).length > 0) {
            const salonIds = Object.keys(itemsGroupedBySalon).map(id => parseInt(id));
            console.log('Fetching rewards for salons:', salonIds);
            fetchEligibleRewards(salonIds);
        }
    }, [currentStep, itemsGroupedBySalon, fetchEligibleRewards]);

    const totalWithDiscounts = useMemo(() => {
        let total = 0;
        Object.values(itemsGroupedBySalon).forEach(salon => {
            total += calculateSalonTotalWithDiscount(salon.total, salon.id);
        });
        return total;
    }, [items, appointmentItems, appliedRewards, itemsGroupedBySalon]);

    const [openRewards, setOpenRewards] = useState({});

    const toggleRewards = (salonId) => {
        setOpenRewards(prev => ({
            ...prev,
            [salonId]: !prev[salonId]
        }));
    };

    const [paymentFormData, setPaymentFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        card_number: '', 
        exp_month: '',
        exp_year: '',
        cvv: '', 
        rememberCard: false,
        rememberAddress: false,
    });

    const handlePaymentChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPaymentFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const loadSavedAddress = (address) => {
        if (selectedAddress === address.address_id) {
            setSelectedAddress(null);
            setPaymentFormData(prev => ({
                ...prev,
                address: '',
                city: '',
                state: '',
                postal_code: ''
            }));
        } else {
            setSelectedAddress(address.address_id);
            setPaymentFormData(prev => ({
                ...prev,
                address: address.address,
                city: address.city,
                state: address.state,
                postal_code: address.postal_code
            }));
        }
    };

    const loadSavedWallet = (wallet) => {
        if (selectedWallet === wallet.wallet_id) {
            setSelectedWallet(null);
            setPaymentFormData(prev => ({
                ...prev,
                card_number: '',
                exp_month: '',
                exp_year: '',
                cvv: ''
            }));
        } else {
            setSelectedWallet(wallet.wallet_id);
            setPaymentFormData(prev => ({
                ...prev,
                card_number: `**** **** **** ${wallet.last_four}`,
                exp_month: String(wallet.exp_month).padStart(2, '0'),
                exp_year: String(wallet.exp_year),
                cvv: ''
            }));
            
            if (wallet.address) {
                setPaymentFormData(prev => ({
                    ...prev,
                    address: wallet.address,
                    city: wallet.city,
                    state: wallet.state,
                    postal_code: wallet.postal_code
                }));
            }
        }
    };

    const fetchSavedPaymentInfo = useCallback(async () => {
        if (!user?.user_id) return;
        
        try {
            const response = await fetch("/api/cart/getSavedPaymentInfo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.user_id }),
            });

            if (response.ok) {
                const result = await response.json();
                setSavedAddresses(result.addresses || []);
                setSavedWallets(result.wallets || []);
            }
        } catch (error) {
            console.error("Error fetching saved payment info:", error);
        }
    }, [user?.user_id]);

    const fetchCartItems = useCallback(async () => {
        if (!user || !user.user_id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch("/api/cart/cartItems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.user_id }),
            });

            if (!response.ok) throw new Error(`Response status: ${response.status}`);
            const result = await response.json();
            setItems(result.items || []); 
            console.log(result.items);

        } catch (error) {
            console.error("Fetch Error:", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [user?.user_id]);

    useEffect(() => {
        fetchCartItems();
        fetchSavedPaymentInfo();
    }, [fetchCartItems, fetchSavedPaymentInfo]);

    const handleQuantityChange = async (cartItemId, newQuantityString) => {
        const newQuantity = parseInt(newQuantityString, 10);
        
        try {
            const response = await fetch("/api/cart/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart_item_id: cartItemId,
                    quantity: newQuantity,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to update quantity:", errorData);
                alert("Failed to update cart. Reverting changes.");
                await fetchCartItems(); 
                return; 
            }
            console.log(`Cart item ID ${cartItemId} updated successfully (New Qty: ${newQuantity})`);
            await fetchCartItems();
        } catch (error) {
            console.error("Error during cart update:", error);
            alert("A network error occurred. Please try again.");
            await fetchCartItems();
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        setItems(prevItems => prevItems.filter(item => item.cart_item_id !== cartItemId));
        try {
            const response = await fetch("/api/cart/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart_item_id: cartItemId
                }),
            });

            if (!response.ok) {
                console.error("Failed to remove item from cart.");
                throw new Error(`Deletion failed with status: ${response.status}`);
            }
            console.log(`Successfully removed cart item ID: ${cartItemId}`);
            await fetchCartItems();
        } catch (error) {
            console.error("Error during item removal:", error);
            alert("Failed to remove item. Please try again.");
            await fetchCartItems();
        }
    };

    const handleRemoveAppointment = (cartItemId) => {
        console.log('Removing appointment:', cartItemId);
        
        const updatedCart = appointmentItems.filter(item => item.cart_item_id !== cartItemId);
        setAppointmentItems(updatedCart);
        sessionStorage.setItem('appointmentCart', JSON.stringify(updatedCart));
        
        console.log('Appointment removed successfully');
    };

    const validatePaymentForm = () => {
        if (!paymentFormData.firstName.trim()) {
            alert("Please enter your first name.");
            return false;
        }
        if (!paymentFormData.lastName.trim()) {
            alert("Please enter your last name.");
            return false;
        }
        if (!paymentFormData.address.trim()) {
            alert("Please enter your street address.");
            return false;
        }
        if (!paymentFormData.city.trim()) {
            alert("Please enter your city.");
            return false;
        }
        if (!paymentFormData.state.trim()) {
            alert("Please enter your state.");
            return false;
        }
        if (!paymentFormData.postal_code.trim()) {
            alert("Please enter your postal code.");
            return false;
        }
        const postalCodeRegex = /^\d{5}(-\d{4})?$/;
        if (!postalCodeRegex.test(paymentFormData.postal_code)) {
            alert("Please enter a valid postal code (e.g., 12345 or 12345-6789).");
            return false;
        }
        if (!paymentFormData.card_number.trim()) {
            alert("Please enter your card number.");
            return false;
        }
        const cardNumberClean = paymentFormData.card_number.replace(/\s/g, '');
        
        if (!cardNumberClean.startsWith('****')) {
            if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
                alert("Please enter a valid card number (13-19 digits).");
                return false;
            }
            if (!/^\d+$/.test(cardNumberClean)) {
                alert("Card number should contain only digits.");
                return false;
            }
        }
        
        if (!paymentFormData.exp_month) {
            alert("Please select the card expiration month.");
            return false;
        }
        const expMonth = parseInt(paymentFormData.exp_month);
        if (expMonth < 1 || expMonth > 12) {
            alert("Please select a valid expiration month (01-12).");
            return false;
        }
        
        if (!paymentFormData.exp_year) {
            alert("Please select the card expiration year.");
            return false;
        }
        const expYear = parseInt(paymentFormData.exp_year);
        const currentYear = new Date().getFullYear();
        if (expYear < currentYear) {
            alert("Card expiration year cannot be in the past.");
            return false;
        }
        
        if (expYear === currentYear) {
            const currentMonth = new Date().getMonth() + 1;
            if (expMonth < currentMonth) {
                alert("Your card has expired. Please use a different payment method.");
                return false;
            }
        }
        
        if (!paymentFormData.cvv.trim()) {
            alert("Please enter the card CVV/security code.");
            return false;
        }
        if (!/^\d{3,4}$/.test(paymentFormData.cvv)) {
            alert("Please enter a valid CVV (3 or 4 digits).");
            return false;
        }
        
        return true;
    };

    const handleContinue = () => {
        if (allCartItems.length === 0) {
            alert("Your cart is empty. Please add items before continuing.");
            return;
        }
        
        if (currentStep === 2) {
            if (!validatePaymentForm()) {
                return;
            }
        }
        
        setCurrentStep(prevStep => prevStep + 1);
    };

    const handlePlaceOrder = async () => {
        if (!paymentFormData.firstName || !paymentFormData.lastName) {
            alert("Please enter your name.");
            return;
        }
        if (!paymentFormData.address || !paymentFormData.city || !paymentFormData.state || !paymentFormData.postal_code) {
            alert("Please enter your billing address.");
            return;
        }
        if (!paymentFormData.card_number || !paymentFormData.exp_month || !paymentFormData.exp_year || !paymentFormData.cvv) {
            alert("Please enter your payment information.");
            return;
        }

        try {
            console.log('=== PROCESSING ORDER ===');
            console.log('Products:', items.length);
            console.log('Appointments:', appointmentItems.length);
            
            // First, process payment for products if any exist
            if (items.length > 0) {
                const response = await fetch("/api/cart/processPayment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.user_id,
                    payment_data: {
                        ...paymentFormData,
                        remember_address: paymentFormData.rememberAddress,
                        remember_card: paymentFormData.rememberCard
                    },
                    applied_rewards: appliedRewards,
                    applied_promos: appliedPromos  // Add this line
                }),
            });

                if (!response.ok) {
                    const errorData = await response.json();
                    alert(`Payment failed: ${errorData.error}`);
                    return;
                }

                const result = await response.json();
                console.log("Product payment successful. Invoice IDs:", result.invoice_ids);
            }
            
            // Then, create appointments
            if (appointmentItems.length > 0) {
                console.log('Booking appointments...');
                
                const appointmentPromises = appointmentItems.map(async (appt) => {
                    const appointmentData = {
                        salon_id: appt.salon_id,
                        customer_id: user.user_id,
                        employee_id: appt.employee_id,
                        service_id: appt.service_id,
                        appointment_date: appt.appointment_date,
                        start_time: appt.start_time,
                        notes: appt.notes || ''
                    };
                    
                    console.log('Booking appointment:', appointmentData);
                    
                    const response = await fetch(`/api/appointments/book`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(appointmentData)
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Appointment booking failed: ${errorData.error || 'Unknown error'}`);
                    }
                    
                    return await response.json();
                });
                
                const appointmentResults = await Promise.all(appointmentPromises);
                console.log('All appointments booked successfully:', appointmentResults);
                sessionStorage.removeItem('appointmentCart');
                setAppointmentItems([]);
            }
            
            const receiptData = {
                orderDate: new Date().toLocaleDateString(),
                items: Object.values(itemsGroupedBySalon),
                appliedRewards: appliedRewards,
                subtotal: totalWithDiscounts,
                tax: totalWithDiscounts * 0.07,
                total: totalWithDiscounts * 1.07,
                billingAddress: {
                    name: `${paymentFormData.firstName} ${paymentFormData.lastName}`,
                    address: paymentFormData.address,
                    city: paymentFormData.city,
                    state: paymentFormData.state,
                    postal_code: paymentFormData.postal_code
                },
                cardLast4: paymentFormData.card_number.slice(-4)
            };
            
            setOrderDetails(receiptData);
            setOrderComplete(true);
            
            setItems([]);
            setCurrentStep(4);
            
            console.log('✅ ORDER COMPLETED SUCCESSFULLY');
            
        } catch (error) {
            console.error("Error placing order:", error);
            alert(`An error occurred while placing your order: ${error.message}`);
        }
    };

    if (isLoading) {
        return <div className="cart-page"><h1>Shopping Cart</h1><hr /><p>Loading cart items...</p></div>;
    }

    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>
            <hr />
            {/* CART PAGE (Step 1) */}
            {currentStep === 1 && (
                <div className='step-cart'>
                {allCartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <div className="cart-container">
                        
                        {/* Cart */}
                        <div className="cart-items-list">
                            <h2>Your Items ({allCartItems.length})</h2>
                            {allCartItems.map((item) => (
                                item.type === 'product' ? (
                                    <div key={item.cart_item_id} className="cart-item-card">
                                        <div className="item-header">
                                            <h3>{item.product_name}</h3>
                                            <button 
                                                className="remove-button"
                                                onClick={() => handleRemoveItem(item.cart_item_id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <p className="item-description">{item.description}</p>
                                        <div className="item-details-row">
                                            <span className="retail-price">
                                                Retail Price: ${parseFloat(item.unit_price).toFixed(2)}
                                            </span>
                                            <div className="quantity-control">
                                                <span>Qty:</span>
                                                <select
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.cart_item_id, e.target.value)}
                                                    className="qty-dropdown"
                                                >
                                                    {Array.from({ length: item.stock_quantity }, (_, i) => i + 1).map(qty => (
                                                        <option key={qty} value={qty}>{qty}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="item-total">
                                            Total: ${parseFloat(item.line_total).toFixed(2)}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={item.cart_item_id} className="cart-item-card appointment-card">
                                        <div className="item-header">
                                            <h3>Appointment {item.service_name}</h3>
                                            <button 
                                                className="remove-button"
                                                onClick={() => handleRemoveAppointment(item.cart_item_id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="appointment-details">
                                            <p><strong>Salon:</strong> {item.salon_name}</p>
                                            <p><strong>Stylist:</strong> {item.employee_name}</p>
                                            <p><strong>Date:</strong> {item.appointment_date}</p>
                                            <p><strong>Time:</strong> {item.start_time.slice(0,5)} - {item.end_time.slice(0,5)}</p>
                                            {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                                        </div>
                                        <div className="item-total">
                                            Price: ${parseFloat(item.service_price).toFixed(2)}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="order-summary">
                            <h2>Order Summary:</h2>
                            <div className="summary-total">
                                Total Estimated Price: 
                                <span className="total-value">${grandTotal.toFixed(2)}</span>
                            </div>
                            <button className="continue-button"
                            onClick={() => handleContinue()}>
                                Continue
                            </button>
                        </div>
                    </div>
                )}
                </div>
            )}
            {/* PAYMENT PAGE (Step 2) */}
            {currentStep === 2 && (
                <div className='step-payment'>
                    <div className="cart-container"> 
                        
                        {/* Payment */}
                        <div className="cart-items-list payment-form">
                            <h2>Payment Info</h2>
                            {savedWallets.length > 0 && (
                                <div className="saved-items-section">
                                    <h3>Saved Payment Methods</h3>
                                    <div className="saved-items-list">
                                        {savedWallets.map(wallet => (
                                            <button
                                                key={wallet.wallet_id}
                                                className={`saved-item-btn ${selectedWallet === wallet.wallet_id ? 'selected' : ''}`}
                                                onClick={() => loadSavedWallet(wallet)}
                                            >
                                                {wallet.card_type.toUpperCase()} •••• {wallet.last_four}
                                                {wallet.is_default && <span className="default-badge">Default</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {savedAddresses.length > 0 && (
                                <div className="saved-items-section">
                                    <h3>Saved Addresses</h3>
                                    <div className="saved-items-list">
                                        {savedAddresses.map(address => (
                                            <button
                                                key={address.address_id}
                                                className={`saved-item-btn ${selectedAddress === address.address_id ? 'selected' : ''}`}
                                                onClick={() => loadSavedAddress(address)}
                                            >
                                                {address.address}, {address.city}, {address.state} {address.postal_code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="form-row">
                                <input type="text" name="firstName" placeholder="First Name" value={paymentFormData.firstName} onChange={handlePaymentChange} required />
                                <input type="text" name="lastName" placeholder="Last Name" value={paymentFormData.lastName} onChange={handlePaymentChange} required />
                            </div>
                            
                            <input type="text" name="address" placeholder="00 Street St" value={paymentFormData.address} onChange={handlePaymentChange} required />
                            
                            <div className="form-row">
                                <input type="text" name="city" placeholder="City" value={paymentFormData.city} onChange={handlePaymentChange} required />
                                <input type="text" name="state" placeholder="State" value={paymentFormData.state} onChange={handlePaymentChange} required />
                                <input type="text" name="postal_code" placeholder="Postal Code" value={paymentFormData.postal_code} onChange={handlePaymentChange} required />
                            </div>
                            
                            <div className="checkbox-row">
                                <input type="checkbox" id="remember-address" name="rememberAddress" checked={paymentFormData.rememberAddress} onChange={handlePaymentChange} />
                                <label htmlFor="remember-address">Remember this address</label>
                            </div>

                            <hr className="payment-separator"/>

                            <label>Card Number:</label>
                            <input 
                                type="text" 
                                name="card_number" 
                                placeholder="0000 0000 0000 0000" 
                                value={paymentFormData.card_number} 
                                onChange={handlePaymentChange} 
                                required 
                                maxLength="19" 
                                className="card-number-input"
                                disabled={selectedWallet && !paymentFormData.card_number.includes('*')}
                            />

                            <div className="form-row card-row">
                                <div className="card-field-group">
                                    <label>Month:</label>
                                    <select name="exp_month" value={paymentFormData.exp_month} onChange={handlePaymentChange} required>
                                        <option value="">MM</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="card-field-group">
                                    <label>Year:</label>
                                    <select name="exp_year" value={paymentFormData.exp_year} onChange={handlePaymentChange} required>
                                        <option value="">YYYY</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="card-field-group cvv-field">
                                    <label>CVV:</label>
                                    <input type="text" name="cvv" placeholder="3-4 Digits" value={paymentFormData.cvv} onChange={handlePaymentChange} required maxLength="4"/>
                                </div>
                            </div>

                            <div className="checkbox-row">
                                <input type="checkbox" id="remember-card" name="rememberCard" checked={paymentFormData.rememberCard} onChange={handlePaymentChange} />
                                <label htmlFor="remember-card">Remember this card</label>
                            </div>
                        </div>
                        
                        {/* Summary and Discounts */}
                        <div className="order-summary discount-summary">
                            <h2>Apply Discounts</h2>
                            {Object.values(itemsGroupedBySalon).map(salon => {
                                const salonRewards = eligibleRewards[salon.id];
                                const hasRewards = salonRewards && salonRewards.rewards && salonRewards.rewards.length > 0;
                                
                                return (
                                    <div key={salon.id} className="salon-discount-block">
                                        <div className="salon-header-row">
                                            <h4>{salon.name}</h4> 
                                            <span className="salon-total">${salon.total.toFixed(2)}</span> 
                                        </div>
                                        
                                        <div className="promo-input-wrapper">
                                            <input 
                                                type="text" 
                                                placeholder="Promo code" 
                                                className={`promo-input ${
                                                    promoValidation[salon.id]?.valid ? 'promo-valid' : 
                                                    promoValidation[salon.id]?.valid === false ? 'promo-invalid' : ''
                                                }`}
                                                value={promoInputs[salon.id] || ''}
                                                onChange={(e) => handlePromoInput(salon.id, e.target.value)}
                                                onBlur={() => validatePromoCode(salon.id)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        validatePromoCode(salon.id);
                                                    }
                                                }}
                                            />
                                            {promoValidation[salon.id]?.valid === false && (
                                                <span className="promo-error-message">
                                                    {promoValidation[salon.id]?.message || 'Invalid code'}
                                                </span>
                                            )}
                                            {promoValidation[salon.id]?.valid && (
                                                <span className="promo-success-message">
                                                    ✓ {appliedPromos[salon.id]?.name} applied
                                                </span>
                                            )}
                                        </div>
                                        
                                        {hasRewards && (
                                            <>
                                                <p 
                                                    className="rewards-toggle" 
                                                    onClick={() => toggleRewards(salon.id)}
                                                >
                                                    View Loyalty Rewards ({salonRewards.available_points} pts) <span>
                                                        {openRewards[salon.id] ? '▲' : '▼'}
                                                    </span>
                                                </p>
                                                
                                                {openRewards[salon.id] && (
                                                    <div className="loyalty-rewards-list">
                                                        {isRewardsLoading ? (
                                                            <p>Loading rewards...</p>
                                                        ) : (
                                                            salonRewards.rewards.map(reward => {
                                                                const discountLabel = reward.is_percentage 
                                                                    ? `${reward.discount_value}% Off`
                                                                    : `$${reward.discount_value} Off`;
                                                                
                                                                const isSelected = appliedRewards[salon.id]?.loyalty_program_id === reward.loyalty_program_id;
                                                                
                                                                return (
                                                                    <button 
                                                                        key={reward.loyalty_program_id} 
                                                                        className={`reward-button ${isSelected ? 'active-reward' : ''}`}
                                                                        onClick={() => handleApplyReward(salon.id, reward)}
                                                                        title={`${reward.reward_name} - ${reward.points_required} points required`}
                                                                    >
                                                                        {discountLabel} ({reward.points_required} pts)
                                                                    </button>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        {!hasRewards && !isRewardsLoading && (
                                            <p className="no-rewards-message">No rewards available for this salon</p>
                                        )}
                                        
                                        {(appliedRewards[salon.id] || appliedPromos[salon.id]) && (
                                            <div className="applied-discounts">
                                                {appliedRewards[salon.id] && (
                                                    <div className="applied-discount">
                                                        <span>Loyalty Reward:</span>
                                                        <span>-${(() => {
                                                            const reward = appliedRewards[salon.id];
                                                            if (reward.is_percentage) {
                                                                return (salon.total * (reward.discount_value / 100)).toFixed(2);
                                                            }
                                                            return Math.min(reward.discount_value, salon.total).toFixed(2);
                                                        })()}</span>
                                                    </div>
                                                )}
                                                {appliedPromos[salon.id] && (
                                                    <div className="applied-discount">
                                                        <span>Promo Code ({appliedPromos[salon.id].name}):</span>
                                                        <span>-${(() => {
                                                            let afterReward = salon.total;
                                                            const reward = appliedRewards[salon.id];
                                                            if (reward) {
                                                                if (reward.is_percentage) {
                                                                    afterReward -= salon.total * (reward.discount_value / 100);
                                                                } else {
                                                                    afterReward -= Math.min(reward.discount_value, salon.total);
                                                                }
                                                            }
                                                            const promo = appliedPromos[salon.id];
                                                            if (promo.is_percentage) {
                                                                return (afterReward * (promo.discount_value / 100)).toFixed(2);
                                                            }
                                                            return Math.min(promo.discount_value, afterReward).toFixed(2);
                                                        })()}</span>
                                                    </div>
                                                )}
                                                <div className="applied-discount total-after-discount">
                                                    <span>After Discounts:</span>
                                                    <span>${calculateSalonTotalWithDiscount(salon.total, salon.id).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <hr className="salon-separator" />
                                    </div>
                                );
                            })}
                            
                            <div className="summary-total">
                                Subtotal: 
                                <span className="total-value">${totalWithDiscounts.toFixed(2)}</span>
                            </div>
                            <div className="summary-total">
                                Tax (7%): 
                                <span className="total-value">${(totalWithDiscounts * 0.07).toFixed(2)}</span>
                            </div>
                            <div className="summary-total final-total">
                                Total: 
                                <span className="total-value">${(totalWithDiscounts * 1.07).toFixed(2)}</span>
                            </div>
                            
                            <button 
                                className="continue-button"
                                onClick={handleContinue}
                            >
                                Review Order
                            </button>
                        </div>
                    </div>
                    <div className="back-button-container">
                        <button className="back-button" onClick={() => setCurrentStep(1)}>Go Back to Cart</button>
                    </div>
                </div>
            )}
            {/* REVIEW PAGE (Step 3) */}
            {currentStep === 3 && (
                <div className="step-review">
                    <div className="cart-container">
                        <div className="review-section">
                            <h2>Order Confirmation</h2>
                            
                            <div className="review-items">
                                <h3>Items to Purchase:</h3>
                                {Object.values(itemsGroupedBySalon).map(salon => (
                                    <div key={salon.id} className="review-salon-group">
                                        <h4>{salon.name}</h4>
                                        {salon.items.map(item => (
                                            <div key={item.cart_item_id} className="review-item">
                                                <span>
                                                    {item.type === 'appointment' ? 'Appointment' : ''}
                                                    {item.item_name} 
                                                    {item.type === 'product' && ` (x${item.quantity})`}
                                                    {item.type === 'appointment' && ` - ${item.appointment_date} at ${item.start_time.slice(0,5)}`}
                                                </span>
                                                <span>${parseFloat(item.line_total).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        {appliedRewards[salon.id] && (
                                            <div className="review-discount">
                                                <span>Loyalty Discount:</span>
                                                <span className="discount-amount">
                                                    -${(salon.total - calculateSalonTotalWithDiscount(salon.total, salon.id)).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="review-salon-total">
                                            <span>Salon Subtotal:</span>
                                            <span>${calculateSalonTotalWithDiscount(salon.total, salon.id).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="review-payment-info">
                                <h3>Payment Information:</h3>
                                <p>Card: •••• •••• •••• {paymentFormData.card_number.slice(-4)}</p>
                                <p>Billing Address: {paymentFormData.address}, {paymentFormData.city}, {paymentFormData.state} {paymentFormData.postal_code}</p>
                            </div>
                        </div>
                        
                        <div className="order-summary">
                            <h2>Final Summary:</h2>
                            <div className="summary-line">
                                <span>Subtotal:</span>
                                <span>${totalWithDiscounts.toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span>Tax (7%):</span>
                                <span>${(totalWithDiscounts * 0.07).toFixed(2)}</span>
                            </div>
                            <div className="summary-total final-total">
                                <span>Total:</span>
                                <span className="total-value">${(totalWithDiscounts * 1.07).toFixed(2)}</span>
                            </div>
                            <button 
                                className="continue-button place-order-btn"
                                onClick={handlePlaceOrder}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                    <div className="back-button-container">
                        <button className="back-button" onClick={() => setCurrentStep(2)}>Go Back to Payment</button>
                    </div>
                </div>
            )}
            {/* RECEIPT PAGE (Step 4) */}
            {currentStep === 4 && orderComplete && orderDetails && (
                <div className="step-receipt">
                    <div className="receipt-wrapper">
                        <div className="receipt-header">
                            <h1>Order Confirmed!</h1>
                            <p className="receipt-success-message">Thank you for your purchase</p>
                            <p className="receipt-date">Order Date: {orderDetails.orderDate}</p>
                        </div>

                        <div className="receipt-summary-box">
                            <h2>Order Summary</h2>
                            
                            {orderDetails.items.map(salon => (
                                <div key={salon.id} className="receipt-salon-section">
                                    <h3 className="receipt-salon-name">{salon.name}</h3>
                                    {salon.items.map(item => (
                                        <div key={item.cart_item_id} className="receipt-line">
                                            <span>
                                                {item.type === 'appointment' ? 'Appointment' : ''}
                                                {item.item_name} 
                                                {item.type === 'product' && ` (x${item.quantity})`}
                                                {item.type === 'appointment' && ` - ${item.appointment_date}`}
                                            </span>
                                            <span>${parseFloat(item.line_total).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {orderDetails.appliedRewards[salon.id] && (
                                        <div className="receipt-line receipt-discount-line">
                                            <span>Loyalty Discount</span>
                                            <span>-${(salon.total - calculateSalonTotalWithDiscount(salon.total, salon.id)).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            <div className="receipt-totals-section">
                                <div className="receipt-line">
                                    <span>Subtotal:</span>
                                    <span>${orderDetails.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="receipt-line">
                                    <span>Tax (7%):</span>
                                    <span>${orderDetails.tax.toFixed(2)}</span>
                                </div>
                                <div className="receipt-line receipt-final-total">
                                    <span>Total Paid:</span>
                                    <span>${orderDetails.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="receipt-payment-section">
                                <div className="receipt-payment-row">
                                    <strong>Payment Method:</strong> Card ending in {orderDetails.cardLast4}
                                </div>
                                <div className="receipt-payment-row">
                                    <strong>Billing Address:</strong> {orderDetails.billingAddress.name}, {orderDetails.billingAddress.address}, {orderDetails.billingAddress.city}, {orderDetails.billingAddress.state} {orderDetails.billingAddress.postal_code}
                                </div>
                            </div>

                            <button 
                                className="continue-button receipt-continue-btn"
                                onClick={() => {
                                    setCurrentStep(1);
                                    setOrderComplete(false);
                                    setOrderDetails(null);
                                    setAppliedRewards({});
                                    setPaymentFormData({
                                        firstName: '',
                                        lastName: '',
                                        address: '',
                                        city: '',
                                        state: '',
                                        postal_code: '',
                                        card_number: '', 
                                        exp_month: '',
                                        exp_year: '',
                                        cvv: '', 
                                        rememberCard: false,
                                        rememberAddress: false,
                                    });
                                }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;