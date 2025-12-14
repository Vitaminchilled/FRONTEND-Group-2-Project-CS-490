import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import background from '../assets/homePage_background.png';
import './Home.css'
import { useUser } from "./../context/UserContext";

function Salon( {salon} ) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    if (salon.average_rating >= starValue) return "★";
    if (salon.average_rating >= starValue - 0.5) return "⯪";
    return "☆";
  });

  return (
    <Link key={salon.salon_id} className="Salon" to={`/salon/${salon.salon_id}`}>
      <div className="SalonTop"></div>
      <div className="SalonBottom">
        <h2>{salon.name}</h2>
        <div className="Stars">
          {stars.map((star, index) => (
            <span key={index}>{star}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}


function TagGroup( {tag} ){
  const [salons, setSalons] = useState([]);

  useEffect(() => {
      const fetchSalons = async() => {
          try {
              //const response = await fetch(`/api/TopSalonsByTag?tag=${encodeURIComponent(tag)}`);
              //Delete bellow  when the above fetch is added
              const name = "NAME";
              const response = await fetch(`/api/salonData`);

              if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
              }
              const result = await response.json();
              setSalons(result.salons);
          } catch (error) {
              console.error(error.message);
          }
      }
      fetchSalons();
  }, []);

  if (salons.length === 0) return null;

  return(
    <div className='TagGroup'>
      <h1>{tag}</h1>
      <hr />
      <div className='TagGroupSalons'>
        {salons.slice(0, 3).map((salon, index) => (
          <Salon key={index} salon={salon} />
        ))}
      </div>
      {salons.length > 3 && (
        <div className='TagGroupSalons'>
          {salons.slice(3, 6).map((salon, index) => (
            <Salon key={index} salon={salon} />
          ))}
        </div>
      )}
    </div>
  );
}

function Home() {
  const {user, setUser, loading: userLoading} = useUser();
  const tagRefs = useRef({});

  const scrollToTag = (tag) => {
  const element = tagRefs.current[tag];
  if (!element) return;

  const yOffset = -70; // adjust this value 👈
  const y =
    element.getBoundingClientRect().top + window.pageYOffset + yOffset;

  window.scrollTo({
    top: y,
    behavior: "smooth"
  });
};


  const tags = [
    "Hair Salon",
    "Barbershop",
    "Nail Salon",
    "Beauty Salon",
    "Brows and Lashes",
    "Day Spa"
  ];

  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState("")
  const handleSearch = (event) => {
    event.preventDefault()
    navigate('/search', {
      state: { filter: { business_name: businessName, categories: [], employee_first: "", employee_last: "" } }
    })
  }
  
  const [favorites, setFavorites] = useState([])

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
    } catch (err) {
      console.error('getFavoritedSalons error:', err);
    }
  }

  useEffect(() => {
    if (user?.user_id) getFavoritedSalons()
  },[user?.user_id])

  return (
    <div className="Home">
      <div className="Background">
        <div className="BackgroundInner">
          <h1>WELCOME</h1>
          <form>
            <input autoComplete="off" type="text" placeholder="Search salons by name" name="search" value={businessName}
              onChange={event => setBusinessName(event.target.value)} 
            />
            <button onClick={handleSearch} type="submit">Search</button>
          </form>
        </div>
        <img src={background} alt="None" />
      </div>

      <div className='TagsBar'>
        {tags.map((tag, index) => (
          <button key={index} onClick={() => scrollToTag(tag)}>{tag}</button>
        ))}
      </div>

      {user?.type === 'customer' && favorites.length > 0 && (
        <div className="TagGroup">
          <h1>Favorites</h1>
          <hr />
          <div className="TagGroupSalons">
            {favorites.slice(0, 6).map((salon) => (
              <Salon key={salon.salon_id} salon={salon} />
            ))}
          </div>
        </div>
      )}

      <div>
        {tags.map((tag, index) => (
          <div key={index} ref={(el) => (tagRefs.current[tag] = el)}>
            <TagGroup tag={tag}/>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
