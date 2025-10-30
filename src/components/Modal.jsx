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
        const response = await fetch("/api/verifySalon", {
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

async function handleUserDeletion(userId, setModalOpen) {
    try {
        const response = await fetch("/api/deleteUser", {
        method: "POST",
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

    } catch (error) {
        console.error("Error Deleting User:", error);
    }
}

export function ModalDelete ({setModalOpen, user}) {
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
                    <button onClick={() => handleUserDeletion(user.user_id, setModalOpen)}>Confirm</button>
                </div>
            </div>
        </div>
    );
};