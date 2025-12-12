import React, { useState, useEffect } from 'react'
import { Trash2 } from "lucide-react";
import { ModalReplyDelete } from '../components/Modal.jsx';
import './FullReviewItem.css'

export default function FullReviewItem({
    user, salon,
    review, stars, isOpen, setOpenReviews,
    onDeleteReview,
    setModalMessage
}) {
    const [replies, setReplies] = useState({}) //for all replies (not necessary i think)
    const [totalReplyCount, setTotalReplyCount] = useState(0)
    const [replyTree, setReplyTree] = useState([]) //stores list of root replies
    const [openReplyNodes, setOpenReplyNodes] = useState({})
    
    const [newReplyFor, setNewReplyFor] = useState(null)
    const [modalReplyDelete, setModalReplyDelete] = useState(null)

    function formatBackendDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const today = new Date()
    const formattedDate = today.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    useEffect(() => {
        if (modalReplyDelete) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalReplyDelete]);

    const retrieveReplies = async () => {
        try {
            const replies_response = await fetch(`/api/salon/${salon.salon_id}/reviews/${review.review_id}/replies`)

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

    const toggleWriteReply = (targetKey) => {
        setNewReplyFor(prev =>
            prev === targetKey ? null : targetKey
        )
    }

    const handleAddReply = (newReply) => {
        setReplyTree(prevTree => {
            if (!newReply.parent_reply_id) {
                return [...prevTree, { ...newReply, children: [] }]
            } else {
                const addToTree = (nodes) => {
                    return nodes.map(node => {
                        if (node.reply_id === newReply.parent_reply_id) {
                            return {
                                ...node,
                                children: [...node.children, { ...newReply, children: [] }]
                            }
                        } else if (node.children.length > 0) {
                            return { ...node, children: addToTree(node.children) }
                        }
                        return node
                    })
                }
                return addToTree(prevTree)
            }
        })
        setNewReplyFor(null)
    }

    /* Delete reply and remove from display */
    const handleDeleteReply = async (reply) => {
        const replyID = reply.reply_id
        try {
            const deleteResponse = await fetch(`/api/reviews/reply/${replyID}`, {
                method: "DELETE",
                credentials: "include"
            })

            if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json()
                throw new Error(`Delete Reply fetch failed: HTTP error ${deleteResponse.status}: ${errorData.error || errorData}`)
            }

            const data = await deleteResponse.json()

            setModalMessage({
                title: "Success",
                content: data.message
            })

            setReplyTree(prevTree => {
                const removeReplyFromTree = (nodes) => {
                    return nodes
                        .filter(r => r.reply_id !== replyID)
                        .map(r => ({ ...r, children: removeReplyFromTree(r.children || []) }));
                }
                return removeReplyFromTree(prevTree);
            })
            setModalReplyDelete(null)
        } catch (err) {
            console.error(err)
            setModalMessage({
                title: "Error",
                content: err.message || 'This reply could not be deleted.'
            })
        }
    }

    return (
        <div className="full-review" key={review.review_id}>
            <div className='review-item'>
                <div className='grid-layout'>
                    <div className="header-section">
                        <h3 className='review-name'>{review.user}</h3>
                        {user.type !== 'none' && user.user_id === review.user_id && (
                            <button className="edit-trash"
                                onClick={() => {
                                    onDeleteReview(review)
                                }}
                                title='Delete Review'
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                    <h2 className='review-rating available'>{stars}</h2>
                    <p className='review-date'>Reviewed on {formatBackendDate(review.review_date)}</p>
                    <p className='review-comment'>{review.comment}</p>
                </div>
            </div>
            <div className="reply-action">
                {review.has_replies && (
                    <button className="toggle-replies"
                        onClick={toggleParentReplies}
                    >
                        {isOpen ? "Hide Replies" : "Show Replies"}
                    </button>
                )}
                {user.type !== 'none' && (
                    <button className={`toggle-replies ${newReplyFor === `review-${review.review_id}` ? 'cancel' : ''}`}
                        onClick={() => toggleWriteReply(`review-${review.review_id}`)}
                    >
                        {newReplyFor === `review-${review.review_id}` ? "Cancel" : "Write Reply"}
                    </button>
                )}
            </div>

            {newReplyFor === `review-${review.review_id}` && (
                <NewReplyEditor
                    user={user}
                    review={review}
                    parentReplyID={null}
                    onAddReply={handleAddReply}
                    setModalMessage={setModalMessage}
                />
            )}

            {isOpen && (
                <ReplyList
                    user={user}
                    replies={replyTree}
                    openReplyNodes={openReplyNodes}
                    toggleChildReplies={toggleChildReplies}
                    toggleWriteReply={toggleWriteReply}
                    newReplyFor={newReplyFor}
                    handleAddReply={handleAddReply}
                    review={review}
                    setModalMessage={setModalMessage}
                    setModalReplyDelete={setModalReplyDelete}
                />
            )}

            {isOpen && replyTree.length > 0 && (
                <>
                    <p className="end-replies">End of Replies to {review.user}</p>
                    <div className="review-divider"></div>
                </>
            )}

            {modalReplyDelete && (
                <ModalReplyDelete 
                    reply={modalReplyDelete}
                    setModalOpen={setModalReplyDelete}
                    onConfirm={handleDeleteReply}
                />
            )}
        </div>
    )
}

function ReplyList({
    user, replies, 
    openReplyNodes, 
    toggleChildReplies, 
    toggleWriteReply, newReplyFor, handleAddReply, review,
    setModalReplyDelete, setModalMessage
}) {

    function formatBackendDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const handleDeleteReplyClick = (reply) => {
        setModalReplyDelete(reply)
    }

    return replies.map(reply => {
        const key = `reply-${reply.reply_id}`
        return (
            <div className="reply-wrapper" key={reply.reply_id}>
                <div className="reply-item">
                    <div className='grid-layout'>
                        <div className="header-section">
                            <h3 className='review-name'>{reply.user}</h3>
                            {user.type !== 'none' && user.user_id === reply.user_id && (
                                <button className="edit-trash"
                                    onClick={() => handleDeleteReplyClick(reply)}
                                    title='Delete Reply'
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                        <h3 className='reply-to'>Replying to {review.user}</h3>
                        <p className='review-date'>Reviewed on {formatBackendDate(reply.created_at)}</p>
                        <p className='review-comment'>{reply.message}</p>
                    </div>
                </div>

                <div className="reply-action">
                    {reply.children.length > 0 && (
                        <button
                            className="toggle-replies"
                            onClick={() => toggleChildReplies(reply.reply_id)}
                        >
                            {openReplyNodes[reply.reply_id] ? "Hide Replies" : "Show Replies"}
                        </button>
                    )}
                    {user.type !== 'none' && (
                        <button className="toggle-replies"
                            onClick={() => toggleWriteReply(key)}
                        >
                            {newReplyFor === key ? "Cancel" : "Write Reply"}
                        </button>
                    )}
                </div>

                {newReplyFor === key && (
                    <NewReplyEditor 
                        user={user}
                        review={review}
                        parentReplyID={reply.reply_id}
                        parentReplyUser={reply.user}
                        onAddReply={handleAddReply}
                        setModalMessage={setModalMessage}
                    />
                )}

                {/* Recursive Rendering */}
                {openReplyNodes[reply.reply_id] && reply.children.length > 0 && (
                    <div className="nested-replies">
                        <ReplyList
                            user={user}
                            replies={reply.children}
                            openReplyNodes={openReplyNodes}
                            toggleChildReplies={toggleChildReplies}
                            toggleWriteReply={toggleWriteReply}
                            newReplyFor={newReplyFor}
                            handleAddReply={handleAddReply}
                            review={review}
                            setModalMessage={setModalMessage}
                            setModalReplyDelete={setModalReplyDelete}
                        />
                    </div>
                )}

                {openReplyNodes[reply.reply_id] && reply.children.length > 0 && (
                    <>
                        <p className="end-replies">End of Replies to {reply.user}</p>
                        <div className="review-divider"></div>
                    </>
                )}
            </div>
        )
    })
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

function NewReplyEditor({ user, review, parentReplyID, parentReplyUser, onAddReply, setModalMessage }) {

    const [text, setText] = useState("")

    const writeReply = async () => {

        const cleanedData = {
            reply: text.trim()
        }
        if (parentReplyID !== null) {
            cleanedData.parent_reply_id = parseInt(parentReplyID, 10)
        }

        try {
            if (cleanedData.reply === "") {
                throw new Error("Cannot submit a reply with no text.")
            }

            const response = await fetch(`/api/reviews/${review.review_id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedData),
                credentials: "include"
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`Create Reply fetch failed: HTTP error ${response.status}: ${errorData.error || errorData}`)
            }
            const data = await response.json()
            setModalMessage({
                title: "Success",
                content: data.message
            })
            onAddReply(data.reply)
            setText("")
        } catch (err) {
            console.error(err)
            setModalMessage({
                title: "Error",
                content: err.message || 'This reply could not be submitted.'
            })
        }
    }

    const today = new Date()
    const formattedDate = today.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="reply-item">
            <div className='edit-grid-layout'>
                <h3 className='review-name'>{user.name}</h3>
                <h3 className='reply-to'>Replying to {parentReplyUser ? parentReplyUser : review.user}</h3>
                <p className='review-date'>Reviewed on {formattedDate}</p>
                <textarea
                    className='new-comment'
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your reply..."
                />
                <div className="review-btn-section">
                    <button className='review-save'
                        onClick={writeReply}
                        disabled={text === ""}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}