function DashboardGroup({ groupTitle, groupExtra, groupImg }) {
    return(
        <div className='dashboard-group'
          style={{
            display:'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap:'10px'
          }}
        >

            <div className="group-header"
                style={{
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'center',
                    gap:'10px'
                }}
            >

                <h2 className="group-title"
                    style={{
                    fontFamily: 'Lateef',
                    fontWeight: '500',
                    fontSize: '45px',
                    margin: '15px 0 0 0',
                    padding: '0',
                    lineHeight: '1',
                    height: '34px'
                    }}
                >
                    {groupTitle}
                </h2>

                {groupExtra && <p className="group-extra"
                    style={{
                    fontFamily: 'Kumbh Sans',
                    color: '#4c4c4c',
                    fontSize: '16px',
                    margin: '0',
                    padding: '0'
                    }}  
                >
                    {groupExtra}
                </p>}

                {groupImg && <img
                    src={groupImg}
                    alt='4 stars'
                    style={{
                        height: '20px',
                        marginBottom: '0'
                    }}
                />}

            </div>

            <div className='grey-divider'
                style={{
                width: '70vw',
                maxWidth: '700px',
                height: '2px',
                backgroundColor: '#b6b6b6',
                margin: '10px 0 0 0'
                }}
            >
            </div>

        </div>
    )
}

export default DashboardGroup