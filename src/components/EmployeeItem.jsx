import "./EmployeeItem.css"

function EmployeeItem({ employeeImg, employeeName, employeeDesc }) {
    return (
        <div className='staff-item'>
            <div className='grid-layout'>
                <img className="employee-img"
                    src={employeeImg}
                    alt='img'
                />

                <h3 className='employee-name'>{employeeName}</h3>
                <p className='employee-description'>{employeeDesc}</p>
            </div>
        </div>
    )
}

export default EmployeeItem