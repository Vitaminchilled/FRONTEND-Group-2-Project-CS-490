import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import './SalonHeader.css'
import headerImage from '../assets/HeaderImage.jpg'
import homeIcon from '../assets/HomeIcon.png'
import emptyHeartIcon from '../assets/EmptyHeartIcon.png'
import fullHeartIcon from '../assets/FullHeartIcon.png'
import { useUser } from '../context/UserContext';
import { ModalMessage, ModalImageDelete } from './Modal.jsx'
import { Pencil } from 'lucide-react'

import { ViewGalleryImage } from './GalleryModals.jsx';


/* ({ salon_id, headerImage, headerTitle, headerTags, headerRating }) */
function SalonHeader({ 
  salonID, headerTitle, headerTags, headerRatingValue, hasPrimaryImg = false, isHome = false//,
  //user, setModalMessage
}) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadFavoriting, setLoadFavoriting] = useState(false)
  const [galleryID, setGalleryID] = useState(0)
  const [bannerImg, setBannerImg] = useState({})
  const [modifiedOn, setModifiedOn] = useState(null)

  const [modalMessage, setModalMessage] = useState(null)
  const [newGalleryImage, setNewGalleryImage] = useState(null)
  const [modalImageDelete, setModalImageDelete] = useState(null)
  const [viewGalleryImage, setViewGalleryImage] = useState(null)

  const tagNames = headerTags?.map(tag => tag.name).join(", ");
  
  function getStarString(rating) {
    let stars = ''
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars += '★'
      else if (rating >= i - 0.5) stars += '⯪'
      else stars += '☆'
    }
    return stars
  }

  useEffect(() => {
    if (hasPrimaryImg) getSalonPrimaryImage()
    if (user?.user_id && user?.type === 'customer' && salonID) {
      getFavoritedSalons();
    }
  }, [user?.user_id, salonID, hasPrimaryImg])

  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(null)

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

  const getSalonPrimaryImage = async () => {
    setImageLoading(true);
    setImageError(null);

    try {
      const banner_response = await fetch(`/api/salon/${salonID}/image`)

      if (banner_response.status === 404) {
          setBannerImg({})
          setImageLoading(false);
          setImageError(null)
          return
      }

      if(!banner_response.ok) {
          const errorText = await banner_response.json()
          throw new Error(`Banner fetch failed: HTTP error ${banner_response.status}: ${errorText.error || errorText}`)
      }
      
      const banner_data = await banner_response.json()

      setBannerImg(banner_data)
    } catch (err) {
      console.error('Fetch error:', err)
      setImageError(err.message || "Unexpected Error Occurred")
    } finally {
      setImageLoading(false)
    }
  }

  const getFavoritedSalons = async () => {
    try {
      const response = await fetch(`/api/session/favorited_salons`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch favorited salons')
      }

      const data = await response.json()
      console.log(data.favorited_salons)

      setFavorites(data.favorited_salons || [])

      const favoriteExists = data.favorited_salons.some(
        (salon) => Number(salon.salon_id) === Number(salonID)
      )
      
      setIsFavorite(favoriteExists)
    } catch (err) {
      console.error('getFavoritedSalons error:', err);
    }
  }

  const favoriteSalon = async () => {
    setLoadFavoriting(true)
    try {
        const response = await fetch('/api/session/favorite_salon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
              customer_id: user.user_id,
              salon_id: salonID 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to favorite salon');
        }

        const data = await response.json();
        setIsFavorite(true)
    } catch (err) {
        console.error('favoriteSalon error:', err.message);
        throw err;
    } finally {
      setLoadFavoriting(false)
    }
  }

  const unfavoriteSalon = async () => {
    try {
        const response = await fetch('/api/session/unfavorite_salon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ customer_id: user.user_id, salon_id: salonID })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to unfavorite salon');
        }

        const data = await response.json();
        setIsFavorite(false)
    } catch (err) {
        console.error('unfavoriteSalon error:', err);
        throw err;
    }
  }

  const uploadBannerImage = async (imageData) => {
    setImageLoading(true)
    setImageError(null)

    if (!imageData.image_url) {
      setModalMessage({
        title: 'Error',
        content: 'Please select an image before uploading.'
      })
      setImageLoading(false)
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

    formData.append("is_primary", true)

    try {
      const upload_response = await fetch(`/api/salon/${salonID}/gallery/upload`,{
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
      await getSalonPrimaryImage()
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

  const updateBannerImage = async (galleryID, editData) => {
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
      await getSalonPrimaryImage()
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

  const deleteBannerImage = async (galleryImage) => {
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
            await getSalonPrimaryImage()
            setViewGalleryImage(null)
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

  const headerRating = headerRatingValue ? getStarString(headerRatingValue) : "No rating available"
  
  return (
    <div className="salon-header">
      <div className="header-image">
        <img className="actual-img" 
          src={bannerImg?.image_url || headerImage} 
          alt="Salon Banner" 
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = headerImage
          }}
        />

        <div className="header-overlay">
          {isHome ? (
            <div className="header-btn disabled" title="You are currently on home">
              <img src={homeIcon} alt="home" className="image" />
            </div>
          ) : (
            <NavLink className="header-btn"
              to={`/salon/${salonID}`} 
              end={false}
              title="Navigate back to Salon Home"
            >
              <img
                className='image'
                src={homeIcon}
                alt="<"
              />
            </NavLink>
          )}
          {user.type === 'customer' && (
            (isFavorite) ? (
              <button className="header-btn"
                onClick={unfavoriteSalon}
                disabled={loadFavoriting}
              >
                <img
                  className='image'
                  src={fullHeartIcon}
                  alt="<3"
                  title="Currently Favorited"
                />
              </button>
            ) : (
              <button className="header-btn"
                onClick={favoriteSalon}
                disabled={loadFavoriting}
              >
                <img
                  className='image'
                  src={emptyHeartIcon}
                  alt="<3"
                  title="Not Favorited"
                />
              </button>
            )
          )}
          {user.type === 'owner' && Number(user.salon_id) === Number(salonID) && (
            
              <button className="header-btn"
                onClick={() => setViewGalleryImage(bannerImg)}
              >
                <Pencil size={20}/>
              </button>
            
          )}
        </div>
      </div>
      
      <h1 className="header-title">
        {headerTitle}
      </h1>

      {headerTags && 
        <p className="header-tags">
          {tagNames}
        </p>
      }
      

      <div className="header-rating">
        <p className={headerRatingValue ? "rating-available" : "rating-unavailable"}>{headerRating}</p> 
        {/* checks if average_rating is null to format info correctly */}
      </div>

      <div className='grey-divider'></div>

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
          onConfirm={deleteBannerImage}
          image={modalImageDelete}
        />
      )}

      {viewGalleryImage && (
        <ViewGalleryImage 
            galleryImage={viewGalleryImage}
            user={user}
            salon={{salon_id:salonID}}
            setModalOpen={setViewGalleryImage}
            onUploadImage={uploadBannerImage}
            onSuccess={() => getSalonPrimaryImage()}
            setModalMessage={setModalMessage}
            newItem={!viewGalleryImage?.image_url}
            setNewImage={newGalleryImage ? setNewGalleryImage : null}
            onUpdateImage={updateBannerImage}
            setModalImageDelete={setModalImageDelete}
        />
    )}
    </div>
  )
}

export default SalonHeader
