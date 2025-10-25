import { useEffect, useState, useRef } from "react";
import background from '../assets/homePage_background.png';
import './Home.css'

function Salon( {salon} ) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    if (salon.average_rating >= starValue) return "★";
    if (salon.average_rating >= starValue - 0.5) return "⯪";
    return "☆";
  });

  return (
    <div className="Salon" role="button" onClick={() => console.log(`Clicked ${salon.name}`)}>
      <div className="SalonTop"></div>
      <div className="SalonBottom">
        <h2>{salon.name}</h2>
        <div className="Stars">
          {stars.map((star, index) => (
            <span key={index}>{star}</span>
          ))}
        </div>
      </div>
    </div>
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
  const tagRefs = useRef({});

  const scrollToTag = (tag) => {
    const element = tagRefs.current[tag];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const tags = [
    "Hair Salon",
    "Barbershop",
    "Nail Salon",
    "Beauty Salon",
    "Brows and Lashes",
    "Day Spa"
  ];

  return (
    <div className="Home">
      <div className="Background">
        <img src={background} alt="None" />
        <h1>WELCOME</h1>
        <form>
          <input autoComplete="off" type="text" placeholder="Search salons, stylists, or services" name="search" />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className='TagsBar'>
        {tags.map((tag, index) => (
          <button key={index} onClick={() => scrollToTag(tag)}>{tag}</button>
        ))}
      </div>

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
