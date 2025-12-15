import { useState, useEffect } from 'react';
import { Pencil, Save, Trash2 } from "lucide-react";
import deleteIcon from '../assets/BlackXIcon.png';

import './GalleryModals.css';

export function ViewGalleryImage({
  user, salon,
  galleryImage,
  setModalOpen,
  onSuccess,
  setModalMessage,
  newItem = false, setNewImage, onUploadImage,
  onUpdateImage,
  setModalImageDelete
}) {
    const [imagePreview, setImagePreview] = useState(null)
    const [editExisting, setEditExisting] = useState(false)
    const [editData, setEditData] = useState({
        description: galleryImage.description || "",
        image_url: null, //file for submission
        original_url: galleryImage.image_url //url
    })

    useEffect(() => {
        return () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        }
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    function handleImageChange(event) {
        const file = event.target.files[0]
        const name = event.target.name

        if (!file) {
        if (name === 'image_url') {
            URL.revokeObjectURL(imagePreview)
            setEditData(prev => ({ ...prev, [name]: null }))
            setImagePreview(null)
        } 

        return
        }

        if (name === 'image_url' && imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }

        if (name === 'image_url') {
            setImagePreview(URL.createObjectURL(file))
            setEditData((prev) => ({ ...prev, [name]: file }))
        }
    }

    return (
        <div className="ModalBackground">
            <div className="ViewImageModalContainer">
                <div className='ViewImageModalTitle'>
                    {newItem ? (
                        <h2 className='step-title'>New Gallery Image</h2>
                    ) : (
                        <div className="title-grp">
                            <h2 className='step-title'>View Gallery Image</h2>
                            {user?.type === 'owner' && Number(user?.salon_id) === Number(salon?.salon_id) && (
                                <>
                                    <button className='edit-pencil'
                                        onClick={() => setEditExisting(true)}
                                        disabled={editExisting}
                                    >
                                        <Pencil size={20}/>
                                    </button>
                                    <button className='edit-pencil'
                                        onClick={() => {
                                            setModalImageDelete(galleryImage)
                                        }}
                                        disabled={editExisting}
                                    >
                                        <Trash2 size={20}/>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    <img
                        className='appointment-close'
                        src={deleteIcon}
                        alt='Close'
                        onClick={() => {
                            if(setNewImage) setNewImage(null)
                            setModalOpen(false)
                        }}
                    />
                </div>
                {newItem ? (
                    <div className='ViewImageModalBody'>
                        <input className="image-upload"
                            type="file" 
                            accept='image/*'
                            name='image_url'
                            onChange={handleImageChange}
                        />
                        <br/>
                        <br/>
                        {(imagePreview || editData.image_url) && (
                            <img className="new-preview" src={imagePreview || editData.original_url} />
                        )}
                        <br/>
                        <br/>
                        <textarea className='image-description-edit'
                            name='description'
                            onChange={handleChange}
                            value={editData.description}
                        />
                    </div>
                ) : editExisting ? (
                    <div className="ViewImageModalBody">
                        <input className="image-upload"
                            type="file" 
                            accept='image/*'
                            name='image_url'
                            onChange={handleImageChange}
                        />
                        <br/>
                        <br/>
                        {(imagePreview || editData.image_url || editData.original_url) && (
                            <img className="new-preview" 
                                src={imagePreview || editData.image_url || editData.original_url} 
                            />
                        )}
                        <br/>
                        <br/>
                        <textarea className='image-description-edit'
                            name='description'
                            onChange={handleChange}
                            value={editData.description}
                        />
                    </div>
                ) : (
                    <div className='ViewImageModalBody'>
                        <div className="image-wrapper">
                            <img className='full-image'
                                src={galleryImage.image_url}
                                alt="image preview"
                            />
                        </div>
                        <p className="image-description">
                            {galleryImage.description}
                        </p>
                    </div>
                )}
                {(newItem || editExisting) && (
                    <div className='ViewImageModalFooter'>
                        {editExisting && (
                            <button
                                className="modal-btns"
                                onClick={() => {

                                    setEditExisting(false)
                                }}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            className="modal-btns"
                            disabled={editData.description === "" && !editData.image_url}
                            onClick={() => {
                                if (editExisting) {
                                    onUpdateImage(galleryImage.gallery_id, editData)
                                } else {
                                    onUploadImage(editData)
                                }
                            }}
                        >
                            {editExisting ? "Save Changes" : "Upload New Image"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}