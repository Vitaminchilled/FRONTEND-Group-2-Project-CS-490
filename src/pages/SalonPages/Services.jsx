import './Services.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import stripeBackground from "../../assets/stripeBackground.png"
import ServiceItem from '../../components/ServiceItem.jsx'

import {ModalServiceDelete, ModalMessage} from '../../components/Modal.jsx';

function Services() {
  const { salon_id } = useParams()
  const {user, setUser} = useUser(); /* will eventually be removed for other method */
  const [salon, setSalon] = useState({})
  const [tags, setTags] = useState([])
  const [services, setServices] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editingServiceId, setEditingServiceId] = useState(null);
  const [newService, setNewService] = useState(null)

  const [modalService, setModalService] = useState(null); //holds service being displayed
  const handleDeleteClick = (service) => {
    setModalService(service); // open modal for this service
  }
  const [modalMessage, setModalMessage] = useState(null)

  useEffect(() => {
    if (modalService || modalMessage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalService, modalMessage]);

  const retrieveServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const salon_response = await fetch(`/api/salon/${salon_id}/header`)
      const services_response = await fetch(`/api/salon/${salon_id}/services`)

      console.log(user.type)

      if (salon_response.status === 404) {
        setError("Salon not found")
        setServices([])
        return
      }

      if(!salon_response.ok) {
        const errorText = await salon_response.json()
        throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText}`)
      }

      if(!services_response.ok) {
        const errorText = await services_response.json()
        throw new Error(`Services fetch failed: HTTP error ${services_response.status}: ${errorText}`)
      }

      const salon_data = await salon_response.json()
      const services_data = await services_response.json()
      console.log(salon_data)
      console.log(services_data)
      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        services: retrievedServices=[]
      } = services_data || {}

      const {
        salon: retrievedSalon=[],
        tags: retrievedTags=[]
      } = salon_data || {}
      
      setServices(retrievedServices)
      setSalon(retrievedSalon)
      setTags(retrievedTags)

    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.error || "Unexpected Error Occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retrieveServices()
  }, [salon_id])

  const handleAddService = async (serviceData) => {
    try {
      const cleanedData = {
        ...serviceData,
        name: serviceData.name.trim(),
        description: serviceData.description.trim(),
        price: parseFloat(serviceData.price),
        duration_minutes: parseInt(serviceData.duration_minutes, 10),
        tags: Array.isArray(serviceData.tags) ? serviceData.tags : [],
      }

      const response = await fetch(`/api/salon/${salon_id}/services/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      })

      if (!response.ok) throw new Error('Failed to add service')
      const data = await response.json()
      /*alert(data.message)*/
      setModalMessage({
        title: "Success",
        content: data.message
      })
      setNewService(null)
      await retrieveServices().catch(err => console.error("Failed to refresh services:", err))
    } catch (err) {
      console.error(err)
      /*alert('Could not add service')*/
      setModalMessage({
        title: "Error",
        content: err.message || 'This service could not be added.'
      })
    }
  }

  const handleStartEdit = (serviceID) => {
    setEditingServiceId(serviceID)
  }

  const handleCancelEdit = () => {
    setEditingServiceId(null)
  }

  const handleSaveEdit = async (updatedService) => {
    try {
      const cleanedData = {
        ...updatedService,
        name: updatedService.name.trim(),
        description: updatedService.description.trim(),
        price: parseFloat(updatedService.price),
        duration_minutes: parseInt(updatedService.duration_minutes, 10),
        tags: Array.isArray(updatedService.tags) ? updatedService.tags : [],
      }

      const editResponse = await fetch(`/api/salon/${salon_id}/services/${updatedService.service_id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      })

      if (!editResponse.ok) throw new Error('Failed to update service')

      const data = await editResponse.json()
      setEditingServiceId(null)
      /*alert(data.message)*/
      setModalMessage({ 
        title: "Success",
        content: data.message
      })
      await retrieveServices().catch(err => console.error("Failed to refresh services:", err))
    } catch (err) {
      console.error(err)
      /*alert('Could not update service')  update to modal styling? */
      setModalMessage({
        title: "Error",
        content: err.message || 'This service could not be updated.'
      })
    }
  }

  const handleDeleteService = async (serviceID) => {
    try {
      const deleteResponse = await fetch(`/api/salon/${salon_id}/services/${serviceID}`, {
        method: 'DELETE'
      })

      if (deleteResponse.status === 409) {
        const errorData = await deleteResponse.json()
        throw new Error(errorData.error || 'Failed to delete service')
      }

      if (!deleteResponse.ok) throw new Error('Failed to delete service')

      const data = await deleteResponse.json()
      setEditingServiceId(null)
      /*alert(data.message)*/
      setModalService(null) /* is this necessary??? */
      setModalMessage({
        title: "Success",
        content: data.message
      })
      await retrieveServices().catch(err => console.error("Failed to refresh services:", err))
    } catch (err) {
      console.error(err)
      /*alert(err.message || 'Could not delete service')  update to modal styling? */
      setModalService(null) /* is this necessary??? */
      setModalMessage({
        title: "Error",
        content: err.message || 'This service could not be deleted.'
      })
    }
  }

  return (
    <>
      {(!loading && error ? (
        <p className='not-found'>{error}</p>
      ) : (
        <div className="services-page">
          <div className="services-background"
            style={{
              backgroundImage: `url(${stripeBackground})`,
            }}
          >
          </div>

          <div className="services-content">
            
            <SalonHeader
              salonID={salon_id}
              headerTitle={salon.salon_name}
              headerTags={tags}
              headerRatingValue={salon.average_rating}
            />

            <h2 className="page-title">
              Services
            </h2>

            <div className="service-group">
              {services.map((service) => (
                <ServiceItem
                  key={service.service_id}
                  accountType={user.type}
                  service={service}
                  optionTags={tags}
                  isEditing={editingServiceId === service.service_id}
                  onStartEdit={() => handleStartEdit(service.service_id)}
                  onCancelEdit={handleCancelEdit}
                  onSaveEdit={handleSaveEdit}
                  onDelete={() => handleDeleteClick(service)} 
                  /* onDelete={() => handleDeleteService(service.service_id)} */
                />
              ))}
              {newService && (
                <ServiceItem
                  key="new"
                  accountType={user.type}
                  service={newService}
                  optionTags={tags}
                  isEditing={true}
                  /* onStartEdit not necessary? */
                  onCancelEdit={() => setNewService(null)}
                  onSaveEdit={handleAddService}
                  /* onDelete not included since delete isnt valid for new service */
                />
              )}
            </div>
            {(user.type === 'owner') && (
              <button className='add-service'
                onClick={() => setNewService({
                  service_id: null,
                  name: '',
                  price: '',
                  description: '',
                  duration_minutes: '',
                  tags: [],
                  is_active: 1
                })}
                disabled={newService !== null}
              >
                Add Service
              </button>
            )}
          </div>
          {modalService && (
            <ModalServiceDelete
              service={modalService}
              setModalOpen={setModalService}
              onConfirm={handleDeleteService}
            />
          )}
          {modalMessage && (
            <ModalMessage
              content={modalMessage.content}
              title={modalMessage.title}
              setModalOpen={setModalMessage}
            />
          )}
        </div>
      ))}
    </>
  )
}

export default Services