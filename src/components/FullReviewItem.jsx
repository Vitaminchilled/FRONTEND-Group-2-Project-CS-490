import React, { useState, useEffect } from 'react'
import './FullReviewItem.css'

/*
    in parent file create useState showReplies as {} so toggleReplies can work
*/

export default function FullReviewItem({
    user, salon,
    review, stars, isOpen, setOpenReviews, salonID,
    newItem = false, onCancelNew,
    onSaveEdit, onDelete
}) {
    const [editData, setEditData] = useState({...review})
    const [isEditing, setIsEditing] = useState(false)

    const [replies, setReplies] = useState({}) //for all replies (not necessary i think)
    const [totalReplyCount, setTotalReplyCount] = useState(0)
    const [replyTree, setReplyTree] = useState([]) //stores list of root replies
    const [openReplyNodes, setOpenReplyNodes] = useState({})

    useEffect(() => {
        setEditData(review)
    }, [review])

    useEffect(() => {
        if (newItem) {
            setIsEditing(true)
        }
    }, [newItem])

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    const handleStartEdit = () => setIsEditing(true)
    const handleCancelEdit = () => {
        if (newItem) {
            onCancelNew?.()
        } else {
            setIsEditing(false)
            setEditData(review) // reset changes
        }
    }

    const handleSaveClick = async () => {
        try {
            await onSaveEdit(editData, review)
            setIsEditing(false) // switch back to standard mode
        } catch (err) {
            console.error(err)
        }
    }

    const retrieveReplies = async () => {
        try {
            const replies_response = await fetch(`/api/salon/${salonID}/reviews/${review.review_id}/replies`)

            if (!replies_response.ok) {
                const errorText = await replies_response.json()
                throw new Error(`Salon fetch failed: HTTP error ${replies_response.status}: ${errorText.error || errorText}`)
            }

            const replies_data = await replies_response.json()

            const {
                replies: retrievedReplies=[],
                reply_count: retrievedReplyCounts=0
            } = replies_data || {}

            const tree = buildReplyTree(retrievedReplies)

            setReplies(retrievedReplies)
            setReplyTree(tree)
            setTotalReplyCount(retrievedReplyCounts)
        } catch (err) {
            console.error('Fetch error: ', err)
        }
    }

    const toggleParentReplies = () => {
        setOpenReviews(prev => {
            const nowOpen = !prev[review.review_id]
            
            if (nowOpen && replyTree.length === 0) {
                retrieveReplies()   // fetch only when opened
            }

            return { ...prev, [review.review_id]: nowOpen }
        })
    }

    const toggleChildReplies = (replyId) => {
        setOpenReplyNodes(prev => ({
            ...prev,
            [replyId]: !prev[replyId]
        }))
    }

    return (
        <div className="full-review" key={review.review_id}>
            <div className='review-item'>
                <div className='grid-layout'>
                    <h3 className='review-name'>{review.user}</h3>
                    <h2 className='review-rating available'>{stars}</h2>
                    <p className='review-date'>Reviewed on {review.review_date}</p>
                    <p className='review-comment'>{review.comment}</p>
                </div>
            </div>

            {review.has_replies && (
                <button className="toggle-replies"
                    onClick={toggleParentReplies}
                >
                    {isOpen ? "Hide Replies" : "Show Replies"}
                </button>
            )}

            {isOpen && (
                <ReplyList
                    replies={replyTree}
                    openReplyNodes={openReplyNodes}
                    toggleChildReplies={toggleChildReplies}
                />
            )}

            {isOpen && replyTree.length > 0 && (
                <>
                    <p className="end-replies">End of Replies</p>
                    <div className="review-divider"></div>
                </>
            )}
        </div>
    )
}

function ReplyList({replies, openReplyNodes, toggleChildReplies}) {
    return replies.map(reply => (
        <div className="reply-wrapper" key={reply.reply_id}>
            <div className="reply-item">
                <div className='grid-layout'>
                    <h3 className='review-name'>{reply.user}</h3>
                    <p className='review-date'>Reviewed on {reply.created_at}</p>
                    <p className='review-comment'>{reply.message}</p>
                </div>
            </div>

            {reply.children.length > 0 && (
                <button
                    className="toggle-replies"
                    onClick={() => toggleChildReplies(reply.reply_id)}
                >
                    {openReplyNodes[reply.reply_id] ? "Hide Replies" : "Show Replies"}
                </button>
            )}

            {/* Recursive Rendering */}
            {openReplyNodes[reply.reply_id] && reply.children.length > 0 && (
                <div className="nested-replies">
                    <ReplyList
                        replies={reply.children}
                        openReplyNodes={openReplyNodes}
                        toggleChildReplies={toggleChildReplies}
                    />
                </div>
            )}

            {openReplyNodes[reply.reply_id] && reply.children.length > 0 && (
                <>
                    <p className="end-replies nested-end">End of Replies</p>
                    <div className="review-divider nested-divider"></div>
                </>
            )}
        </div>
    ))
}

function buildReplyTree(replies) {
    const replies_map = {}
    const roots = []

    replies.forEach(r => {
        replies_map[r.reply_id] = {...r, children: []}
    })

    replies.forEach(r => {
        if (!r.parent_reply_id) {
            roots.push(replies_map[r.reply_id])
        } else {
            replies_map[r.parent_reply_id].children.push(replies_map[r.reply_id])
        }
    })

    return roots
}