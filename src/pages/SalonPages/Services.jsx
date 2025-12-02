import './Services.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import stripeBackground from "../../assets/stripeBackground.png"
import ServiceItem from '../../components/ServiceItem.jsx'

import { ModalServiceDelete, ModalMessage } from '../../components/Modal.jsx';
import { BookAppointment } from '../../components/BookAppointment.jsx'

function Services() {
  const { salon_id } = useParams()
  const {user, setUser} = useUser(); /* will eventually be removed for other method */
  const [salon, setSalon] = useState({})
  const [tags, setTags] = useState([])
  const [services, setServices] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [newService, setNewService] = useState(null)

  const [modalService, setModalService] = useState(null); //holds service being displayed
  const handleDeleteClick = (service) => {
    setModalService(service); // open modal for this service
  }
  const [modalMessage, setModalMessage] = useState(null)
  const [bookAppointment, setBookAppointment] = useState(null)

  useEffect(() => {
    if (modalService || modalMessage || bookAppointment) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalService, modalMessage, bookAppointment]);

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
        throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText.error || errorText}`)
      }

      if(!services_response.ok) {
        const errorText = await services_response.json()
        throw new Error(`Services fetch failed: HTTP error ${services_response.status}: ${errorText || errorText}`)
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
      setError(err.message || "Unexpected Error Occurred")
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Add Service fetch failed: HTTP error ${response.status}: ${errorData.error || errorData}`)
      }
      const data = await response.json()
      /*alert(data.message)*/
      setModalMessage({
        title: "Success",
        content: data.message
      })
      setNewService(null)
      await retrieveServices()
    } catch (err) {
      console.error(err)
      setNewService(null)
      setModalMessage({
        title: "Error",
        content: err.message || 'This service could not be added.'
      })
    }
  }

  const handleCancelNewService = () => {
    setNewService(null)
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

      if (!editResponse.ok) {
        const errorData = await editResponse.json()
        throw new Error(`Edit Service fetch failed: HTTP error ${editResponse.status}: ${errorData.error || errorData}`)
      }

      const data = await editResponse.json()
      /*alert(data.message)*/
      setModalMessage({ 
        title: "Success",
        content: data.message
      })
      await retrieveServices()
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
        throw new Error(`Delete Service fetch failed: HTTP error ${deleteResponse.status}: ${errorData.error || errorData}`)
      }

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json()
        throw new Error(`Delete Service fetch failed: HTTP error ${deleteResponse.status}: ${errorData.error || errorData}`)
      }

      const data = await deleteResponse.json()
      /*alert(data.message)*/
      setModalService(null) /* is this necessary??? */
      setModalMessage({
        title: "Success",
        content: data.message
      })
      await retrieveServices()
    } catch (err) {
      console.error(err)
      setModalService(null)
      setModalMessage({
        title: "Error",
        content: err.message || 'This service could not be deleted.'
      })
    }
  }

  const handleBookClick = async (service) => {
    setBookAppointment(service)
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
                  
                  onSaveEdit={handleSaveEdit}
                  onDelete={() => handleDeleteClick(service)} 
                  onBook={() => handleBookClick(service)}
                />
              ))}
              {newService && (
                <ServiceItem
                  key="new"
                  accountType={user.type}
                  service={newService}
                  optionTags={tags}
                  newItem={true}
                  /* onStartEdit not necessary? */
                  onSaveEdit={handleAddService}
                  onCancelNew={handleCancelNewService}
                  /* onDelete not included since delete isnt valid for new service */
                />
              )}
            </div>
            {(user.type === 'owner') && (
              <button className='add-salon-item'
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
          {bookAppointment && (
            <BookAppointment 
              accountType={"customer"} /* change later */
              salon={salon}
              tags={tags}
              selectedService={bookAppointment}
              services={services}
              setModalOpen={setBookAppointment}
              setModalMessage={setModalMessage}
            />
          )}
        </div>
      ))}
    </>
  )
}

export default Services