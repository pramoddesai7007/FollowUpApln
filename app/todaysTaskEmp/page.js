'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavSide from '../components/NavSide';
import NavSideEmp from '../components/NavSideEmp';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';




const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};



const TodaysTask = () => {
    const [todaysTasks, setTodaysTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);
    const [completePictureUrl, setPreviewPictureUrl] = useState('');
    const [completeImageUrl, setPreviewImageUrl] = useState('');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    useEffect(() => {
        const fetchTodaysTasks = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/todayEmp', {
                    headers: {
                        Authorization: token,
                    },
                });

                // Function to fetch the user's name based on their ID
                const fetchUserName = async (assignTo) => {
                    try {
                        const token = localStorage.getItem('authToken');
                        const userResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${assignTo}`, {
                            headers: {
                                Authorization: token,
                            },
                        });
                        return userResponse.data.name; // Replace 'name' with the actual field containing the user's name.
                    } catch (error) {
                        console.error(`Error fetching user name for user ID ${assignTo}:`, error);
                        return 'Unknown User'; // Default value or error handling as needed.
                    }
                };

                // Update the 'assignTo' field with the user's name
                const tasksWithUserName = await Promise.all(
                    response.data.todayAddedTasks.map(async (task) => {
                        const userName = await fetchUserName(task.assignTo);
                        return { ...task, assignTo: userName };
                    })
                );

                setTodaysTasks(tasksWithUserName);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching today\'s tasks:', error);
                setLoading(false);
            }
        };

        fetchTodaysTasks();
    }, []);

    const handleViewTask = (task) => {
        setSelectedTask(task);
        setViewModalOpen(true);
    };

    const handleCancelView = () => {
        setViewModalOpen(false);
        setSelectedTask(null);
    };

    const closeViewModal = () => {
        setSelectedTask(null);
        setViewModalOpen(false);
    };

    const handleImagePreview = (imageUrl) => {
        console.log(imageUrl)
        const completePictureUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
        console.log(completePictureUrl)
        setPreviewPictureUrl(completePictureUrl);
        setIsImagePreviewModalOpen(true);
    };

    const handlePicturePreview = (imageUrl) => {
        console.log(imageUrl)
        const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
        console.log(completeImageUrl)
        setPreviewImageUrl(completeImageUrl);
        setIsPreviewModalOpen(true);
    };
    return (
        <>
            <NavSideEmp />

            <div className="container mx-auto mt-20 m-10 pl-64">
                <h1 className="text-xl font-semibold mb-4 text-orange-500">Today&rsquo;s added Tasks</h1>
                {loading ? (
                    <p className="text-gray-600">Loading today&rsquo;s tasks...</p>
                ) : (
                    <div>

                        <table className="min-w-full table-auto">
                            <thead className='bg-orange-400 text-white'>
                                <tr>
                                    <th className="px-4 py-2">SR No.</th>
                                    <th className="px-4 py-2">Task</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">StartDate</th>
                                    <th className="px-4 py-2">DeadLine</th>
                                    <th className="px-4 py-2">Assigned To</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todaysTasks.length > 0 ? (
                                    todaysTasks.map((task, index) => (
                                        <tr key={task._id} className='text-sm hover-bg-gray-100 cursor-pointer'>
                                            <td className="border px-4 py-1.5 text-center">{index + 1}</td>
                                            <td className="border px-4 py-1.5">
                                                <h2 className="font-medium text-blue-800 text-center">{task.title}</h2>
                                            </td>
                                            <td className="border px-4 py-1.5 text-center">
                                                <span className={`rounded-full font-bold px-5 py-1 ${task.status === 'completed' ? 'text-green-800 bg-green-200' :
                                                    task.status === 'overdue' ? 'text-red-800 bg-red-200' :
                                                        task.status === 'pending' ? 'text-blue-800 bg-blue-200' :
                                                            ''
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="border px-4 py-1.5 text-center">{formatDate(task.startDate)}</td>
                                            <td className="border px-4 py-1.5 text-center">{formatDate(task.deadlineDate)}</td>
                                            <td className="border px-4 py-1.5 text-center">{task.assignTo}</td>
                                            <td className="border px-4 py-1.5 text-center">
                                                <FontAwesomeIcon
                                                    icon={faEye}
                                                    className="text-blue-500 hover:underline mr-3 cursor-pointer pl-2"
                                                    onClick={() => handleViewTask(task)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
                                            No Task Added Today.
                                        </td>
                                    </tr>
                                )
                                }
                            </tbody>
                        </table>

                    </div>
                )}
            </div>




            {viewModalOpen && selectedTask && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-700">
                    <div className="modal-container bg-white w-72 md:w-96 p-3 text-sm md:text-base rounded-md mt-16 md:mt-10">
                        <div className='p-2 text-center'>
                            <h2 className="text-xl font-semibold mb-5 text-center">View Task</h2>

                            <p className="mb-2 text-left justify-center">
                                <strong>Title:</strong> {selectedTask.title}
                            </p>
                            <p className='mb-2 text-left justify-center'><strong>Description:</strong> {selectedTask.description}</p>
                            <p className='mb-2 text-left justify-center'><strong>Status:</strong> {selectedTask.status}</p>
                            <p className='mb-2 text-left justify-center'><strong>Date:</strong> {formatDate(selectedTask.startDate)}</p>
                            <p className='mb-2 text-left justify-center'><strong>StartTime:</strong> {(selectedTask.startTime)}</p>
                            <p className='mb-2 text-left justify-center'><strong>DeadLine:</strong> {formatDate(selectedTask.deadlineDate)}</p>
                            <p className='mb-2 text-left justify-center'><strong>EndTime:</strong> {(selectedTask.endTime)}</p>
                            <p className='mb-2 text-left justify-center'><strong>Assigned To:</strong> {selectedTask.assignTo}</p>


                            <p className="mb-2 text-left justify-center">
                                <strong>Image by Receipient:</strong>{" "}
                                {selectedTask.imagePath ? (
                                    <button
                                        type="button"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2 text-sm"
                                        onClick={() => handleImagePreview(selectedTask.imagePath)}
                                    >
                                        Preview
                                    </button>
                                ) : (
                                    "Not Added"
                                )}
                            </p>

                            <p className="mb-2 text-left justify-center">
                                <strong>Picture:</strong>{" "}
                                {selectedTask.picture ? (
                                    <button
                                        type="button"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2 text-sm"
                                        onClick={() => handlePicturePreview(selectedTask.picture)}
                                    >
                                        Preview
                                    </button>
                                ) : (
                                    "Not Added"
                                )}
                            </p>


                            <p className="mb-2 text-left flex item-center">
                                <span className='mr-1 '><strong>Audio:</strong></span>{" "}
                                {selectedTask.audio ? (
                                    <audio controls className='w-64 h-8 md:w-96 md-h-10 text-lg'>
                                        <source src={`http://103.159.85.246:4000/${selectedTask.audio}`} type="audio/mp3" />
                                        Your browser does not support the audio element.
                                    </audio>

                                ) : (
                                    "Not Added"
                                )}
                            </p>

                            <div className='text-center'>
                                <button
                                    className="bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-700 mt-5"
                                    onClick={closeViewModal}
                                >
                                    Close
                                </button>
                            </div>
                            {/* </div> */}
                        </div>
                    </div>
                </div>
            )}


            {isPreviewModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white w-72 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
                        <div className="p-1 text-center">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
                            <Image
                                src={completeImageUrl}
                                alt="Preview"
                                width={400} // Adjust the width as needed
                                height={300} // Adjust the height as needed
                            />
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2"
                                onClick={() => setIsPreviewModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {isImagePreviewModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white w-72 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsImagePreviewModalOpen(false)}></button>
                        <div className="p-1 text-center">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
                            <Image
                                src={completePictureUrl}
                                alt="Preview"
                                width={500} // Adjust the width as needed
                                height={400} // Adjust the height as needed
                            />
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2"
                                onClick={() => setIsImagePreviewModalOpen(false)}
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

export default TodaysTask;
