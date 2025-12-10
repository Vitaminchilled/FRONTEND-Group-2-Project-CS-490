import { useMemo, useState, useEffect } from "react";
import "./SalonRegistrationPart1.css";

import ServiceItem from "../../components/ServiceItem.jsx";
import EmployeeItem from "../../components/EmployeeItem.jsx";
import { ModalServiceDelete, ModalMessage } from "../../components/Modal.jsx";

function SalonRegistrationPart2({ data={}, updateData, onNext, onBack, isLoading }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState(data.services || []);
  const [servicesMessage, setServicesMessage] = useState("");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [newService, setNewService] = useState(null);
  const [modalService, setModalService] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);

  const [employees, setEmployees] = useState(data.employees || []);
  const [employeesMessage, setEmployeesMessage] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [newEmployee, setNewEmployee] = useState(null);

  // State for tags loaded from database
  const [masterTags, setMasterTags] = useState([]);
  const [allServiceTags, setAllServiceTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  const [selectedMasterIds, setSelectedMasterIds] = useState(data.master_tag_ids?.map(String) || []);
  const [tagsMessage, setTagsMessage] = useState("");

  // Fetch master tags and service tags from database
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        // Fetch master tags
        const masterResponse = await fetch('/api/master-tags');
        const masterData = await masterResponse.json();
        
        if (masterData.master_tags) {
          setMasterTags(masterData.master_tags.map(tag => ({
            master_tag_id: String(tag.master_tag_id),
            name: tag.name
          })));

          // Fetch service tags for each master tag
          const allTags = [];
          for (const masterTag of masterData.master_tags) {
            const tagsResponse = await fetch(`/api/tags/${masterTag.master_tag_id}`);
            const tagsData = await tagsResponse.json();
            
            if (tagsData.tags && Array.isArray(tagsData.tags)) {
              // tags is an array of tuples [tag_id, name]
              tagsData.tags.forEach(tagTuple => {
                allTags.push({
                  tag_id: String(tagTuple[0]),
                  name: tagTuple[1],
                  master_tag_id: String(masterTag.master_tag_id)
                });
              });
            }
          }
          setAllServiceTags(allTags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        setModalMessage({ 
          title: "Error", 
          content: "Failed to load tags from database. Please refresh and try again." 
        });
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  const chipBase = {
    borderRadius: 18,
    padding: "10px 16px",
    background: "#ffffff",
    border: "1px solid #e6dfd5",
    color: "#5a5a5a",
    fontWeight: 500,
    lineHeight: 1.1,
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  };

  const chipSelected = {
    background: "#B98A59",
    color: "#ffffff",
    border: "1px solid #B98A59",
  };

  // Helper function to convert master tag IDs to names for backend
  const convertMasterTagIdsToNames = (masterTagIds) => {
    if (!Array.isArray(masterTagIds)) return [];
    return masterTagIds
      .map(id => {
        const tag = masterTags.find(t => String(t.master_tag_id) === String(id));
        return tag ? tag.name : null;
      })
      .filter(name => name !== null);
  };

  const updateParent = (updates={}) => {
    if(updateData) {
      updateData({
        master_tag_ids: selectedMasterIds,
        employees,
        services,
        ...updates,
      });
    }
  };

  // Filter service tags based on selected master categories
  const allowedTags = useMemo(() => {
    if(!selectedMasterIds.length || !allServiceTags.length) return [];
    return allServiceTags.filter(t => selectedMasterIds.includes(String(t.master_tag_id)));
  }, [selectedMasterIds, allServiceTags]);

  // Format tags for ServiceItem - needs tag_id and name properties
  const tagOptions = useMemo(() => {
    return allowedTags.map(t => ({
      tag_id: String(t.tag_id),
      name: t.name,
      master_tag_id: String(t.master_tag_id)
    }));
  }, [allowedTags]);

  // Filter master tags for employees based on selected master categories in step 1
  const employeeMasterTagOptions = useMemo(() => {
    if (!selectedMasterIds.length || !masterTags.length) return [];
    return masterTags.filter(mt => selectedMasterIds.includes(String(mt.master_tag_id)));
  }, [selectedMasterIds, masterTags]);

  const updateServices = (newServices) => {
    setServices(newServices);
    updateParent({ services: newServices });
  };

  const handleAddService = (serviceData) => {
    // ServiceItem already stores tags as NAMES (strings)
    // Just clean up the data, don't filter tags
    const clean = {
      ...serviceData,
      name: serviceData.name?.trim() || "",
      description: serviceData.description?.trim() || "",
      price: Number(serviceData.price) || 0,
      duration_minutes: parseInt(serviceData.duration_minutes) || 0,
      tags: Array.isArray(serviceData.tags) ? serviceData.tags : [], // Keep tags as-is (they're already names)
      service_id: crypto.randomUUID?.() || `tmp_${Date.now()}`,
      is_active: 1,
    };
    
    console.log("Adding service:", clean);
    
    updateServices([...services, clean]);
    setNewService(null);
    setModalMessage({ title: "Saved", content: "Service added to your draft." });
    setServicesMessage("");
  };

  const handleSaveEdit = (updated) => {
    // ServiceItem already stores tags as NAMES (strings)
    // Just clean up the data, don't filter tags
    const clean = {
      ...updated,
      name: updated.name?.trim() || "",
      description: updated.description?.trim() || "",
      price: Number(updated.price) || 0,
      duration_minutes: parseInt(updated.duration_minutes) || 0,
      tags: Array.isArray(updated.tags) ? updated.tags : [], // Keep tags as-is (they're already names)
    };
    
    console.log("Saving edited service:", clean);
    
    const newList = services.map(s => s.service_id === clean.service_id ? clean : s);
    updateServices(newList);
    setEditingServiceId(null);
    setModalMessage({ title: "Saved", content: "Service updated in your draft." });
  };

  const handleDeleteService = (serviceID) => {
    const newList = services.filter(s => String(s.service_id) !== String(serviceID));
    updateServices(newList);
    setModalService(null);
    setModalMessage({ title: "Removed", content: "Service removed from your draft." });
  };

  const updateEmployees = (newEmployees) => {
    setEmployees(newEmployees);
    updateParent({ employees: newEmployees });
  };

  const handleAddEmployee = (employeeData) => {
    // EmployeeItem stores tags as master tag IDs or names
    const clean = {
      ...employeeData,
      first_name: employeeData.first_name?.trim() || "",
      last_name: employeeData.last_name?.trim() || "",
      description: employeeData.description?.trim() || "",
      salary_value: Number(employeeData.salary_value) || 0,
      tags: Array.isArray(employeeData.tags) ? employeeData.tags : [],
      employee_id: crypto.randomUUID?.() || `emp_${Date.now()}`,
    };
    
    console.log("Adding employee:", clean);
    
    updateEmployees([...employees, clean]);
    setNewEmployee(null);
    setModalMessage({ title: "Saved", content: "Employee added to your draft." });
    setEmployeesMessage("");
  };

  const handleSaveEmployeeEdit = (updated) => {
    const clean = {
      ...updated,
      first_name: updated.first_name?.trim() || "",
      last_name: updated.last_name?.trim() || "",
      description: updated.description?.trim() || "",
      salary_value: Number(updated.salary_value) || 0,
      tags: Array.isArray(updated.tags) ? updated.tags : [],
    };
    
    console.log("Saving edited employee:", clean);
    
    const newList = employees.map(e => e.employee_id === clean.employee_id ? clean : e);
    updateEmployees(newList);
    setEditingEmployeeId(null);
    setModalMessage({ title: "Saved", content: "Employee updated in your draft." });
  };

  const handleDeleteEmployee = (employee) => {
    const newList = employees.filter(e => String(e.employee_id) !== String(employee.employee_id));
    updateEmployees(newList);
    setModalMessage({ title: "Removed", content: "Employee removed from your draft." });
  };

  const toggleMaster = (id) => {
    const strId = String(id);
    setSelectedMasterIds(prev => {
      const has = prev.includes(strId);
      let updated = has ? prev.filter(m => m !== strId) : [...prev, strId];
      return updated;
    });
    setTagsMessage("");
  };

  const goToStep = (target) => {
    if(target === 2 && !selectedMasterIds.length) {
      setTagsMessage("Please select at least one category.");
      return;
    }
    if(target === 3 && !services.length) {
      setServicesMessage("Please add at least one service.");
      return;
    }
    setTagsMessage("");
    setServicesMessage("");
    setEmployeesMessage("");
    setStep(target);
  };

  const handleFinish = () => {
    if(!services.length) {
      setServicesMessage("At least one service is required.");
      return;
    }

    console.log("=== DEBUG: Finishing registration ===");
    console.log("Services (tags are already NAMES):", services);
    console.log("Employees:", employees);

    // Services already have tags as NAMES (from ServiceItem)
    // Just need to convert employee tags if they're IDs
    const employeesWithNames = employees.map(employee => ({
      ...employee,
      tags: Array.isArray(employee.tags) 
        ? (typeof employee.tags[0] === 'string' && isNaN(employee.tags[0])
            ? employee.tags  // Already names
            : convertMasterTagIdsToNames(employee.tags))  // Convert IDs to names
        : []
    }));

    console.log("=== Submitting to backend ===");
    console.log("Services:", JSON.stringify(services, null, 2));
    console.log("Employees with names:", JSON.stringify(employeesWithNames, null, 2));

    // Call onNext with the data (services already have tag names!)
    if(onNext) {
      onNext(services, employeesWithNames);
    }
  };

  if (isLoadingTags) {
    return (
      <div className="SalonRegistrationBoxPart1">
        <div className="title">
          <h1>Loading...</h1>
          <p>Fetching categories and tags from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="SalonRegistrationBoxPart1">
      <div className="title">
        <h1>Finish Registration</h1>
        <p>Add your services and team!</p>
      </div>

      <div className="tabs">
        <div className={`tab ${step === 1 ? "active" : ""}`} onClick={() => goToStep(1)}>
          Categories
        </div>
        <div className={`tab ${step === 2 ? "active" : ""}`} onClick={() => goToStep(2)}>
          Services
        </div>
        <div className={`tab ${step === 3 ? "active" : ""}`} onClick={() => goToStep(3)}>
          Employees
        </div>
      </div>

      <div className="formRegister">
        {step === 1 && (
          <>
            <h2 className="formTitle" style={{ fontWeight: 700, color: "#1b1b1b" }}>
              Select Business Categories
            </h2>
            <p style={{ color: "#666", marginBottom: "24px" }}>
              Choose the categories that best describe your salon's services
            </p>
            {tagsMessage && <p className="inlineWarning">{tagsMessage}</p>}

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {masterTags.map(m => {
                  const id= String(m.master_tag_id);
                  const active = selectedMasterIds.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleMaster(id)}
                      className={`tag-pill ${active ? "selected" : ""}`}
                      style={{ ...chipBase, ...(active ? chipSelected : {}) }}
                    >
                      <span style={{ fontWeight: 500, color: active ? "#fff" : "#4b4b4b" }}>
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="formButtons">
              <button type="button" className="backButton" onClick={() => onBack?.()} disabled={isLoading}>
                Back
              </button>
              <button
                type="button"
                className="nextButton"
                onClick={() => {
                  if (!selectedMasterIds.length) {
                    setTagsMessage("Please select at least one category before continuing.");
                    return;
                  }
                  setTagsMessage("");
                  setStep(2);
                }}
                disabled={isLoading}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="formTitle" style={{ fontWeight: 700, color: "#1b1b1b" }}>Business Services</h2>
            <p style={{ color: "#666", marginBottom: "16px" }}>
              Add services for the categories you selected: {selectedMasterIds.map(id => {
                const mt = masterTags.find(m => m.master_tag_id === id);
                return mt?.name;
              }).filter(Boolean).join(', ')}
            </p>
            {servicesMessage && <p className="inlineWarning">{servicesMessage}</p>}

            <div className="service-group">
              {services.map(service => (
                <ServiceItem
                  key={`${service.service_id}-${selectedMasterIds.join(",")}`}
                  accountType="owner"
                  service={service}
                  optionTags={tagOptions}
                  availableTags={tagOptions}
                  tagsOptions={tagOptions}
                  isEditing={editingServiceId === service.service_id}
                  onStartEdit={() => setEditingServiceId(service.service_id)}
                  onCancelEdit={() => setEditingServiceId(null)}
                  onSaveEdit={handleSaveEdit}
                  onDelete={() => setModalService(service)}
                />
              ))}

              {newService && (
                <ServiceItem
                  key={`new-${selectedMasterIds.join(",")}`}
                  accountType="owner"
                  service={newService}
                  optionTags={tagOptions}
                  availableTags={tagOptions}
                  tagsOptions={tagOptions}
                  newItem={true}
                  onCancelNew={() => {
                    setNewService(null);
                    setModalMessage({ title: "Canceled", content: "New service draft discarded." });
                  }}
                  onSaveEdit={handleAddService}
                  onDelete={() => {
                    setNewService(null);
                    setModalMessage({ title: "Canceled", content: "New service draft discarded." });
                  }}
                />
              )}
            </div>

            <button
              className="add-salon-item"
              onClick={() =>
                setNewService({
                  service_id: null,
                  name: "",
                  price: "",
                  description: "",
                  duration_minutes: "",
                  tags: [],
                  is_active: 1,
                })
              }
              disabled={!!newService || selectedMasterIds.length === 0}
              style={{ marginTop: 16 }}
              title={selectedMasterIds.length === 0 ? "Choose at least one category first" : undefined}
            >
              Add Service
            </button>

            <div className="formButtons">
              <button type="button" className="backButton" onClick={()=>setStep(1)} disabled={isLoading}>
                Back
              </button>
              <button
                type="button"
                className="nextButton"
                onClick={() => {
                  if (!services.length) {
                    setServicesMessage("Please add at least one service before continuing.");
                    return;
                  }
                  setServicesMessage("");
                  setStep(3);
                }}
                disabled={isLoading}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="formTitle" style={{ fontWeight: 700, color: "#1b1b1b" }}>Employees</h2>
            <p style={{ color: "#666", marginBottom: "16px" }}>
              Add team members with specialties in: {selectedMasterIds.map(id => {
                const mt = masterTags.find(m => m.master_tag_id === id);
                return mt?.name;
              }).filter(Boolean).join(', ')} (optional - you can add more later)
            </p>
            {employeesMessage && <p className="inlineWarning">{employeesMessage}</p>}

            <div className="service-group">
              {employees.map(employee => (
                <EmployeeItem
                  key={employee.employee_id}
                  accountType="owner"
                  employee={employee}
                  optionTags={employeeMasterTagOptions}
                  isEditing={editingEmployeeId === employee.employee_id}
                  onStartEdit={() => setEditingEmployeeId(employee.employee_id)}
                  onCancelEdit={() => setEditingEmployeeId(null)}
                  onSaveEdit={handleSaveEmployeeEdit}
                  onDelete={() => handleDeleteEmployee(employee)}
                />
              ))}

              {newEmployee && (
                <EmployeeItem
                  key="new-employee"
                  accountType="owner"
                  employee={newEmployee}
                  optionTags={employeeMasterTagOptions}
                  newItem={true}
                  onCancelNew={() => {
                    setNewEmployee(null);
                    setModalMessage({ title: "Canceled", content: "New employee draft discarded." });
                  }}
                  onSaveEdit={handleAddEmployee}
                  onDelete={() => {
                    setNewEmployee(null);
                    setModalMessage({ title: "Canceled", content: "New employee draft discarded." });
                  }}
                />
              )}
            </div>

            <button
              className="add-salon-item"
              onClick={() =>
                setNewEmployee({
                  employee_id: null,
                  first_name: "",
                  last_name: "",
                  description: "",
                  salary_value: "",
                  tags: [],
                })
              }
              disabled={!!newEmployee}
              style={{ marginTop: 16 }}
            >
              Add Employee
            </button>

            <div className="formButtons">
              <button type="button" className="backButton" onClick={() => setStep(2)} disabled={isLoading}>
                Back
              </button>
              <button type="button" className="nextButton" onClick={handleFinish} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Finish Registration'}
              </button>
            </div>
          </>
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
  );
}

export default SalonRegistrationPart2;