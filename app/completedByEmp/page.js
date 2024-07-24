'use client'


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import NavSideEmp from '../components/NavSideEmp';
import * as XLSX from 'xlsx';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';

const saveAs = (data, fileName) => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  const url = window.URL.createObjectURL(data);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};


const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


const CompletedTaskList = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null); // State to manage the task to be viewed
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [authenticated, setAuthenticated] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(15); // Number of tasks per page
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null); // State variable for error message


  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * tasksPerPage + 1;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
  };

  const handleDateSearch = async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    if (end < start) {
      setError('End date cannot be earlier than start date.');
      setCompletedTasks([]); // Clear tasks if dates are invalid
      return;
    } else {
      setError(''); // Clear error if dates are valid
    }
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/completedByEmp', {
        headers: {
          Authorization: token,
        },
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      });
  
      if (response.status === 200) {
        if (Array.isArray(response.data.completedTasks)) {
          const completedTasksWithAssigneeNames = await Promise.all(
            response.data.completedTasks.map(async (task) => {
              try {
                const assigneeResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
                  headers: {
                    Authorization: localStorage.getItem('authToken'),
                  },
                });
                const assigneeName = assigneeResponse.data.name;
                return { ...task, assignTo: assigneeName };
              } catch (error) {
                console.error('Error fetching assignee name:', error);
                return { ...task, assignTo: 'Unknown' };
              }
            })
          );
  
          setCompletedTasks(completedTasksWithAssigneeNames);
          setLoading(false);
        } else {
          console.error('API response is not an array:', response.data);
        }
      } else {
        console.error('Failed to fetch tasks. Status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.data);
        setError(error.response.data.error || 'Failed to fetch tasks. Please try again later.');
      } else if (error.request) {
        console.error('No response received from server:', error.request);
        setError('No response received from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setError('An error occurred while setting up the request. Please try again later.');
      }
      setCompletedTasks([]); // Clear tasks on error
    }
  };

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };


  const router = useRouter()

  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => {
            setError(null);
        }, 2000);
        return () => clearTimeout(timer);
    }
}, [error]);

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
    if (userRole !== 'sub-employee') {
      // If the user is not a superadmin, redirect to the login page
      router.push('/forbidden');
      return;
    }


    const fetchCompletedTasks = async () => {
      try {
        const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/completedByEmp', {
          headers: {
            Authorization: localStorage.getItem('authToken'), // Include your JWT token here
          },
        });

        const completedTasksWithAssigneeNames = await Promise.all(
          response.data.completedTasks.map(async (task) => {
            const assigneeResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
              headers: {
                Authorization: localStorage.getItem('authToken'),
              },
            });
            const assigneeName = assigneeResponse.data.name;
            return { ...task, assignTo: assigneeName };
          })
        );
        console.log(completedTasksWithAssigneeNames)
        setCompletedTasks(completedTasksWithAssigneeNames);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching completed tasks:', error);
        setLoading(false);
      }
    };

    fetchCompletedTasks();
  }, []);

  // Function to open the view modal for a task
  const openViewModal = (task) => {
    setViewTask(task); // Set the task to be viewed
  };



  // Function to close the view modal
  const closeViewModal = () => {
    setIsViewModalOpen(false); // Clear the task to close the modal
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;

  const filteredTasks = completedTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Function to handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const exportToExcel = async () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';


    // Filter and map the data including the header fields and employee names
    const tasksToExport = filteredTasks.map(task => {
      return {
        'Title': task.title,
        'Status': task.status,
        'StartDate': task.startDate,
        'DeadLine': task.deadlineDate,
        'AssignTo': task.assignTo, // Assign the name if available, otherwise use the ID
      };
    });

    // Create a worksheet from the filtered task data
    const ws = XLSX.utils.json_to_sheet(tasksToExport);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };

    // Convert the workbook to an array buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Create a Blob from the array buffer
    const data = new Blob([excelBuffer], { type: fileType });

    // Set the filename and save the file using saveAs function
    const fileName = 'Completed Task_list' + fileExtension;
    saveAs(data, fileName);
  };

  if (!authenticated) {
    // If the user is not authenticated, render nothing (or a message) and redirect to login
    return null;
  }

  const handleViewClick = async (taskId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://103.159.85.246:4000/api/task/${taskId}`, {
        headers: {
          Authorization: token,
        },
      });


      if (response.status === 200) {
        const taskData = response.data;

        setViewTask(taskData);
        setIsViewModalOpen(true)
      } else {
        console.error('Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <NavSideEmp />
      <div className="m-5 pl-5 md:pl-72 mt-20">
        <h1 className="text-2xl font-semibold mb-4 text-orange-500">Completed Task List</h1>
        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
        {/* <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by Task Title..."
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/3"
          />
        </div> */}
         <div className="flex flex-col md:flex-row md:items-center mb-4">
                <label htmlFor="startDate" className="flex flex-col ml-2 text-orange-800 font-semibold">Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
           className="px-3 py-0.5 border border-gray-300 rounded-md mb-2 md:mb-0 md:mr-2 ml-1 text-sm"
          />
        <label htmlFor="endDate" className="flex flex-col ml-2 text-orange-800 font-semibold">
            End Date:
          </label>
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            className="px-3 py-0.5 border border-gray-300 rounded-md mb-2 md:mb-0 md:mr-2 ml-1 text-sm"
          />
          <button
            onClick={handleDateSearch}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md ml-3 text-sm"
          >
            Search
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search ..."
            className="px-1 py-1 border border-gray-400 rounded-full w-auto md:w-72 mb-2 md:mb-0 md:mr-2 ml-5"
          />
         
        </div>
        <div className="relative mb-7 md:mb-10">
          <button
            className="bg-green-700 text-white font-extrabold py-1 md:py-1.5 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-12 top-0 right-0 text-sm md:text-sm flex items-center mr-1" // Positioning
            onClick={() => exportToExcel(filteredTasks)}                    >
            <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-1 font-bold" />
            <span className="font-bold">Export</span>
          </button>
        </div>

        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
            <FontAwesomeIcon
              icon={faSpinner} // Use your FontAwesome spinner icon
              spin // Add the "spin" prop to make the icon spin
              className="text-white text-4xl" // You can customize the size and color
            />
          </div>
        ) : (
          <div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className='bg-green-500 text-white'>
                  <tr>
                    <th className="px-4 py-2">Sr.No.</th>
                    <th className="px-4 py-2">Task</th>
                    <th className="px-4 py-2">Status</th>
                    {/* <th className="px-4 py-2">Description</th> */}
                    <th className="px-4 py-2">StartDate</th>
                    <th className="px-4 py-2">EndDate</th>
                    <th className="px-4 py-2">Assigned To</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTasks.length > 0 ? (
                    currentTasks.map((task, index) => (
                      <tr key={task._id} className='cursor-pointer hover:bg-gray-100 text-sm'>
                        <td className="border border-green-500 px-4 py-1.5 text-center">{calculateSerialNumber(index)}</td>
                        <td className="border border-green-500  px-4 py-1.5">
                          <div>
                            <h2 className="border-green-500  font-medium text-blue-800 text-left">{task.title}</h2>
                          </div>
                        </td>
                        {/* <td className="border px-4 py-1.5 text-left border-green-500 ">{task.description}</td> */}
                        <td className="border px-4 py-1.5 text-center border-green-500 ">
                          <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-sm font-semibold">
                            Completed
                          </span>
                        </td>
                        <td className="border px-4 py-1.5 text-center border-green-500 ">{formatDate(task.startDate)}</td>
                        <td className="border px-4 py-1.5 text-center border-green-500 ">{formatDate(task.deadlineDate)}</td>
                        <td className="border px-4 py-1.5 text-center border-green-500 ">{task.assignTo}</td>

                        <td className="border px-4 py-1.5 text-center border-green-500 ">
                          <div className="flex items-center mx-5">
                            <FontAwesomeIcon
                              icon={faEye}
                              className="text-blue-500 hover:underline cursor-pointer text-lg"
                              // onClick={() => openViewModal(task)} // Open view modal when clicked
                              onClick={() => handleViewClick(task._id)}

                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
                        No Completed Tasks Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
        <ul className="flex justify-center items-center mt-4">
          {Array.from({ length: Math.ceil(filteredTasks.length / tasksPerPage) }, (_, index) => (
            <li key={index} className="px-3 py-2">
              <button
                onClick={() => paginate(index + 1)}
                className={`${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  } px-4 py-2 rounded`}
              >
                {index + 1}
              </button>
            </li>
          )
          )}
        </ul>

      </div>


      {/* View Task Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
          <div className="modal-container  bg-white sm:p-6 w-72 md:w-96 rounded-md">
            <div className='p-2 text-center text-sm md:text-base'>
              <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
              {/* <p className="mb-2 text-left justify-center">
                <strong>AssignTo:</strong> {viewTask.assignTo}
              </p> */}

              <p className="mb-2 text-left justify-center">
                <strong>Title:</strong> {viewTask.title}
              </p>
              
              {viewTask.assignedBy ? (
                <p className="mb-2 text-left justify-center">
                  <strong>Assigned By :</strong>{' '}
                  {viewTask.assignedBy.name}
                </p>
              ) : viewTask.assignedByEmp ? (
                <p className="mb-2 text-left justify-center">
                  <strong>Assigned By :</strong>{' '}
                  {viewTask.assignedByEmp.name}
                </p>
              ) : (
                <p className="mb-1 text-left justify-center">
                  <strong>Assigned By:</strong> Self
                </p>
              )}

              <p className="mb-2 text-left justify-center">
                <strong>Description:</strong> {viewTask.description}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Status:</strong> {viewTask.status}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Date: </strong>{new Date(viewTask.startDate).toLocaleDateString('en-GB')}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Start Time:</strong> {viewTask.startTime}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>DeadLine:</strong> {new Date(viewTask.deadlineDate).toLocaleDateString('en-GB')}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>End Time:</strong> {viewTask.endTime}
              </p>

              <p className="mb-2 text-left justify-center">
                <strong>Picture:</strong>{" "}
                {viewTask.picture ? (
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                    onClick={() => handlePicturePreview(viewTask.picture)}
                  >
                    Preview
                  </button>
                ) : (
                  "Not Added"
                )}
              </p>

              <p className="mb-2 text-left flex items-center">
                {/* <strong>Audio:</strong>{" "} */}
                <span className='mr-1 '><strong>Audio:</strong></span>{" "}
                {viewTask.audio ? (
                  <audio controls className='w=64 h-8 md:w-96 md:h-10 text-lg'>
                    <source src={`http://103.159.85.246:4000/${viewTask.audio}`} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>

                ) : (
                  "Not Added"
                )}
              </p>

              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-container bg-white w-64 md:w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
            <div className="p-5 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
              <Image
                src={completeImageUrl}
                alt="Preview"
                width={400} // Adjust the width as needed
                height={300} // Adjust the height as needed
              />
              <button
                type="button"
                className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2 text-sm md:text-base"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompletedTaskList;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye } from '@fortawesome/free-solid-svg-icons';



// const CompletedTaskList = () => {
//   const [completedTasks, setCompletedTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingTask, setEditingTask] = useState(null);

//   useEffect(() => {
//     const fetchCompletedTasks = async () => {
//       try {
//         const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/completedByEmp', {
//           headers: {
//             Authorization: localStorage.getItem('authToken'), // Include your JWT token here
//           },
//         });

//         const completedTasksWithAssigneeNames = await Promise.all(
//           response.data.completedTasks.map(async (task) => {
//             const assigneeResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
//               headers: {
//                 Authorization: localStorage.getItem('authToken'),
//               },
//             });
//             const assigneeName = assigneeResponse.data.name;
//             return { ...task, assignTo: assigneeName };
//           })
//         );

//         setCompletedTasks(completedTasksWithAssigneeNames);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching completed tasks:', error);
//         setLoading(false);
//       }
//     };

//     fetchCompletedTasks();
//   }, []);

//   return (
//     <>
//       <Navbar />
//       <Sidebar />
//       <div className="container mx-auto mt-20 m-10 pl-64">
//         <h1 className="text-2xl font-semibold mb-4">Completed Task List</h1>
//         {loading ? (
//           <p className="text-gray-600">Loading completed tasks...</p>
//         ) : (
//           <div>
//             {completedTasks.length === 0 ? (
//               <p className="text-gray-600">No completed tasks found.</p>
//             ) : (
//               <table className="min-w-full table-auto">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-2">Sr. No.</th>
//                     <th className="px-4 py-2">Task</th>
//                     <th className="px-4 py-2">Description</th>
//                     <th className="px-4 py-2">Assigned To</th>
//                     <th className="px-4 py-2">Status</th>
//                     <th className="px-4 py-2 text-left">Actions</th>


//                   </tr>
//                 </thead>
//                 <tbody>
//                   {completedTasks.map((task, index) => (
//                     <tr key={task._id}>
//                       <td className="border px-4 py-2 text-center">{index + 1}</td>

//                       <td className="border px-4 py-2">
//                         {editingTask === task ? (
//                           <div>
//                             {/* Edit form */}
//                             <input
//                               type="text"
//                               value={editingTask.title}
//                               onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
//                             />
//                             <button onClick={() => saveEditedTask(editingTask)}>Save</button>
//                             <button onClick={cancelEditingTask}>Cancel</button>
//                           </div>
//                         ) : (
//                           <div>
//                             <h2 className=" text-base font-medium text-blue-800 text-center">{task.title}</h2>
//                           </div>
//                         )}
//                       </td>
//                       <td className="border px-4 py-2 text-center">{task.description}</td>
//                       <td className="border px-4 py-2 text-center">{task.assignTo}</td>
//                       <td className="border px-4 py-2 text-center">
//                         <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
//                           Completed
//                         </span>
//                       </td>
//                       <td className="border px-4 py-2 text-center">

//                         <div className="flex items-center">
//                           <FontAwesomeIcon
//                             icon={faEye}
//                             className="text-blue-500 hover:underline cursor-pointer mx-2"
//                             onClick={() => openViewModal(task)} // Open view modal when clicked
//                           />
//                         </div>

//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };




// export default CompletedTaskList;