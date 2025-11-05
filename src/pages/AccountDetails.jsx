import React, { useState } from 'react'
import { useUser } from "../context/UserContext";

function AccountDetails() {
  const {user, setUser} = useUser();

  return (
    <div className="account-body"
      style={{
        display:'flex', 
        justifyContent:'center',
        backgroundColor: '#f0d9b9',
        height: '88.5vh',
        width: '100vw'
      }}
    >
      <div className="account-page"
        style={{
          display:"flex", 
          flexDirection:"column", 
          gap:'25px',
          alignItems:'center', 
          backgroundColor:'#fff1e8ff', 
          borderRadius:'10px',
          margin: '25px',
          width: '80vw',
          maxWidth: '1000px',
          boxShadow: 'inset 0 0 4px #a69385ff',
          padding: '20px 50px 80px 50px'
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
        <div className='grey-divider'
          style={{
            width: '500px',
            height:'2px',
            backgroundColor: '#b6b6b6'
          }}
        ></div>

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