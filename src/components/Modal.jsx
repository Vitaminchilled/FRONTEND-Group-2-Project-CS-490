import './modal.css';

export function ModalView ({setModalOpen, salon}) {
    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{salon.name}</h2>
                </div>
                <div className='ModalBody'>
                    <h3>Salon Info</h3>
                    <p>Email: {salon.email}</p>
                    <p>Phone Number: {salon.phone_number}</p>
                    <p>Address: {salon.address}, {salon.city}, {salon.state}, {salon.postal_code}, {salon.country}</p>
                    <p>Registered: {salon.created_at}</p>
                    <br />
                    <h3>Owner Info</h3>
                    <p>Name: {salon.owner_first_name} {salon.owner_last_name}</p>
                    <p>Email: {salon.owner_email}</p>
                    <p>Phone Number: {salon.owner_phone_number}</p>
                    <p>Year of Birth: {salon.owner_birth_year}</p>
                </div>
                <div className='ModalFooter'>
                    <button onClick={() => setModalOpen(false)}>Close</button>
                </div>
            </div>
        </div>
    );
};

async function handleVerification(salonId, isVerified, setModalOpen, verifyChange) {
    try {
        const response = await fetch("/api/admin/verifySalon", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            salon_id: salonId,
            is_verified: isVerified,
        }),
        });

        if (!response.ok) {
        throw new Error("Failed update verification");
        }

        const result = await response.json();
        console.log("Verification success:", result);
        setModalOpen(false);
        verifyChange(salonId);
    } catch (error) {
        console.error("Error Verifying Salon:", error);
    }
}

export function ModalVerify ({setModalOpen, salon, verifyChange}) {
    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{salon.name}</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to verify?</label>
                </div>
                <div className='ModalFooter'>
                    <button onClick={() => setModalOpen(false)}>Cancel</button>
                    <button onClick={() => handleVerification(salon.salon_id, true, setModalOpen, verifyChange)}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export function ModalReject ({setModalOpen, salon, verifyChange}) {
    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{salon.name}</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to reject?</label>
                </div>
                <div className='ModalFooter'>
                    <button onClick={() => setModalOpen(false)}>Cancel</button>
                    <button onClick={() => handleVerification(salon.salon_id, false, setModalOpen, verifyChange)}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

async function handleUserDeletion(userId, setModalOpen, verifyDelete) {
    try {
        const response = await fetch("/api/admin/deleteUser", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
        }),
        });

        if (!response.ok) {
        throw new Error("Failed deleting user");
        }

        const result = await response.json();
        console.log("Deletion success:", result);
        setModalOpen(false);
        verifyDelete(userId);
    } catch (error) {
        console.error("Error Deleting User:", error);
    }
}

export function ModalDelete ({setModalOpen, user, verifyDelete}) {
    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{user.first_name} {user.last_name}</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to delete this user?</label>
                </div>
                <div className='ModalFooter'>
                    <button onClick={() => setModalOpen(false)}>Cancel</button>
                    <button onClick={() => handleUserDeletion(user.user_id, setModalOpen, verifyDelete)}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export function ModalServiceDelete ({setModalOpen, service, onConfirm}) {
    if (!service) return null /* might remove this later */

    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{service.name}</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to delete this service?</label>
                </div>
                <div className='ModalFooter'>
                    <button 
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(service.service_id)
                            setModalOpen(false)
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export function ModalEmployeeDelete ({setModalOpen, employee, onConfirm}) {
    if (!employee) return null /* might remove this later */

    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{employee.first_name} {employee.last_name}</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to delete this employee?</label>
                </div>
                <div className='ModalFooter'>
                    <button 
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(employee.employee_id)
                            setModalOpen(false)
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export function ModalProductDelete ({setModalOpen, product, onConfirm}) {
    if (!product) return null /* might remove this later */

    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{product.name}</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to delete this product?</label>
                </div>
                <div className='ModalFooter'>
                    <button 
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(product.product_id)
                            setModalOpen(false)
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

/* use for alerts like "New service created", "user deleted", etc */
export function ModalMessage ({setModalOpen, title, content}) {
    return (
        <div className='ModalBackground' onClick={() => setModalOpen(false)}>
            <div className='ModalContainer' onClick={(event) => event.stopPropagation()}>
                <div className='ModalTitle'>
                    <h2>{title}</h2>
                </div>
                <div className='ModalBody'>
                    <label>{content}</label>
                </div>
                <div className='ModalFooter'>
                    <button 
                        onClick={() => setModalOpen(false)}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}