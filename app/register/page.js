
'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jwt_decode from 'jwt-decode'; // Import JWT decode library
import NavSideSuper from '../components/NavSideSuper';

const Register = () => {
    const [registrationDetails, setRegistrationDetails] = useState([]); // Changed to array to hold multiple registrations
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [adminCompanyName, setAdminCompanyName] = useState('');

    useEffect(() => {
        fetchRegistrationDetails();
    }, []);

    const fetchRegistrationDetails = async () => {
        try {
            const response = await axios.get('http://103.159.85.246:4000/api/registration');
            setRegistrationDetails(response.data);
        } catch (error) {
            console.error('Error fetching registration details:', error);
            showError('Failed to fetch registration details');
        }
    };

    const handleRegister = async () => {
        try {
            if (!email) {
                showError('Email cannot be empty');
                return;
            }
            const response = await axios.post('http://103.159.85.246:4000/register', { email });
            setRegistrationDetails(prevDetails => [...prevDetails, response.data.data]); // Append new registration to the list
            setEmail('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error registering for free trial:', error);
            showError('Mail Id already exists');
        }
    };

    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage('');
        }, 2000);
    };

    return (
        <>
            <NavSideSuper/>
            <h2 className="text-xl font-bold mt-20 leading-tight tracking-tight text-gray-500 md:text-2xl dark:text-white ml-80">
                                Registration For Free Trial
                            </h2>
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4 mt-10 border-gray-300 border">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Id :</label>
                    <input
                        id="email"
                        type="email"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="flex justify-center"> {/* Centering the button */}
                    <button
                        className="inline-flex items-center justify-center px-5 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-5"
                        onClick={handleRegister}
                    >
                        <FontAwesomeIcon icon={faLink} className="mr-2" />
                        Register for Free Trial
                    </button>
                </div>
                {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
                <h3 className="text-base font-medium">Registered Emails:</h3>
                <div className="mt-4 overflow-y-auto max-h-80">
                    <ul className="mt-2 border border-gray-200 divide-y divide-gray-200 rounded-md font-semibold">
                        {registrationDetails.map((registration, index) => (
                            <li key={index} className="px-4 py-3 text-sm">
                                {registration.email}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};
export default Register;
