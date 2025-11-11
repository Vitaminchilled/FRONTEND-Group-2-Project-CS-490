import { useMemo, useState } from "react";
import "./SalonRegistrationPart1.css";

import ServiceItem from "../components/ServiceItem.jsx";
import EmployeeItem from "../components/EmployeeItem.jsx";
import { ModalServiceDelete, ModalMessage } from "../components/Modal.jsx";

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

  const masterTags = [
    { master_tag_id: "1", name: "Hair" },
    { master_tag_id: "2", name: "Nails" },
    { master_tag_id: "3", name: "Spa" },
    { master_tag_id: "4", name: "Barber" },
    { master_tag_id: "5", name: "Lash" },
    { master_tag_id: "6", name: "Brows" },
    { master_tag_id: "7", name: "Other" },
  ];

  const serviceTags = [
    { tag_id: "101", name: "Salon Haircut", master_tag_id: "1" },
    { tag_id: "102", name: "Blowout", master_tag_id: "1" },
    { tag_id: "103", name: "Color", master_tag_id: "1" },
    { tag_id: "201", name: "Manicure", master_tag_id: "2" },
    { tag_id: "202", name: "Gel Manicure", master_tag_id: "2" },
    { tag_id: "203", name: "Pedicure", master_tag_id: "2" },
    { tag_id: "301", name: "Facial", master_tag_id: "3" },
    { tag_id: "302", name: "Massage", master_tag_id: "3" },
    { tag_id: "401", name: "Clipper Cut", master_tag_id: "4" },
    { tag_id: "402", name: "Beard Trim", master_tag_id: "4" },
    { tag_id: "501", name: "Lash Lift", master_tag_id: "5" },
    { tag_id: "601", name: "Brow Shaping", master_tag_id: "6" },
    { tag_id: "701", name: "Consultation", master_tag_id: "7" },
  ];

  const [selectedMasterIds, setSelectedMasterIds] = useState(data.master_tag_ids?.map(String) || []);
  const [selectedTagIds, setSelectedTagIds] = useState(data.tags?.map(String) || []);
  const [tagsMessage, setTagsMessage] = useState("");

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

  const updateParent = (updates={}) => {
    if(updateData) {
      updateData({
        master_tag_ids: selectedMasterIds,
        tags: selectedTagIds,
        employees,
        services,
        ...updates,
      });
    }
  };

  const allowedTags = useMemo(() => {
    if(!selectedMasterIds.length) return [];
    return serviceTags.filter(t => selectedMasterIds.includes(String(t.master_tag_id)));
  }, [selectedMasterIds]);

  const tagOptions = useMemo(() => {
    return allowedTags.map(t => ({
      ...t,
      id: String(t.tag_id),
      tag_id: String(t.tag_id),
      value: String(t.tag_id),
      label: t.name,
      text: t.name,
    }));
  }, [allowedTags]);

  const validTagIds = useMemo(() => new Set(tagOptions.map(o => o.id)), [tagOptions]);

  const updateServices = (newServices) => {
    setServices(newServices);
    updateParent({ services: newServices });
  };

  const handleAddService = (serviceData) => {
    const clean = {
      ...serviceData,
      name: serviceData.name?.trim() || "",
      description: serviceData.description?.trim() || "",
      price: Number(serviceData.price) || 0,
      duration_minutes: parseInt(serviceData.duration_minutes) || 0,
      tags: (serviceData.tags || []).map(String).filter(t => validTagIds.has(t)),
      service_id: crypto.randomUUID?.() || `tmp_${Date.now()}`,
      is_active: 1,
    };
    updateServices([...services, clean]);
    setNewService(null);
    setModalMessage({ title: "Saved", content: "Service added to your draft." });
    setServicesMessage("");
  };

  const handleSaveEdit = (updated) => {
    const clean = {
      ...updated,
      name: updated.name?.trim() || "",
      description: updated.description?.trim() || "",
      price: Number(updated.price) || 0,
      duration_minutes: parseInt(updated.duration_minutes) || 0,
      tags: (updated.tags || []).map(String).filter(t => validTagIds.has(t)),
    };
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
    const clean = {
      ...employeeData,
      first_name: employeeData.first_name?.trim() || "",
      last_name: employeeData.last_name?.trim() || "",
      description: employeeData.description?.trim() || "",
      salary_value: Number(employeeData.salary_value) || 0,
      tags: employeeData.tags || [],
      employee_id: crypto.randomUUID?.() || `emp_${Date.now()}`,
    };
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
      tags: updated.tags || [],
    };
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
      
      if(has) {
        setSelectedTagIds(prevTags => {
          const tagsToRemove = serviceTags
            .filter(t => String(t.master_tag_id) === strId)
            .map(t => String(t.tag_id));
          return prevTags.filter(tid => !tagsToRemove.includes(tid));
        });
      }
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
    updateParent();
    if(onNext) onNext();
  };

  return (
    <div className="SalonRegistrationBoxPart1">
      <div className="title">
        <h1>Register Salon</h1>
        <p>Let us take care of booking!</p>
      </div>

      <div className="tabs">
        <div className={`tab ${step === 1 ? "active" : ""}`} onClick={()=> goToStep(1)}>
          Tags
        </div>
        <div className={`tab ${step===2 ? "active" : ""}`} onClick={() => goToStep(2)}>
          Services
        </div>
        <div className={`tab ${step === 3 ? "active" : ""}`} onClick={() => goToStep(3)}>
          Employees
        </div>
      </div>

      <div className="formRegister">
        {step === 1 && (
          <>
            <h2 className="formTitle" style={{ fontWeight: 700, color: "#1b1b1b" }}>Business Tags</h2>
            {tagsMessage && <p className="inlineWarning">{tagsMessage}</p>}

            <div style={{ marginBottom: 30 }}>
              <p style={{ marginBottom: 8, fontSize: 15, fontWeight: 600 }}>Categories (select at least one):</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
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
            {employeesMessage && <p className="inlineWarning">{employeesMessage}</p>}

            <div className="service-group">
              {employees.map(employee => (
                <EmployeeItem
                  key={employee.employee_id}
                  accountType="owner"
                  employee={employee}
                  optionTags={masterTags}
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
                  optionTags={masterTags}
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
                Finish
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