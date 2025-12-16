import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import './Gallery.css'

import { ModalMessage, ModalImageDelete } from '../../components/Modal.jsx';
import { ViewGalleryImage } from '../../components/GalleryModals.jsx';

function Gallery() {
    const { salon_id } = useParams()
    const {user, setUser, loading: userLoading} = useUser();
    const [salon, setSalon] = useState({})
    const [tags, setTags] = useState([])
    const [masterTags, setMasterTags] = useState([])
    const [bannerImg, setBannerImg] = useState({})
    const [galleryImages, setGalleryImages] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [imageError, setImageError] = useState(null)
    const [newGalleryImage, setNewGalleryImage] = useState(null)
    
    const [modalMessage, setModalMessage] = useState(null)
    const [modalImageDelete, setModalImageDelete] = useState(null)
    const [viewGalleryImage, setViewGalleryImage] = useState(null)

    useEffect(() => {
        if (modalMessage || viewGalleryImage || modalImageDelete) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "";
        }
        return () => {
        document.body.style.overflow = "";
        };
    }, [modalMessage, viewGalleryImage,modalImageDelete]);

    const retrieveSalon = async () => {
        setLoading(true)
        setError(null)

        try {
            const salon_response = await fetch(`/api/salon/${salon_id}/header`)
            if (salon_response.status === 404) {
                setError("Salon not found")
                return
            }

            if(!salon_response.ok) {
                const errorText = await salon_response.json()
                throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText.error || errorText}`)
            }
            
            const salon_data = await salon_response.json()

            const { 
                salon: retrievedSalon={}, 
                tags: retrievedTags=[], 
                master_tags: retrievedMasterTags=[]
            } = salon_data || {}
            setSalon(retrievedSalon)
            setTags(retrievedTags)
            setMasterTags(retrievedMasterTags)
        } catch (err) {
            console.error('Fetch error:', err)
            setError(err.message || "Unexpected Error Occurred")
        } finally {
            setLoading(false)
        }
    }

    const retrieveGalleryImages = async () => {
        setImageLoading(true);
        setImageError(null);

        try {
            const gallery_response = await fetch(`/api/salon/${salon_id}/gallery`)

            if (gallery_response.status === 404) {
                setGalleryImages([])
                setImageError(null)
                return
            }

            if(!gallery_response.ok) {
                const errorText = await gallery_response.json()
                throw new Error(`Salon fetch failed: HTTP error ${gallery_response.status}: ${errorText.error || errorText}`)
            }
            
            const gallery_data = await gallery_response.json()

            const { 
                gallery: retrievedGallery=[], 
                primary_image: retrievedBanner={}
            } = gallery_data || {}
            setGalleryImages(retrievedGallery)
            setBannerImg(retrievedBanner)
        } catch (err) {
            console.error('Fetch error:', err)
            setImageError(err.message || "Unexpected Error Occurred")
        } finally {
            setImageLoading(false)
        }
    }

    useEffect(() => {
        retrieveSalon()
        retrieveGalleryImages()
    }, [])

    const uploadSalonImage = async (imageData) => {
        setImageLoading(true)
        setImageError(null)

        if (!imageData.image_url) {
            setModalMessage({
                title: 'Error',
                content: 'Please select an image before uploading.'
            })
            return
        }

        const formData = new FormData()

        if (imageData.image_url instanceof File) {
            formData.append("image", imageData.image_url)
        }

        // Append other fields (description, etc.)
        if (imageData.description) {
            formData.append("description", imageData.description)
        }

        try {
            const upload_response = await fetch(`/api/salon/${salon_id}/gallery/upload`,{
                    method: "POST",
                    body: formData
                }
            )

            if (!upload_response.ok) {
                const errorText = await upload_response.json()
                throw new Error(`Upload Gallery Image failed HTTP error ${upload_response.status}: ${errorText.error || errorText}`)
            }

            const upload_data = await upload_response.json()

            setModalMessage({
                title: 'Success',
                content: upload_data.message
            })
            setNewGalleryImage(null)
            setViewGalleryImage(null)
            await retrieveGalleryImages()
            return upload_data //????
        } catch (err) {
            console.error("Upload error:", err)
            setNewGalleryImage(null)
            setModalMessage({
                title: 'Error',
                content: err.message || 'This image could not be added.'
            })
        } finally {
            setImageLoading(false)
        }
    }

    const updateGalleryImage = async (galleryID, editData) => {
        setImageLoading(true)

        const formData = new FormData()

        if (editData.image_url instanceof File) {
            formData.append("image", editData.image_url)
        }

        // Append other fields (description, etc.)
        formData.append("description", editData.description || "")

        try {
            const update_response = await fetch(`/api/salon/gallery/${galleryID}/update`,{
                    method: "PUT",
                    body: formData
                }
            )

            if (update_response.status === 404) {
                setGalleryImages([])
                setImageError("Gallery image not found")
                return
            }

            if (!update_response.ok) {
                const errorText = await update_response.json()
                throw new Error(`Update Gallery Image failed HTTP error ${update_response.status}: ${errorText.error || errorText}`)
            }

            const update_data = await update_response.json()
            setModalMessage({
                title: 'Success',
                content: update_data.message
            })
            setViewGalleryImage(null)
            await retrieveGalleryImages()
            return update_data //????
        } catch (err) {
            console.error("Update error:", err)
            setModalMessage({
                title: 'Error',
                content: err.message || 'This image could not be added.'
            })
        } finally {
            setImageLoading(false)
        }
    }

    const deleteGalleryImage = async (galleryImage) => {
        setImageLoading(true)
        setImageError(null)

        const galleryID = galleryImage.gallery_id

        try {
            const delete_response = await fetch(`/api/salon/gallery/${galleryID}/delete`,
                { method: "DELETE" }
            )

            if (!delete_response.ok) {
                const errorText = await delete_response.json()
                throw new Error(`Delete failed HTTP error ${delete_response.status}: ${errorText.error || errorText}`)
            }

            const delete_data = await delete_response.json()
            setModalMessage({
                title: 'Success',
                content: delete_data.message
            })
            setModalImageDelete(null)
            setViewGalleryImage(null)
            await retrieveGalleryImages()
            return delete_data //????

        } catch (err) {
            console.error("Delete error:", err)
            setModalMessage({
                title: 'Error',
                content: err.message || 'This image could not be added.'
            })
        } finally {
            setImageLoading(false)
        }
    }

    if (loading) return <p>Loading...</p>

    return (
        <>
            {(!loading && (error) ? (
                <p className='not-found'>{error}</p>
            ) : (
                <div className='gallery-page'>
                    <SalonHeader
                        salonID={salon_id}
                        headerTitle={salon.salon_name}
                        headerTags={tags}
                        headerRatingValue={salon.average_rating}
                        hasPrimaryImg={salon.has_primary_img}
                    />
                    
                    <div className='title-group'>
                        <h2 className="page-title">
                            Gallery
                        </h2>
                    </div>
                    {imageLoading && <p>Loading gallery...</p>}
                    <div className="gallery-group">
                        {galleryImages.length === 0 ? (
                            <p className='no-images'>No gallery images uploaded on this salon.</p>
                        ) : (
                            <>
                                {galleryImages.map((gallery) => (
                                    <img className='image-preview'
                                        key={gallery.gallery_id}
                                        src={gallery.image_url}
                                        alt={gallery.description || `Gallery Image ${gallery.gallery_id}`}
                                        onClick={() => setViewGalleryImage(gallery)}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                    {(user?.type === 'owner' && Number(user?.salon_id)=== Number(salon_id)) && (
                        <button className='add-salon-item'
                            onClick={() => {
                                setNewGalleryImage({
                                    gallery_id: 'new',
                                    salon_id: salon_id,
                                    image_url: null,
                                    description: "",
                                    employee_id: null,
                                    service_id: null,
                                    is_primary: 0
                                })
                                setViewGalleryImage({
                                    gallery_id: 'new',
                                    salon_id: salon_id,
                                    image_url: null,
                                    description: "",
                                    employee_id: null,
                                    service_id: null,
                                    is_primary: 0
                                })
                            }}
                            disabled={newGalleryImage !== null}
                        >
                            Add Gallery Image
                        </button>
                    )}
                    
                    {modalMessage && (
                        <ModalMessage
                            content={modalMessage.content}
                            title={modalMessage.title}
                            setModalOpen={setModalMessage}
                        />
                    )}

                    {modalImageDelete && (
                        <ModalImageDelete
                            setModalOpen={setModalImageDelete}
                            onConfirm={deleteGalleryImage}
                            image={modalImageDelete}
                        />
                    )}

                    {viewGalleryImage && (
                        <ViewGalleryImage 
                            galleryImage={viewGalleryImage}
                            user={user}
                            salon={salon}
                            setModalOpen={setViewGalleryImage}
                            onUploadImage={uploadSalonImage}
                            onSuccess={() => retrieveGalleryImages()}
                            setModalMessage={setModalMessage}
                            newItem={newGalleryImage ? true : false}
                            setNewImage={newGalleryImage ? setNewGalleryImage : null}
                            onUpdateImage={updateGalleryImage}
                            setModalImageDelete={setModalImageDelete}
                        />
                    )}
                </div>
            ))}
        </>
    )
}

export default Gallery
