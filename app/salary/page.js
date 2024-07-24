// "use client"

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import NavSideEmp from '../components/NavSideEmp';
// import NavSide from '../components/NavSide';

// const CalculateSalary = () => {
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [totalSalary, setTotalSalary] = useState(null);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [employeeNames, setEmployeeNames] = useState([]);
//     const [selectedEmployee, setSelectedEmployee] = useState('');

//     useEffect(() => {
//         const fetchEmployeeNames = async () => {
//             try {
//                 const token = localStorage.getItem('authToken');
//                 const response = await axios.get('http://103.159.85.246:4000/api/employee/subemployees/list', {
//                     headers: {
//                         Authorization: token,
//                     },
//                 });
//                 const names = response.data.map(employee => employee.name);
//                 setEmployeeNames(names);
//             } catch (error) {
//                 console.error('Error:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchEmployeeNames();
//     }, []);

//     useEffect(() => {
//         const fetchEmployeeEmail = async () => {
//             if (selectedEmployee) {
//                 try {
//                     const token = localStorage.getItem('authToken');
//                     const response = await axios.get(`http://103.159.85.246:4000/api/salary/employee/subemployees/details?name=${selectedEmployee}`, {
//                         headers: {
//                             Authorization: token,
//                         },
//                     });
//                     setEmail(response.data.email);
//                 } catch (error) {
//                     console.error('Error:', error);
//                 }
//             }
//         };

//         fetchEmployeeEmail();
//     }, [selectedEmployee]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await axios.post('http://103.159.85.246:4000/api/salary/calculate-salary', {
//                 name: selectedEmployee,
//                 email,
//                 startDate,
//                 endDate,
//             });
//             setTotalSalary(response.data.total);
//         } catch (err) {
//             setError('Error calculating salary');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <>
//             <NavSide />
//             <div className="m-5 pl-0 md:pl-20 mt-10 font-sans">
//                 <div className='p-2 md:p-1 bg-slate-50 '>
//                     <div className="mx-auto max-w-sm p-6 bg-white rounded-lg shadow-md mt-16 md:mt-16 border border-gray-300">
//                         <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Calculate Salary</h1>
//                         <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-2">
//                             <div className="flex flex-col w-full md:w-full">
//                                 <label htmlFor="employeeSelect" className="text-sm font-medium text-gray-700">
//                                     Select Employee:
//                                 </label>
//                                 <select
//                                     id="employeeSelect"
//                                     name="employeeSelect"
//                                     className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full"
//                                     value={selectedEmployee}
//                                     onChange={(e) => setSelectedEmployee(e.target.value)}
//                                 >
//                                     <option value="">Select an employee</option>
//                                     {employeeNames.map((employeeName, index) => (
//                                         <option key={index} value={employeeName}>
//                                             {employeeName}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div className="flex flex-col w-full md:w-full">
//                                 <label htmlFor="email" className="text-sm font-medium text-gray-700">Email:</label>
//                                 <input
//                                     id="email"
//                                     type="email"
//                                     className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full bg-gray-200"
//                                     value={email}
//                                     readOnly
//                                 />
//                             </div>
//                             <div className="flex flex-col w-full md:w-full">
//                                 <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date:</label>
//                                 <input
//                                     id="startDate"
//                                     type="date"
//                                     className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full"
//                                     value={startDate}
//                                     onChange={(e) => setStartDate(e.target.value)}
//                                     required
//                                 />
//                             </div>
//                             <div className="flex flex-col w-full md:w-full">
//                                 <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date:</label>
//                                 <input
//                                     id="endDate"
//                                     type="date"
//                                     className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full"
//                                     value={endDate}
//                                     onChange={(e) => setEndDate(e.target.value)}
//                                     required
//                                 />
//                             </div>

//                             <div className='mt-3'>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-1.5 border border-gray-400 rounded bg-orange-500 text-white text-sm mt-5"
//                                 >
//                                     {loading ? 'Calculating...' : 'Calculate Salary'}
//                                 </button>
//                                 {error && <p className="text-red-500">{error}</p>}
//                                 {totalSalary !== null && (
//                                     <div className="text-center mt-4">
//                                         <p className="text-lg font-semibold">Total Salary: ₹ {totalSalary.toFixed(2)}</p>
//                                     </div>
//                                 )}
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default CalculateSalary;




"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavSide from '../components/NavSide';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';


const CalculateSalary = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalSalary, setTotalSalary] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [employeeNames, setEmployeeNames] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const router=useRouter()

    
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

    useEffect(() => {
        const fetchEmployeeEmail = async () => {
            if (selectedEmployee) {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await axios.get(`http://103.159.85.246:4000/api/salary/employee/subemployees/details?name=${selectedEmployee}`, {
                        headers: {
                            Authorization: token,
                        },
                    });
                    setEmail(response.data.email);
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        };

        fetchEmployeeEmail();
    }, [selectedEmployee]);

    useEffect(() => {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 2);
        const formatDate = (date) => date.toISOString().split('T')[0];

        setStartDate(formatDate(firstDayOfMonth));
        setEndDate(formatDate(currentDate));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://103.159.85.246:4000/api/salary/calculate-salary', {
                name: selectedEmployee,
                email,
                startDate,
                endDate,
            });
            setTotalSalary(response.data.total);
        } catch (err) {
            setError('Error calculating salary');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavSide />
            <div className="m-5 pl-0 md:pl-20 mt-10 font-sans">
                <div className='p-2 md:p-1 bg-slate-50'>
                    <div className="mx-auto max-w-sm p-6 bg-white rounded-lg shadow-md mt-16 md:mt-16 border border-gray-300">
                        <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Calculate Salary</h1>
                        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-2">
                            <div className="flex flex-col w-full md:w-full">
                                <label htmlFor="employeeSelect" className="text-sm font-medium text-gray-700">
                                    Select Employee:
                                </label>
                                <select
                                    id="employeeSelect"
                                    name="employeeSelect"
                                    className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full"
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
                            <div className="flex flex-col w-full md:w-full">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full bg-gray-200"
                                    value={email}
                                    readOnly
                                />
                            </div>
                            <div className="flex flex-col w-full md:w-full">
                                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date:</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full md:w-full">
                                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date:</label>
                                <input
                                    id="endDate"
                                    type="date"
                                    className="px-3 py-1 border border-gray-400 rounded text-sm w-full md:w-full"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='mt-3'>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 border border-gray-400 rounded bg-orange-500 text-white text-sm mt-5"
                                >
                                    {loading ? 'Calculating...' : 'Calculate Salary'}
                                </button>
                                {error && <p className="text-red-500">{error}</p>}
                                {totalSalary !== null && (
                                    <div className="text-center mt-4">
                                        <p className="text-lg font-semibold">Total Salary: ₹ {totalSalary.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CalculateSalary;
