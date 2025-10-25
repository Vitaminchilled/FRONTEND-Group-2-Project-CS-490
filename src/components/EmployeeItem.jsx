function EmployeeItem({ employeeImg, employeeName, employeeDesc }) {
    return (
        <div className='staff-item'
            style={{
                width: '70vw',
                maxWidth: '900px'
            }}
        >
            <div className='grid-layout'
                style={{
                display: 'grid',
                gridTemplateColumns: '20% 80%',
                gridTemplateRows: 'auto auto',
                rowGap: '0',
                columnGap: '10px'
                }}
            >
                <img
                src={employeeImg}
                alt='img'
                style={{
                    gridRow: '1 / -1',
                    gridColumn: '1',
                    width:'100px',
                    height: '100px',
                    borderRadius:'10px',
                    borderColor: '#a5a5a5ff',
                    alignSelf: 'center',
                    justifySelf: 'center'
                }}
                />

                <h3 className='employee-name'
                style={{
                    gridRow:'1',
                    gridColumn: '2',
                    fontFamily: 'Lateef',
                    fontSize: '40px',
                    fontWeight: '500',
                    height: '50px',
                    margin: '0'
                }}
                >{employeeName}</h3>
                <p className='employee-description'
                style={{
                    gridRow: '2',
                    gridColumn: '2',
                    fontFamily: 'Kumbh Sans',
                    fontSize: '18px',
                    margin: '0'
                }}
                >{employeeDesc}</p>
            </div>
        </div>
    )
}

export default EmployeeItem