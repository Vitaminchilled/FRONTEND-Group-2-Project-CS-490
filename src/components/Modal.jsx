import { useState, useEffect } from 'react';
import './Modal.css';

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
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                salon_id: salonId,
                is_verified: isVerified,
            })
        });

        /*if (!response.ok) {
                const errorText = await response.json()
                throw new Error(`Verify/Reject failed HTTP error ${response.status}: ${errorText.error || errorText}`)
        }*/
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }    

        /*const result = await response.json();*/
        console.log("Verification success:", result);
        setModalOpen(false);
        verifyChange(salonId);
    } catch (error) {
        console.error("Error Verifying Salon:", error);
    }
}

export function ModalVerify ({setModalOpen, salon, verifyChange}) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)

    const handleConfirm = async () => {
        setLoading(true);
        setStatus(null);

        try {
            await handleVerification(
                salon.salon_id,
                true,
                () => {}, // don't close immediately
                verifyChange
            )

            setStatus("success")

            // small delay so user sees success
            setTimeout(() => {
                setModalOpen(false)
            }, 1000)
        } catch {
            setStatus("error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{salon.name}</h2>
                </div>
                <div className='ModalBody'>
                    {loading && <p>Processing verification…</p>}
                    {status === "success" && <p className="success">✔ Verified successfully</p>}
                    {status === "error" && <p className="error">✖ Verification failed</p>}
                    {!loading && !status && (
                        <label>Are you sure you want to verify?</label>
                    )}
                </div>
                <div className='ModalFooter'>
                    <button onClick={() => setModalOpen(false)} disabled={loading}>
                        Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={loading}>
                        {loading ? "Verifying..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export function ModalReject ({setModalOpen, salon, verifyChange}) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)

    const handleConfirm = async () => {
        setLoading(true);
        setStatus(null);

        try {
            await handleVerification(
                salon.salon_id,
                false,
                () => {}, // don't close immediately
                verifyChange
            )

            setStatus("success")

            // small delay so user sees success
            setTimeout(() => {
                setModalOpen(false)
            }, 1200)
        } catch {
            setStatus("error")
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>{salon.name}</h2>
                </div>
                <div className='ModalBody'>
                    {loading && <p>Processing verification…</p>}
                    {status === "success" && <p className="success">✔ Rejected successfully</p>}
                    {status === "error" && <p className="error">✖ Rejection failed</p>}
                    {!loading && !status && (
                        <label>Are you sure you want to reject?</label>
                    )}
                </div>
                <div className='ModalFooter'>
                    <button onClick={() => setModalOpen(false)} disabled={loading}>
                        Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={loading}>
                        {loading ? "Rejecting..." : "Confirm"}
                    </button>
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

export function ModalReviewDelete ({setModalOpen, review, onConfirm}) {
    if (!review) return null /* might remove this later */

    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>Delete Review</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to delete this review?</label>
                </div>
                <div className='ModalFooter'>
                    <button 
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(review.review_id)
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

export function ModalReplyDelete ({setModalOpen, reply, onConfirm}) {
    if (!reply) return null /* might remove this later */

    return (
        <div className='ModalBackground'>
            <div className='ModalContainer'>
                <div className='ModalTitle'>
                    <h2>Delete Reply</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to delete this reply?</label>
                </div>
                <div className='ModalFooter'>
                    <button 
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(reply)
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

export function ModalImageDelete ({setModalOpen, image, onConfirm}) {
    if (!image) return null /* might remove this later */

    return (
        <div className='TopModalBackground'>
            <div className='TopModalContainer'>
                <div className='ModalTitle'>
                    <h2>Delete Image</h2>
                </div>
                <div className='ModalBody'>
                    <label>Are you sure you want to delete this image?</label>
                </div>
                <div className='ModalFooter'>
                    <button 
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(image) //get image_url reuse for diff tables
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
        <div className='TopModalBackground' onClick={() => setModalOpen(false)}>
            <div className='TopModalContainer' onClick={(event) => event.stopPropagation()}>
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
