
"use client"


'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import NavSideEmp from '../components/NavSideEmp';
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

const EmpTimeCard = () => {
    const currentDate = new Date().toISOString().slice(0, 10);

    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
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
        if (userRole !== 'sub-employee') {
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
        if (!startDate || !endDate) {
            setError('Employee, Start Date, and End Date are required');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken'); // Get the token from local storage

            const response = await axios.get('http://103.159.85.246:4000/api/salary/empSalary', {
                params: { startDate, endDate },
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

    // Calculate the total duration in hours
    const calculateTotalDuration = () => {
        return salaries.reduce((total, salary) => {
            return total + salary.clockRecords.reduce((subTotal, record) => {
                return subTotal + (record.workDuration || 0);
            }, 0);
        }, 0).toFixed(2);
    };

    return (
        <>
            <NavSideEmp />
            <div className="m-5 pl-0 md:pl-64 mt-20 font-sans">
                <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Time Card</h1>
                <div className="flex justify-center items-center mb-4 space-x-2">
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
            
        </>
    );
};

export default EmpTimeCard;
