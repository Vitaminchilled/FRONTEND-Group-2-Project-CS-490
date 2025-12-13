import { useEffect, useState } from "react";
import "./AdminAnalytics.css";

function AdminAnalytics() {
  // Engagement Stats
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalSalons, setTotalSalons] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);

  // System Health
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemHealthLoading, setSystemHealthLoading] = useState(true);
  const [systemHealthError, setSystemHealthError] = useState(null);

  // Demographics
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [ageDemographics, setAgeDemographics] = useState([]);

  // Loyalty Program
  const [pointsRedeemed, setPointsRedeemed] = useState(null);
  const [vouchersRedeemed, setVouchersRedeemed] = useState(null);
  const [loyalCustomers, setLoyalCustomers] = useState([]);

  // Salon Performance
  const [topSalons, setTopSalons] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Modal states
  const [showSalonsModal, setShowSalonsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [allSalons, setAllSalons] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch core analytics in parallel
        const [
          usersRes,
          salonsRes,
          retentionRes,
          genderRes,
          ageRes,
          pointsRes,
          vouchersRes,
          loyalRes,
          topSalonsRes,
          topServicesRes,
          topProductsRes,
        ] = await Promise.all([
          fetch("/api/admin/total-users"),
          fetch("/api/admin/total-salons"),
          fetch("/api/admin/retention?days=30"),
          fetch("/api/admin/gender-distribution"),
          fetch("/api/admin/age-demographics"),
          fetch("/api/admin/points-redeemed"),
          fetch("/api/admin/vouchers-redeemed"),
          fetch("/api/admin/loyal-customers"),
          fetch("/api/admin/top-salons-by-appointments"),
          fetch("/api/admin/top-earning-services"),
          fetch("/api/admin/top-earning-products"),
        ]);

        // If any core request fails, fail the page (system health is handled separately below)
        if (
          !usersRes.ok ||
          !salonsRes.ok ||
          !retentionRes.ok ||
          !genderRes.ok ||
          !ageRes.ok ||
          !pointsRes.ok ||
          !vouchersRes.ok ||
          !loyalRes.ok ||
          !topSalonsRes.ok ||
          !topServicesRes.ok ||
          !topProductsRes.ok
        ) {
          throw new Error("Failed to fetch analytics data");
        }

        const usersData = await usersRes.json();
        const salonsData = await salonsRes.json();
        const retentionData = await retentionRes.json();
        const genderData = await genderRes.json();
        const ageData = await ageRes.json();
        const pointsData = await pointsRes.json();
        const vouchersData = await vouchersRes.json();
        const loyalData = await loyalRes.json();
        const topSalonsData = await topSalonsRes.json();
        const topServicesData = await topServicesRes.json();
        const topProductsData = await topProductsRes.json();

        setTotalUsers(usersData?.total_users ?? 0);
        setTotalSalons(salonsData?.total_salons ?? 0);
        setActiveUsers(retentionData?.active_users ?? 0);

        setGenderDistribution(Array.isArray(genderData) ? genderData : []);
        setAgeDemographics(Array.isArray(ageData) ? ageData : []);

        setPointsRedeemed(pointsData?.total_points_redeemed ?? 0);
        setVouchersRedeemed(vouchersData?.total_vouchers_redeemed ?? 0);
        setLoyalCustomers(Array.isArray(loyalData) ? loyalData : []);

        setTopSalons(Array.isArray(topSalonsData) ? topSalonsData : []);
        setTopServices(Array.isArray(topServicesData) ? topServicesData : []);
        setTopProducts(Array.isArray(topProductsData) ? topProductsData : []);

        setError(null);
        setLoading(false);

        // Fetch system health (do NOT break the whole dashboard if it fails)
        try {
          setSystemHealthLoading(true);
          const systemRes = await fetch("/api/admin/system-health");
          const systemData = await systemRes.json().catch(() => null);

          if (!systemRes.ok) {
            setSystemHealth(null);
            setSystemHealthError(systemData?.error || `Failed to fetch system health: ${systemRes.status}`);
          } else {
            setSystemHealth(systemData || null);
            setSystemHealthError(null);
          }
        } catch (err) {
          console.error("Error fetching system health:", err);
          setSystemHealth(null);
          setSystemHealthError(err?.message || "Failed to fetch system health");
        } finally {
          setSystemHealthLoading(false);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err?.message || "Failed to fetch analytics");
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, []);

  // Fetch all salons
  const handleSeeAllSalons = async () => {
    setModalLoading(true);
    setShowSalonsModal(true);
    try {
      const response = await fetch("/api/admin/all-salons-by-appointments");
      const data = await response.json();
      setAllSalons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching all salons:", err);
      setAllSalons([]);
    }
    setModalLoading(false);
  };

  // Fetch all services
  const handleSeeAllServices = async () => {
    setModalLoading(true);
    setShowServicesModal(true);
    try {
      const response = await fetch("/api/admin/all-earning-services");
      const data = await response.json();
      setAllServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching all services:", err);
      setAllServices([]);
    }
    setModalLoading(false);
  };

  // Fetch all products
  const handleSeeAllProducts = async () => {
    setModalLoading(true);
    setShowProductsModal(true);
    try {
      const response = await fetch("/api/admin/all-earning-products");
      const data = await response.json();
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching all products:", err);
      setAllProducts([]);
    }
    setModalLoading(false);
  };

  if (loading) {
    return (
      <div className="AdminAnalytics">
        <h1>Admin Analytics Dashboard</h1>
        <hr />
        <p className="loading">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="AdminAnalytics">
        <h1>Admin Analytics Dashboard</h1>
        <hr />
        <p className="error">Error loading analytics: {error}</p>
      </div>
    );
  }

  // Calculate max values for bar charts
  const maxGenderCount = Math.max(...genderDistribution.map((g) => g.total_count || 0), 1);
  const maxAgeCount = Math.max(...ageDemographics.map((a) => a.total_count || 0), 1);

  return (
    <div className="AdminAnalytics">
      <h1>Admin Analytics Dashboard</h1>
      <hr />

      {/* Section 1: User Engagement Stats */}
      <section className="analytics-section">
        <h2>User Engagement Stats</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{(totalUsers ?? 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Total Salons</h3>
            <p className="stat-value">{(totalSalons ?? 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users (30 days)</h3>
            <p className="stat-value">{(activeUsers ?? 0).toLocaleString()}</p>
            {totalUsers > 0 && (
              <p className="stat-subtitle">{(((activeUsers ?? 0) / totalUsers) * 100).toFixed(1)}% retention</p>
            )}
          </div>
        </div>
      </section>

      {/* System Health */}
      <section className="analytics-section">
        <h2>System Health</h2>
        {systemHealthLoading ? (
          <p className="loading">Loading system health...</p>
        ) : systemHealthError ? (
          <p className="error">Error loading system health: {systemHealthError}</p>
        ) : (
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Database</h3>
              <p className="stat-value">{systemHealth?.database_status || "unknown"}</p>
            </div>
            <div className="stat-card">
              <h3>Uptime</h3>
              <p className="stat-value">{systemHealth?.uptime_human || "N/A"}</p>
            </div>
            <div className="stat-card">
              <h3>Active Users (24h)</h3>
              <p className="stat-value">{(systemHealth?.active_users_24h ?? "N/A").toLocaleString?.() ?? systemHealth?.active_users_24h ?? "N/A"}</p>
            </div>
            <div className="stat-card">
              <h3>Errors (24h)</h3>
              <p className="stat-value">{(systemHealth?.errors_24h ?? 0).toLocaleString?.() ?? systemHealth?.errors_24h ?? 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Errors</h3>
              <p className="stat-value">{(systemHealth?.errors_total ?? 0).toLocaleString?.() ?? systemHealth?.errors_total ?? 0}</p>
            </div>
            <div className="stat-card">
              <h3>Last Updated</h3>
              <p className="stat-value">
                {systemHealth?.timestamp
                  ? isNaN(new Date(systemHealth.timestamp).getTime())
                    ? systemHealth.timestamp
                    : new Date(systemHealth.timestamp).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: User Demographics */}
      <section className="analytics-section">
        <h2>User Demographics</h2>

        {/* Gender Distribution Chart */}
        <div className="chart-container">
          <h3>Gender Distribution</h3>
          <div className="bar-chart">
            {genderDistribution.length > 0 ? (
              genderDistribution.map((item, index) => {
                const count = item.total_count || 0;
                const percentage = (count / maxGenderCount) * 100;
                return (
                  <div key={index} className="bar-item">
                    <div className="bar-label">{item.gender || "Not specified"}</div>
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{ width: `${percentage}%` }}>
                        {count}
                      </div>
                    </div>
                    <div className="bar-value">
                      {totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>

        {/* Age Distribution Chart */}
        <div className="chart-container">
          <h3>Age Distribution</h3>
          <div className="bar-chart">
            {ageDemographics.length > 0 ? (
              ageDemographics.map((item, index) => {
                const count = item.total_count || 0;
                const percentage = (count / maxAgeCount) * 100;
                return (
                  <div key={index} className="bar-item">
                    <div className="bar-label">{item.age_group}</div>
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{ width: `${percentage}%` }}>
                        {count}
                      </div>
                    </div>
                    <div className="bar-value">
                      {totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Loyalty Program Usage */}
      <section className="analytics-section">
        <h2>Loyalty Program Usage</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Points Redeemed</h3>
            <p className="stat-value">{(pointsRedeemed ?? 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Total Vouchers Redeemed</h3>
            <p className="stat-value">{(vouchersRedeemed ?? 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="loyalty-table">
          <h3>Top 10 Most Loyal Customers</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Total Appointments</th>
              </tr>
            </thead>
            <tbody>
              {loyalCustomers.length > 0 ? (
                loyalCustomers.map((customer, index) => (
                  <tr key={customer.user_id ?? index}>
                    <td>{index + 1}</td>
                    <td>{customer.username}</td>
                    <td>{customer.total_appointments}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Salon Performance */}
      <section className="analytics-section">
        <h2>Salon Performance</h2>

        <div className="performance-table">
          <h3>Top 5 Salons by Appointments</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Salon Name</th>
                <th>Total Appointments</th>
              </tr>
            </thead>
            <tbody>
              {topSalons.length > 0 ? (
                topSalons.map((salon, index) => (
                  <tr key={salon.salon_id ?? index}>
                    <td>{index + 1}</td>
                    <td>{salon.name}</td>
                    <td>{salon.total_appointments}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
          {topSalons.length > 0 && (
            <button className="see-all-btn" onClick={handleSeeAllSalons}>
              See All Salons
            </button>
          )}
        </div>

        <div className="performance-grid">
          <div className="performance-table">
            <h3>Top 5 Earning Services</h3>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Service</th>
                  <th>Salon</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topServices.length > 0 ? (
                  topServices.map((service, index) => (
                    <tr key={`${service.salon_id}-${service.service_id}`}>
                      <td>{index + 1}</td>
                      <td>{service.name}</td>
                      <td>{service.salon_name}</td>
                      <td>${parseFloat(service.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
            {topServices.length > 0 && (
              <button className="see-all-btn" onClick={handleSeeAllServices}>
                See All Services
              </button>
            )}
          </div>

          <div className="performance-table">
            <h3>Top 5 Earning Products</h3>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Salon</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <tr key={`${product.salon_id}-${product.product_id}`}>
                      <td>{index + 1}</td>
                      <td>{product.name}</td>
                      <td>{product.salon_name}</td>
                      <td>${parseFloat(product.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
            {topProducts.length > 0 && (
              <button className="see-all-btn" onClick={handleSeeAllProducts}>
                See All Products
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      {showSalonsModal && (
        <div className="modal-overlay" onClick={() => setShowSalonsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Salons by Appointments</h2>
              <button className="modal-close" onClick={() => setShowSalonsModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <p>Loading...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Salon Name</th>
                      <th>Total Appointments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSalons.map((salon, index) => (
                      <tr key={salon.salon_id ?? index}>
                        <td>{index + 1}</td>
                        <td>{salon.name}</td>
                        <td>{salon.total_appointments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showServicesModal && (
        <div className="modal-overlay" onClick={() => setShowServicesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Earning Services</h2>
              <button className="modal-close" onClick={() => setShowServicesModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <p>Loading...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Service</th>
                      <th>Salon</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allServices.map((service, index) => (
                      <tr key={`${service.salon_id}-${service.service_id}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{service.name}</td>
                        <td>{service.salon_name}</td>
                        <td>${parseFloat(service.revenue || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showProductsModal && (
        <div className="modal-overlay" onClick={() => setShowProductsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Earning Products</h2>
              <button className="modal-close" onClick={() => setShowProductsModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <p>Loading...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Product</th>
                      <th>Salon</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts.map((product, index) => (
                      <tr key={`${product.salon_id}-${product.product_id}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{product.name}</td>
                        <td>{product.salon_name}</td>
                        <td>${parseFloat(product.revenue || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
