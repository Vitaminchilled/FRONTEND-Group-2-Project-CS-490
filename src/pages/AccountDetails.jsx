import './AccountDetails.css'
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Pencil, Save } from "lucide-react";

function AccountDetails() {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/userDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.user_id }),
        });

        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const result = await response.json();
        setUserDetails(result);
        setEditedDetails(result);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchUserDetails();
  }, [user.user_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = async () => {
  if (isEditing) {
    console.log("Saving changes:", editedDetails);
    const success = await saveDetails();

    if (success) {
      window.location.reload();
    }
  }
  setIsEditing(!isEditing);
};

const saveDetails = async () => {
  try {
    const response = await fetch("/api/updateUserDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedDetails),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.field_errors) {
        let msg = "Please correct the following:\n\n";

        for (const field in data.field_errors) {
          data.field_errors[field].forEach((err) => {
            msg += `• ${field}: ${err}\n`;
          });
        }

        window.alert(msg);
      } else {
        window.alert(data.error || "Something went wrong.");
      }

      setEditedDetails(userDetails); 

      return false;
    }
    return true;

  } catch (error) {
    console.error(error.message);
    window.alert("An unexpected error occurred.");
    setEditedDetails(userDetails);

    return false;
  }
};

  return (
    <div className="AccountDetails">
      <h1>Details</h1>
      <hr />

      <h3><u>Personal Information</u></h3>
      <button className="EditButton" onClick={toggleEdit}>
        {isEditing ? <Save size={20} /> : <Pencil size={20} />}
      </button>
      <div className="DetailGroup">
        <div className="Detail">
          <h1>Name</h1>
          {isEditing ? (
            <input
              type="text"
              name="full_name"
              value={
                editedDetails.full_name ||
                `${editedDetails.first_name || ""} ${editedDetails.last_name || ""}`.trim()
              }
              onChange={(e) =>
                setEditedDetails((prev) => ({ ...prev, full_name: e.target.value }))
              }
            />
          ) : (
            <h2>{userDetails.first_name} {userDetails.last_name}</h2>
          )}
        </div>

        <div className="Detail">
          <h1>Personal Email</h1>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editedDetails.email || ""}
              onChange={handleChange}
            />
          ) : (
            <h2>{userDetails.email}</h2>
          )}
        </div>

        <div className="Detail">
          <h1>Birth Year</h1>
          <h2>{userDetails.birth_year}</h2>
        </div>

        <div className="Detail">
          <h1>Username</h1>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={editedDetails.username || ""}
              onChange={handleChange}
            />
          ) : (
            <h2>{userDetails.username}</h2>
          )}
        </div>

        <div className="Detail">
          <h1>Phone Number</h1>
          {isEditing ? (
            <input
              type="text"
              name="phone_number"
              value={editedDetails.phone_number || ""}
              onChange={handleChange}
            />
          ) : (
            <h2>
              {userDetails.phone_number
                ? `(${userDetails.phone_number.slice(0, 3)}) ${userDetails.phone_number.slice(3, 6)}-${userDetails.phone_number.slice(6)}`
                : ""}
            </h2>
          )}
        </div>

        <div className="Detail">
          <h1>Account Type</h1>
          <h2>{userDetails.role}</h2>
        </div>
      </div>
    </div>
  );
}

export default AccountDetails;
