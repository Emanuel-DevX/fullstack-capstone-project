import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { urlConfig } from "../../config";
import { useAppContext } from "../../context/AuthContext";

const Profile = () => {
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [updatedDetails, setUpdatedDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const { setUserName } = useAppContext();
  const [changed, setChanged] = useState("");

  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const authtoken = sessionStorage.getItem("auth-token");
    if (!authtoken) {
      navigate("/app/login");
    } else {
      fetchUserProfile();
    }
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const authtoken = sessionStorage.getItem("auth-token");
      const email = sessionStorage.getItem("email");
      const firstName = sessionStorage.getItem("firstName");
      const lastName = sessionStorage.getItem("lastName");
      const name = firstName && lastName ? `${firstName} ${lastName}` : null;
      if (name || authtoken) {
        const storedUserDetails = {
          firstName: sessionStorage.getItem("firstName"),
          lastName: sessionStorage.getItem("lastName"),
          email: email,
        };

        setUserDetails(storedUserDetails);
        setUpdatedDetails(storedUserDetails);
      }
    } catch (error) {
      console.error(error);
      // Handle error case
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleInputChange = (e) => {
    setUpdatedDetails({
      ...updatedDetails,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const authtoken = sessionStorage.getItem("auth-token");
      const email = sessionStorage.getItem("email");

      if (!authtoken || !email) {
        navigate("/app/login");
        return;
      }

      const payload = { ...updatedDetails };
      const response = await fetch(`${urlConfig.backendUrl}/api/auth/update`, {
        // Task 1: set method
        method: "PUT",

        // Task 2: set headers
        headers: {
          Authorization: `Bearer ${authtoken}`,
          "Content-Type": "application/json",
          Email: email,
        },

        // Task 3: set body
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Update the user details in session storage
        // Task 4: set the new name in the AppContext
        const fullName = `${updatedDetails.firstName} ${updatedDetails.lastName}`;

        setUserName(fullName);

        // Task 5: set user name in the session
        sessionStorage.setItem("name", fullName);
        sessionStorage.setItem("firstName", updatedDetails.firstName);
        sessionStorage.setItem("lastName", updatedDetails.lastName);
        setUserDetails(updatedDetails);
        setEditMode(false);
        // Display success message to the user
        setChanged("Name Changed Successfully!");
        setTimeout(() => {
          setChanged("");
          navigate("/");
        }, 1000);
      } else {
        // Handle error case
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      // Handle error case
    }
  };

  return (
    <div className="profile-container">
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={userDetails.email}
              disabled // Disable the email field
            />
          </label>
          <label>
            First Name
            <input
              type="text"
              name="firstName"
              value={updatedDetails.firstName}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Last Name
            <input
              type="text"
              name="lastName"
              value={updatedDetails.lastName}
              onChange={handleInputChange}
            />
          </label>

          <button type="submit">Save</button>
        </form>
      ) : (
        <div className="profile-details">
          <h1>
            Hi, {userDetails.firstName} {userDetails.lastName}
          </h1>
          <p>
            {" "}
            <b>Email:</b> {userDetails.email}
          </p>
          <button onClick={handleEdit}>Edit</button>
          <span
            style={{
              color: "green",
              height: ".5cm",
              display: "block",
              fontStyle: "italic",
              fontSize: "12px",
            }}
          >
            {changed}
          </span>
        </div>
      )}
    </div>
  );
};

export default Profile;
