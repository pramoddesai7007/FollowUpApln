

'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import NavSide from '../components/NavSide';
import { useRouter } from 'next/navigation';
import jwtDecode from 'jwt-decode';

// Helper function to add hours and minutes to a given date string
const addHoursAndMinutes = (dateString, hoursToAdd, minutesToAdd) => {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hoursToAdd);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  return date;
};

// Function to format date to DD/MM/YYYY format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};


// Function to format time to HH:MM AM/PM format
const formatTime = (dateString) => {
  const date = new Date(dateString);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)
  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  return formattedTime;
};

const itemsPerPage = 15;


// Function to format date to YYYY-MM-DDTHH:MM format for datetime-local input
const formatDateTimeLocal = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};



const EditModal = ({ isOpen, onClose, record, onSave }) => {
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');

  useEffect(() => {
    if (record) {
      setClockIn(record.clockIn ? formatDateTimeLocal(record.clockIn) : '');
      setClockOut(record.clockOut ? formatDateTimeLocal(record.clockOut) : '');
    }
  }, [record]);

  const handleSave = async () => {
    try {
      const updatedRecord = {
        ...record,
        clockIn: new Date(clockIn).toISOString(),
        clockOut: new Date(clockOut).toISOString(),
      };

      await onSave(updatedRecord);
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Clock Times</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Clock In:</label>
          <input
            type="datetime-local"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Clock Out:</label>
          <input
            type="datetime-local"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};




const TimeCard = () => {
  const currentDate = new Date().toISOString().slice(0, 10);

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // If the user is not authenticated, redirect to the login page
            setAuthenticated(false);
            router.push('/login');
            return;
        }

        const decodedToken = jwtDecode(token);
        console.log(decodedToken)
        const userRole = decodedToken.role || 'guest';

        // Check if the user has the superadmin role
        if (userRole !== 'admin') {
            // If the user is not a superadmin, redirect to the login page
            router.push('/forbidden');
            return;
        }
    }, []);




  useEffect(() => {
    const fetchEmployeeNames = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://103.159.85.246:4000/api/employee/subemployees/list', {
          headers: {
            Authorization: token,
          },
        });
        const names = response.data.map(employee => employee.name);
        setEmployeeNames(names);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeNames();
  }, []);

  // Function to fetch salaries based on selected criteria
  const handleFetchSalaries = async () => {
    setError('');
    if (!selectedEmployee || !startDate || !endDate) {
      setError('Employee, Start Date, and End Date are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken'); // Get the token from local storage

      const response = await axios.get('http://103.159.85.246:4000/api/salary/salary', {
        params: { name: selectedEmployee, startDate, endDate },
        headers: {
          Authorization: token,
        },
      });
      setSalaries(response.data);
    } catch (err) {
      setError('Error fetching salaries');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Function to get salaries for the current page
  const getSalariesForCurrentPage = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const salariesToDisplay = salaries.slice(startIndex, endIndex);

    if (salariesToDisplay.length === 0 && salaries.length > 0) {
      return salaries.slice(0, itemsPerPage);
    }

    return salariesToDisplay;
  };

  let serialNumber = 1 + (currentPage - 1) * itemsPerPage;

  // Function to calculate adjusted time ahead by 5.30 hours
  const calculateAdjustedTime = (clockInTime) => {
    const adjustedTime = addHoursAndMinutes(clockInTime, 5, 30);
    return formatTime(adjustedTime);
  };

  const handleEditClick = (record) => {
    setCurrentRecord(record);
    setModalOpen(true);
  };

  // const handleSaveChanges = async (updatedRecord) => {
  //   console.log(updatedRecord)
  //   try {
  //     const token = localStorage.getItem('authToken');
  //     const response = await axios.put(
  //       `http://103.159.85.246:4000/api/salary/salary/${updatedRecord._id}`, // Pass _id in the URL
  //       {
  //         clockIn: new Date(updatedRecord.clockIn), // Ensure clockIn is a Date object
  //         clockOut: new Date(updatedRecord.clockOut), // Ensure clockOut is a Date object
  //       },
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       }
  //     );

  //     console.log(response.data); // Log the response data

  //     // Update the salaries state to reflect changes
  //     setSalaries(prevSalaries =>
  //       prevSalaries.map(salary =>
  //         salary._id === updatedRecord._id ? response.data : salary
  //       )
  //     );

  //     setModalOpen(false); // Close the modal after successful save
  //   } catch (err) {
  //     console.error('Error updating record:', err);
  //   }
  // };



  const handleSaveChanges = async (updatedRecord) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `http://103.159.85.246:4000/api/salary/salary/${updatedRecord._id}`,
        {
          clockIn: updatedRecord.clockIn,
          clockOut: updatedRecord.clockOut,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // Update the salaries state with the response data
      setSalaries(prevSalaries =>
        prevSalaries.map(salary =>
          salary._id === updatedRecord._id ? response.data : salary
        )
      );

      setModalOpen(false); // Close the modal after successful save
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDeleteClick = async (recordId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://103.159.85.246:4000/api/salary/salary/${recordId}`, {
        headers: {
          Authorization: token,
        },
      });

      // Update the salaries state to reflect the deleted record
      setSalaries((prevSalaries) =>
        prevSalaries.map((salary) => ({
          ...salary,
          clockRecords: salary.clockRecords.filter((record) => record._id !== recordId),
        }))
      );
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };


  const calculateTotalDuration = () => {
    return salaries.reduce((total, salary) => {
      return total + salary.clockRecords.reduce((subTotal, record) => {
        return subTotal + (record.workDuration || 0);
      }, 0);
    }, 0).toFixed(2);
  };

  return (
    <>
      <NavSide />
      <div className="m-5 pl-0 md:pl-64 mt-20 font-sans">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Time Card</h1>
        <div className="flex justify-center items-center mb-4 space-x-2">
          <div className="overflow-x-auto">
            <div className="flex items-center space-x-2 rounded">
              <label htmlFor="employeeSelect" className="text-sm font-medium text-gray-700">
                Select Employee :
              </label>
              <select
                id="employeeSelect"
                name="employeeSelect"
                className="block w-44 px-3 py-1 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-gray-400 sm:text-sm cursor-pointer"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select an employee</option>
                {employeeNames.map((employeeName, index) => (
                  <option key={index} value={employeeName}>
                    {employeeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col -mt-5">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date:</label>
            <input
              id="startDate"
              type="date"
              className="px-3 py-1 border border-gray-400 rounded w-full md:w-40 text-sm cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col -mt-5">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date:</label>
            <input
              id="endDate"
              type="date"
              className="px-3 py-1 border border-gray-400 rounded w-full md:w-40 text-sm cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={handleFetchSalaries}
            className="px-3 py-1 border border-gray-400 rounded w-full md:w-40 bg-orange-500 text-white"
          >
            Details
          </button>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
            <FontAwesomeIcon icon={faSpinner} spin className="text-white text-4xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className='bg-orange-500 text-white text-sm' >
                <tr>
                  <th className="px-4 py-1.5 text-center">Sr.No.</th>
                  <th className="px-4 py-1.5 text-center">In Date</th>
                  <th className="px-4 py-1.5 text-center">In Time</th>
                  <th className="px-4 py-1.5 text-center">Out Date</th>
                  <th className="px-4 py-1.5 text-center">Out Time</th>
                  <th className="px-4 py-1.5 text-center">Duration</th>
                  <th className="px-4 py-1.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSalariesForCurrentPage().map((salary) =>
                  salary.clockRecords.map((record) => (
                    <tr key={serialNumber} className='cursor-pointer text-sm hover:bg-gray-300'>
                      <td className="px-4 py-1 text-center">{serialNumber++}</td>
                      <td className="px-4 py-1 text-center">{formatDate(record.clockIn)}</td>
                      <td className="px-4 py-1 text-center">{calculateAdjustedTime(record.clockIn)}</td>
                      <td className="px-4 py-1 text-center">{record.clockOut ? formatDate(record.clockOut) : '-'}</td>
                      <td className="px-4 py-1 text-center">{record.clockOut ? calculateAdjustedTime(record.clockOut) : '-'}</td>
                      <td className="px-4 py-1 text-center">{record.workDuration ? `${record.workDuration.toFixed(2)} hours` : '-'}</td>
                      <td className="px-4 py-1 text-center">
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="text-orange-500 hover:underline cursor-pointer ml-3"
                          onClick={() => handleEditClick(record)}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="text-red-500 hover:underline cursor-pointer ml-5"
                          onClick={() => handleDeleteClick(record._id)} // Call deleteRecord with the record ID

                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan="5" className="text-right font-bold px-4 py-1">Total Duration:</td>
                  <td className="text-center font-bold px-4 py-1">{calculateTotalDuration()} hours</td>
                </tr>
              </tfoot>
            </table>
            <div className="flex justify-center mt-4">
              {Array.from({ length: Math.ceil(salaries.length / itemsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-1 mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {modalOpen && (
        <EditModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          record={currentRecord}
          onSave={handleSaveChanges}
        />
      )}
    </>
  );
};

export default TimeCard;
