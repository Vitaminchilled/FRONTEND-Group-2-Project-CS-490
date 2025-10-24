import React, { useState } from 'react'
import { useUser } from "../context/UserContext";
import greyDivider from "../assets/GreyLineDivider.png"

function AccountDetails() {
  const {user, setUser} = useUser();

  return (
    <div style={{display:'flex', justifyContent:'center', marginTop:'80px'}}>
        <div 
          className="account-page" 
          style={{
            display:"flex", 
            flexDirection:"column", 
            gap:'25px',
            alignItems:'center', 
            backgroundColor:'#fff1e8ff', 
            borderRadius:'10px',
            margin: '25px',
            maxWidth: '900px',
            boxShadow: 'inset 0 0 4px #a69385ff',
            padding: '20px',
            minHeight:'500px'
          }}
        >
          <h1 className="formal-title"
            style={{
              fontFamily:'Lateef',
              fontWeight: '500',
              fontSize:'80px',
              height:'90px',
              margin:'0'
            }}
          >
            Details
          </h1>

          <div className="img-container crop"
            style={{
              margin:'10px auto',
              width:'70%',
              maxWidth:'800px',
              overflow:'hidden'
            }}
          >
            <img
              className='grey-divider'
              src={greyDivider}
              alt="---"
              style={{
                transform: 'translateY(0px)',
                objectFit: 'cover',
                width:'100%',
                display:'block'
              }}
            />
          </div>
          
          {(user.type === 'none' || user.type === 'admin') && (
            <>
              <p>invalid user permissions i.e. wtf are you doing here</p>
            </>
          )}
          {(user.type === 'customer' || user.type === 'owner') && (
            <>
              <div className="personal-info"
                style={{
                  display:'flex', 
                  flexDirection:'column', 
                  gap:'10px', 
                  alignItems:'center'
                }}
              >
                <h3 className="account-group"
                  style={{
                    fontFamily:'Kumbh Sans',
                    fontSize:'20px',
                    textDecoration:'underline',
                    fontWeight:'400',
                    margin:'0'
                  }}
                >
                  Personal Info
                </h3>
              
                Username 
                Password
                First Name
                Last Name 
                Email 
                Phone Number 
                Birth Year 
                Tags
              </div>

              <div className="color-selection"
                style={{
                  display:'flex', 
                  flexDirection:'column', 
                  gap:'10px', 
                  alignItems:'center'
                }}
              >
                <h3 className="account-group"
                  style={{
                    fontFamily:'Kumbh Sans',
                    fontSize:'20px',
                    textDecoration:'underline',
                    fontWeight:'400',
                    margin:'0'
                  }}
                >
                  Color Selection
                </h3>
              
                Primary 
                Secondary 
                Accent 
                Primary Text 
                Secondary Text 
                Button Color
              </div>
              {(user.type === 'owner') && (
                <>
                  <div className="business-info"
                    style={{
                      display:'flex', 
                      flexDirection:'column', 
                      gap:'10px', 
                      alignItems:'center'
                    }}
                  >
                    <h3 className="account-group"
                      style={{
                        fontFamily:'Kumbh Sans',
                        fontSize:'20px',
                        textDecoration:'underline',
                        fontWeight:'400',
                        margin:'0'
                      }}
                    >
                      Business Info
                    </h3>
                  
                    Company Name
                    Company Email
                    Business Address
                    Category
                  </div>
                  
                  {/* maybe we can move this into user:owner business calendar */}
                  <div className="loyalty"
                    style={{
                      display:'flex', 
                      flexDirection:'column', 
                      gap:'10px', 
                      alignItems:'center'
                    }}
                  >
                    <h3 className="account-group"
                      style={{
                        fontFamily:'Kumbh Sans',
                        fontSize:'20px',
                        textDecoration:'underline',
                        fontWeight:'400',
                        margin:'0'
                      }}
                    >
                      Loyalty
                    </h3>
                  
                    20% Off 50 Points {'[ Hair ] [ Nails ]'} X
                  </div>
                </>
              )}
              
            </>
          )}

          
          
        </div>
    </div>
  )
}

export default AccountDetails