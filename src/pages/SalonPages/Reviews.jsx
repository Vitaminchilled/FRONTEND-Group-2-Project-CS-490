import { useState, useEffect} from "react"
import { useParams } from 'react-router-dom'
import SalonHeader from '../../components/SalonHeader.jsx'
import FullReviewItem from "../../components/FullReviewItem.jsx"
import './Reviews.css'

import { useUser } from "../../context/UserContext.jsx"

import { ModalMessage } from '../../components/Modal.jsx';
import { WriteReview } from "../../components/WriteReview.jsx"

export default function Reviews() {
    const { salon_id } = useParams()
    const {user} = useUser();
    const [salon, setSalon] = useState({})
    const [tags, setTags] = useState([])
    const [masterTags, setMasterTags] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [reviews, setReviews] = useState([])
    const [reviewCount, setReviewCount] = useState(0)

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [iterpages, setIterPages] = useState([])

    const [openReviews, setOpenReviews] = useState({}) 
    //map of bools to show replies of reviews

    /* used in form */
    const [filter, setFilter] = useState({ 
        keywords: "", /* to be removed */
        direction: "desc",
        order_by: "review_date",
        rating: -1,
        has_img: false //all replies, true-> only replies with images
    })
    /* applied at the time */
    const [currentFilter, setCurrentFilter] = useState({ 
        keywords: "", /* to be removed */
        direction: "desc",
        order_by: "review_date",
        rating: -1,
        has_img: false //all replies, true-> only replies with images
    })
    const [hover, setHover] = useState(0)

    const [imagePreview, setImagePreview] = useState(null)
    const [chosenReferenceImg, setChosenReferenceImg] = useState(null)
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    function handleImageChange(event) {
        const file = event.target.files[0]

        if (!file) {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
            setChosenReferenceImg(null)
            setImagePreview(null)
            return
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }

        setChosenReferenceImg(file)
        setImagePreview(URL.createObjectURL(file)) // show preview immediately
    }

    const [newReview, setNewReview] = useState(null)
    const handleCancelNewReview = () => {
        setNewReview(null)
    }
    const [modalMessage, setModalMessage] = useState(null)

    const [completedAppointments, setCompletedAppointments] = useState([])

    useEffect(() => {
        if (newReview) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "";
        }
        return () => {
        document.body.style.overflow = "";
        };
    }, [newReview]);


    function getStarString(rating) {
        let stars = ''
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) stars += '★'
            else if (rating >= i - 0.5) stars += '⯪'
            else stars += '☆'
        }
        return stars
    }

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
                salon: retrievedSalon=[], 
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

    const retrieveReviews = async (pageNumber = 1, filters = currentFilter) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (filters.keywords) {
                params.append('keywords', filters.keywords)
            }
            if (filters.direction) {
                params.append('direction', filters.direction)
            }
            if (filters.order_by) {
                params.append('order_by', filters.order_by)
            }
            if (filters.rating) {
                params.append('rating', filters.rating)
            }
            if (filters.has_img) {
                params.append('has_img', filters.has_img)
            }
            params.append('page', pageNumber)

            const reviews_response = await fetch(`/api/salon/${salon_id}/reviews/pagination?${params.toString()}`)

            if (!reviews_response.ok) {
                const errorText = await reviews_response.json()
                throw new Error(`Employees fetch failed: HTTP error ${reviews_response.status}: ${errorText.error || errorText}`)
            }

            const reviews_data = await reviews_response.json()

            const { 
                reviews: retrievedReviews=[],
                review_count: retrievedReviewCount=0,
                total_pages: retrievedTotalPages = 1, 
                page: retrievedPage = 1,
                iter_pages: retrievedIterPages = [1]
            } = reviews_data || {}

            setReviews(retrievedReviews)
            setReviewCount(retrievedReviewCount)
            setPage(retrievedPage)
            setTotalPages(retrievedTotalPages)
            setIterPages(retrievedIterPages)

            console.log(reviews)
        } catch (err) {
            console.error('Fetch error: ', err)
            setError(err.message || "Unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log(reviews)
    }, [reviews])

    const retrieveCompletedAppointments = async () => {
        setLoading(true)
        setError(null)

        try {
            const appointments_response = await fetch(`/api/appointments/reviewless/${salon_id}?customer_id=${33}`)
            
            if(!appointments_response.ok) {
                const errorText = await appointments_response.json()
                throw new Error(`Salon fetch failed: HTTP error ${appointments_response.status}: ${errorText.error || errorText}`)
            }
            
            const appointments_data = await appointments_response.json()

            const { 
                appointments: retrievedAppointments=[], 
            } = appointments_data || {}

            console.log(retrievedAppointments)
            
            setCompletedAppointments(retrievedAppointments)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    /* runs once on mount */
    useEffect(() => {
        retrieveSalon()
        retrieveCompletedAppointments()
    }, [])

    /* runs once on mount then every time dependencies update*/
    useEffect(() => {
        retrieveReviews(page, currentFilter)
    }, [page, currentFilter])

    const handleFilter = () => {
        setOpenReviews({})
        setCurrentFilter(filter)
        setPage(1)
    }
    
    const handleWriteReview = () => {
        if (completedAppointments.length > 0) {
            setNewReview({
                review_id: "new",
                appointment_id: -1,
                user_id: 33, //change later
                user: 'Jane Doe', //change later
                salon_id: salon_id,
                rating: -1,
                comment: "",
                image_url: ""
            })
        } else {
            setModalMessage({
                title: "Error",
                content: 'No available appointments to review'
            })
        }
    }

    return (
        <>
            {(!loading && error ? (
                <p className='not-found'>{error}</p>
            ) : (
            <div className="reviews-page">
                <SalonHeader
                    salonID={salon_id}
                    headerTitle={salon.salon_name}
                    headerTags={tags}
                    headerRatingValue={salon.average_rating}
                />

                <div className="page-header">
                    <h2 className="page-title">
                        Reviews
                    </h2>
                    <p className="review-count">{'(' + reviewCount + ' Reviews)'}</p>
                </div>

                <div className="reviews-content">
                    <div className="review-action">
                        <form className="review-form" 
                            onSubmit={(event) => {
                                event.preventDefault()
                                handleFilter()
                            }}
                        >
                            <div className="filter-section">
                                <h1 className="action-title">
                                        Filter Results
                                </h1>
                                <label>
                                    <p className="input-title">Rating: </p>
                                    <div className="star-select">
                                        {[...Array(5)].map((star, index) => {
                                            const currentRate = index + 1
                                            const displayStar = (hover || filter.rating) >= currentRate ? '★' : '☆';
                                            return (
                                                <span className="single-star" key={currentRate}
                                                    onMouseEnter={() => setHover(currentRate)}
                                                    onMouseLeave={() => setHover(0)}
                                                    onClick={event => setFilter({...filter, rating: currentRate})}
                                                >
                                                    {displayStar}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </label>
                                <label>
                                    <p className="input-title">Keywords: </p>
                                    <input className="input line" 
                                        
                                        type="text" 
                                        placeholder="keyword ex. Nails were..."
                                        value={filter.keywords}
                                        onChange={event => setFilter({...filter, keywords: event.target.value})}
                                    />
                                </label>
                                
                                <label>
                                    <p className="input-title">Order by: </p>
                                    <select className="input select" 
                                        onChange={event => {
                                            if (event.target.value === "") return
                                            const [direction, order_by] = event.target.value.split('|')
                                            setFilter({...filter, order_by: order_by, direction})
                                        }}
                                    >
                                        <option value="">Choose</option>
                                        <option value="desc|rating">Highest Rating</option>
                                        <option value="asc|rating">Lowest Rating</option>
                                        <option value="desc|review_date">Most Recent</option>
                                        <option value="asc|review_date">Least Recent</option>
                                    </select>
                                </label>
                                <label className="check-section">
                                    <p className="check-label">Includes image: </p>
                                    <input className="check" 
                                        id="has_img" 
                                        type="checkbox" 
                                        checked={filter.has_img}
                                        onChange={event => setFilter({...filter, has_img: event.target.checked})}
                                    />
                                </label>
                                
                            </div>
                            <div className="button-section">
                                <button className="search-btn" 
                                    type="submit"
                                    disabled={
                                        !filter.keywords && 
                                        !filter.has_img && 
                                        filter.rating === -1 &&
                                        filter.order_by==='review_date' && 
                                        filter.direction==='desc'
                                    }
                                >
                                    Search
                                </button>
                                <button className="search-btn" 
                                    /*type="reset"*/
                                    onClick={() => {
                                        const emptyFilter = {
                                            keywords: "",
                                            direction: "desc",
                                            order_by: "review_date",
                                            rating: -1,
                                            has_img: false
                                        }
                                        setFilter(emptyFilter)
                                        setCurrentFilter(emptyFilter)
                                        setPage(1)
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                        <div className="review-divider"></div>
                        <div className="write-review">
                            <h1 className="action-title">
                                Review Business
                            </h1>
                            <p className="write-context">
                                Have an appointment you want to review for this salon? Leave one here!
                            </p>
                            <button className="write-btn"
                                onClick={handleWriteReview}
                            >
                                Write Review
                            </button>
                        </div>
                    </div>
                    <div className="review-results">
                        <div className='review-group'>
                            {reviews.length > 0 ? (
                                reviews.map((review) => {
                                    const stars = review.rating ? getStarString(review.rating) : "No rating available"

                                    return (
                                        <FullReviewItem
                                            key={review.review_id}
                                            review={review}
                                            user={user}
                                            salon={salon}
                                            stars={stars}
                                            isOpen={openReviews[review.review_id] || false}
                                            setOpenReviews={setOpenReviews}
                                            salonID={salon_id}
                                        />
                                    )
                                })
                            ) : (
                                <p className="empty-reviews">No reviews found.</p>
                            )}
                        </div>
                        <div className="pagination-section">
                            <button className='prev-next'
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                {'<<'} Prev
                            </button>
                            {iterpages && iterpages.map((p,index) => {
                                if (p === "...")
                                    return <span key={index} className='gap'>...</span>
                                else
                                return <button key={index} className='num-btn'
                                    disabled={p === page}
                                    onClick={() => setPage(p)}>
                                    {p}
                                </button>
                            })}
                            <button className='prev-next'
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next {'>>'}
                            </button>
                        </div>
                    </div>
                </div>
                {modalMessage && (
                    <ModalMessage
                    content={modalMessage.content}
                    title={modalMessage.title}
                    setModalOpen={setModalMessage}
                    />
                )}
                {newReview && (
                    <WriteReview
                        salon={salon}
                        user={{
                            user_id: 33,
                            role: 'customer'
                        }}
                        newItem={true}
                        appointments={completedAppointments}
                        review={newReview}
                        setModalOpen={setNewReview}
                        setModalMessage={setModalMessage}
                        onCancelNew={handleCancelNewReview}
                    />
                )}
            </div>
            ))}
        </>
    )
}