import './Rewards.css'
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

function Rewards() {
    const { user } = useUser();
    const [rewardsData, setRewards] = useState({});
    const [expandedSalon, setExpandedSalon] = useState(null); 

    useEffect(() => {
        const fetchUserRewards = async () => {
            if (!user || !user.user_id) return;
            try {
                const response = await fetch("/api/userRewards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.user_id }),
                });

                if (!response.ok) throw new Error(`Response status: ${response.status}`);
                const result = await response.json();
                
                setRewards(result);

            } catch (error) {
                console.error(error.message);
            }
        };
        fetchUserRewards();
    }, [user.user_id]);

    const toggleRewards = (salonId) => {
        setExpandedSalon(prevId => prevId === salonId ? null : salonId);
    };

    return (
        <div className="AccountDetails">
            <h1>Loyalty Rewards</h1>
            <hr />
            <h3 style={{ display: 'none' }}><u>Personal Information</u></h3>
            
            <div className="RewardsList">
                {Object.keys(rewardsData).length === 0 ? (
                    <p className="no-rewards">You currently have no loyalty points available at any salon.</p>
                ) : (
                    Object.entries(rewardsData).map(([salonId, salonInfo]) => {
                        const isExpanded = expandedSalon === salonId;
                        return (
                            <div key={salonId} className={`salon-card ${isExpanded ? 'expanded' : ''}`}>
                                <div className="salon-summary" onClick={() => toggleRewards(salonId)}>
                                    <div className="salon-name-points">
                                        <span className="salon-name-text">{salonInfo.salon_name}</span>
                                        <span className="current-points">{salonInfo.available_points} Points</span>
                                    </div>
                                    <button className="view-rewards-btn">
                                        View Rewards {isExpanded ? '▲' : '▼'}
                                    </button>
                                </div>
                                {isExpanded && (
                                    <div className="rewards-detail-list">
                                        {salonInfo.rewards.length > 0 ? (
                                            salonInfo.rewards.map((reward, index) => {
                                                const discountText = reward.is_percentage 
                                                    ? `${reward.discount_value}% Off` 
                                                    : `$${reward.discount_value} Off`;
                                                const tags = reward.tags || [];           
                                                return (
                                                    <div 
                                                        key={reward.loyalty_program_id} 
                                                        className="reward-item-row"
                                                    >
                                                        <span className="reward-text">
                                                            {discountText} – {reward.points_required} Points
                                                        </span>
                                                        <div className="reward-tags">
                                                            {tags.map(tag => (
                                                                <span key={tag} className="tag-pill">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="no-rewards-found">No active rewards available.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Rewards;