/* just styling no functionality */

function SearchSalons() {
  return (
    <div className='search-page'>
        <div style={{backgroundColor:'#f0d7bd', height:'100px', width:'100%', marginBottom:'30px'}}></div>
        <div className="inner-format" style={{display:'flex', justifyContent:'center', gap:'50px', padding:'0', margin:'0px 20px'}}>
            <div className="search-filter" style={{borderRadius:'20px', padding:'0', minWidth:'20vw', textAlign:'center', boxShadow:'5px 5px 10px #b0b0b0ff'}}>
                <div className='filter-section' style={{backgroundColor:'#f0d7bd', borderTopLeftRadius:'20px', borderTopRightRadius: '20px', padding:'15px'}}>
                  <h1 style={{fontWeight:'800', fontSize:'20px', fontFamily:'Kumbh Sans', paddingTop:'6px', paddingBottom:'20px', margin:'0'}}>Search Options</h1>
                  <form style={{display:'flex', flexDirection:'column', gap:'18px'}}>
                    <label>
                      <input 
                        placeholder='Business Name'
                        style={{border:'0', padding:'10px', width:'90%', fontWeight:'500', fontFamily: 'Kumbh Sans', borderRadius:'10px'}}
                      />
                    </label>
                    <label>
                      <input 
                        placeholder='Category'
                        style={{border:'0', padding:'10px', width:'90%', fontWeight:'500', fontFamily: 'Kumbh Sans', borderRadius:'10px'}}
                      />
                    </label>
                    <label>
                      <input 
                        placeholder='Location'
                        style={{border:'0', padding:'10px', width:'90%', fontWeight:'500', fontFamily: 'Kumbh Sans', borderRadius:'10px'}}
                      />
                    </label>
                    <label>
                      <input 
                        placeholder='Employee Names'
                        style={{border:'0', padding:'10px', width:'90%', fontWeight:'500', fontFamily: 'Kumbh Sans', borderRadius:'10px'}}
                      />
                    </label>
                    <p style={{textAlign:'start', fontWeight:'600', fontFamily: 'Kumbh Sans', padding:'0', margin:'0'}}>Tags</p>
                    <p style={{textAlign:'start', fontWeight:'600', fontFamily: 'Kumbh Sans', padding:'0', margin:'0'}}>Rating</p>
                  </form>
                </div>
                <div className='button-section' style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', backgroundColor:'white', borderBottomLeftRadius:'20px', borderBottomRightRadius: '20px', padding:'15px'}}>
                  <button style={{borderRadius:'10px', width:'100%', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans'}}>Search</button>
                  <button style={{borderRadius:'10px', width:'100%', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans'}}>Reset</button>
                </div>
            </div>
            <div className="search-results" style={{backgroundColor:'#f0d7bd', borderRadius:'20px', textAlign:'center', alignItems:'center',width:'60vw', boxShadow:'5px 5px 10px #b0b0b0ff', padding:'20px'}}>
                <div className='title-section' style={{backgroundColor:'#f7ede3', borderTopLeftRadius:'20px', borderTopRightRadius: '20px', padding:'0px'}}>
                  <h1 style={{fontWeight:'800', fontSize:'20px', fontFamily:'Kumbh Sans', padding:'15px', margin:'0'}}>Businesses</h1>
                  {/* add map here for all salon results */}
                </div>
                <div className='results-selection' style={{display:'flex', flexDirection:'column',justifyContent:'center', alignItems:'center', gap:'20px', backgroundColor:'white', borderBottomLeftRadius:'20px', borderBottomRightRadius: '20px', padding:'25px 20px 30px 20px'}}>
                  <div style={{backgroundColor:'#f0d7bd', padding:'15px', borderRadius:'15px', width:'95%', boxShadow:'2px 5px 5px #989898ff', fontWeight:'300', fontSize:'20px', fontFamily:'Kumbh Sans'}}>
                    Awesome Hair Salon | Hair | Rating: 4 stars
                  </div>
                  <div style={{backgroundColor:'#f0d7bd', padding:'15px', borderRadius:'15px', width:'95%', boxShadow:'2px 5px 5px #989898ff', fontWeight:'300', fontSize:'20px', fontFamily:'Kumbh Sans'}}>
                    Barber Bros | Barber | Rating: 3 stars
                  </div>
                  <div style={{backgroundColor:'#f0d7bd', padding:'15px', borderRadius:'15px', width:'95%', boxShadow:'2px 5px 5px #989898ff', fontWeight:'300', fontSize:'20px', fontFamily:'Kumbh Sans'}}>
                    Brow Lifts | Brows | Rating: 5 stars
                  </div>
                </div>
                <div className='pagination-section' style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'10px', paddingBottom:'0', paddingTop:'20px', paddingLeft: '20px', paddingRight: '20px'}}>
                  <button style={{borderRadius:'5px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>{'<<'} Previous</button>
                  <button style={{borderRadius:'5px', width:'40px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>1</button>
                  <button style={{borderRadius:'5px', width:'40px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>2</button>
                  ...
                  <button style={{borderRadius:'5px', width:'40px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>3</button>
                  <button style={{borderRadius:'5px', width:'40px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>4</button>
                  <button style={{borderRadius:'5px', width:'40px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>5</button>
                  ...
                  <button style={{borderRadius:'5px', width:'40px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>6</button>
                  <button style={{borderRadius:'5px', width:'40px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>7</button>
                  <button style={{borderRadius:'5px', padding:'10px', border:'0', backgroundColor:'#b98a59', color:'white', fontWeight:'500', fontSize:'15px', fontFamily:'Kumbh Sans', boxShadow:'2px 2px 5px #563b2dff'}}>Next {'>>'}</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SearchSalons