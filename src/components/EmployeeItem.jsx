import React, { useEffect, useState } from 'react'
import employeeIcon from '../assets/PersonIcon.png'
import "./EmployeeItem.css"
import deleteIcon from '../assets/BlackXIcon.png'
import tagRemove from '../assets/WhiteXIcon.png'

function EmployeeItem({ accountType, employee, optionTags = [], newItem = false, onSaveEdit, onDelete, onCancelNew}) {
    const [editData, setEditData] = useState({
        ...employee,
        tags: employee.tags || [],
        effective_date: employee.effective_date || new Date().toISOString().split('T')[0]
    })
    const [isEditing, setIsEditing] = useState(false)
    const [newTag, setNewTag] = useState('')
    
    useEffect(() => {
        setEditData(employee)
    }, [employee])

    useEffect(() => {
        if (newItem) {
            setIsEditing(true)
        }
    }, [newItem])

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    const handleStartEdit = () => setIsEditing(true)
    const handleCancelEdit = () => {
        if (newItem) {
            onCancelNew?.()
        } else {
            setIsEditing(false)
            setEditData(employee) // reset changes
        }
    }

    //to disable edit mode after saving
    const handleSaveClick = async () => {
        try {
            await onSaveEdit(editData, employee)
            setIsEditing(false) // switch back to standard mode
        } catch (err) {
            console.error(err)
        }
    }

    const handleAddTag = (event) => {
        event.preventDefault()
        if (!newTag) return
        if (!editData.tags.includes(newTag)) {
            setEditData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }))
        }
        setNewTag('')
    }

    const handleRemoveTag = (TagToRemove) => {
        setEditData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== TagToRemove)
        }))
    }
    
    return (
        <div className={`staff-item ${accountType === 'owner' ? "owner" : ""}`}>
            {(accountType === 'owner') && (
                isEditing ? (
                    <div className='edit-grid-layout'>
                        <div className='name-section'>
                            <div className='first-name-section'>
                                <label className='edit-label first'>First Name:</label>
                                <input className='edit-input first'
                                    name='first_name'
                                    value={editData.first_name}
                                    onChange={handleChange}
                                    placeholder='First Name'
                                    autoComplete='off'
                                    required
                                />
                            </div>
                            <div className='last-name-section'>
                                <label className='edit-label last'>Last Name:</label>
                                <input className='edit-input last'
                                    name='last_name'
                                    value={editData.last_name}
                                    onChange={handleChange}
                                    placeholder='Last Name'
                                    autoComplete='off'
                                    required
                                />
                            </div>
                        </div>
                        <img className='edit-remove'
                            src={deleteIcon}
                            alt='X'
                            onClick={() => {
                                if (employee.employee_id === null) return
                                onDelete(employee)  
                            }}
                            style={{ opacity: employee.employee_id === null ? 0.2 : 1, cursor: employee.employee_id === null ? 'not-allowed' : 'pointer' }}
                        />
                        <div className='description-section'>
                            <label className='edit-label description'>Description:</label>
                            <textarea className='edit-input description'
                                name='description'
                                value={editData.description}
                                onChange={handleChange}
                                placeholder='Employee Description'
                                required
                            />
                        </div>
                        <div className='salary-section'>
                            <label className='edit-label salary'>Hourly Salary: $</label>
                            <input className='edit-input salary'
                                name='salary_value'
                                value={editData.salary_value}
                                onChange={handleChange}
                                onBlur={(event) => {
                                        let value = parseFloat(event.target.value || 0)
                                        if (value < 0) value = 0

                                        setEditData(prev => ({
                                            ...prev,
                                            salary_value: value.toFixed(2)
                                        }))
                                    }
                                }
                                placeholder='Salary/hr ex. 10.00'
                                type='number'
                                step={0.01}
                                min={0}
                                autoComplete='off'
                                required
                            />
                        </div>
                        <div className='tag-section'>
                            <label className='edit-label tags'>Tags:</label>
                            <div className='current-tags'>
                                {editData.tags.map((tag, index) => (
                                    <div key={index} className='tag-item'>
                                        <p className='tag-title'>
                                            {tag}
                                        </p>
                                        <img className='tag-remove'
                                            src={tagRemove}
                                            alt="X"
                                            onClick={() => handleRemoveTag(tag)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className='add-tags'>
                                <select className='edit-input tags'
                                    value={newTag}
                                    onChange={event => setNewTag(event.target.value)}
                                >
                                    <option value=''>Choose</option>
                                    {optionTags.map((optionTag) => (
                                        <option key={optionTag.master_tag_id} value={optionTag.name}>
                                            {optionTag.name}
                                        </option>
                                    ))}
                                </select>
                                <button className='edit-btn-tags' onClick={handleAddTag}>Add</button>
                            </div>
                        </div>
                        <div className='edit-buttons'>
                            <button className='edit-btn-save'
                                onClick={handleSaveClick}
                                disabled={
                                    !editData.first_name?.trim() ||
                                    !editData.last_name?.trim() ||
                                    !editData.description?.trim() ||
                                    !editData.salary_value || editData.salary_value <= 0
                                }
                            >
                                Save
                            </button>
                            <button className='edit-btn-cancel'
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='grid-layout'>
                        <img className="employee-img"
                            src={employeeIcon}
                            alt='img'
                        />

                        <h3 className='employee-name'>{`${employee.first_name} ${employee.last_name}`}</h3>
                        <p className='employee-description'>{employee.description}</p>
                        <p className='employee-salary'><strong>Salary:</strong> {employee.salary_value}/hr</p>
                        <button className='item-btn'
                            onClick={handleStartEdit}
                        >
                            Edit
                        </button>
                        <div className='tag-section'>
                            {Array.isArray(employee.tags) && employee.tags.map((tag, index) => (
                                <div key={index} className='employee-tag'>
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}
            {(accountType === 'none' || accountType === 'customer' || accountType === 'admin') && (
                <div className='grid-layout'>
                    <img className="employee-img"
                        src={employeeIcon}
                        alt='img'
                    />

                    <h3 className='employee-name'>{`${employee.first_name} ${employee.last_name}`}</h3>
                    <p className='employee-description'>{employee.description}</p>
                    <div className='tag-section'>
                        {Array.isArray(employee.tags) && employee.tags.map((tag, index) => (
                            <div key={index} className='employee-tag'>
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default EmployeeItem