
'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { faEdit, faLink, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jwtDecode from 'jwt-decode'; // Import JWT decode library
import NavSideSuper from '../components/NavSideSuper';
import { useRouter } from 'next/navigation';

const Amount = () => {
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [amount, setAmount] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');
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
        if (userRole !== 'superAdmin') {
            // If the user is not a superadmin, redirect to the login page
            router.push('/forbidden');
            return;
        }
    }, []);

    useEffect(() => {
        decodeAuthToken();
    }, []);

    useEffect(() => {
        if (email) {
            fetchSubscriptionDetails();
        }
    }, [email]);

    const decodeAuthToken = () => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            const decodedToken = jwtDecode(authToken);
            setEmail(decodedToken.email); // Assuming the email is in the token
        }
    };

    const fetchSubscriptionDetails = async () => {
        try {
            const response = await axios.get(`http://103.159.85.246:4000/api/subscriptionRate/subscription/${email}`);
            setSubscriptionDetails(response.data);
        } catch (error) {
            console.error('Error fetching subscription details:', error);
            showError('Failed to fetch subscription details');
        }
    };

    const handleRegister = async () => {
        try {
            if (!amount) {
                showError('Amount cannot be empty');
                return;
            }
            const response = await axios.post('http://103.159.85.246:4000/api/subscriptionRate/subscription', { email, subscriptionPrice: amount });
            setSubscriptionDetails(response.data); // Update subscription details
            setAmount('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error registering subscription:', error);
            showError('An error occurred during subscription');
        }
    };

    const handleEdit = () => {
        setEditMode(true);
        setAmount(subscriptionDetails.subscriptionPrice); // Set current amount in the input
    };

    const handleSave = async () => {
        try {
            if (!amount) {
                showError('Amount cannot be empty');
                return;
            }
            const response = await axios.put(`http://103.159.85.246:4000/api/subscriptionRate/subscription/${email}`, { subscriptionPrice: amount });
            setSubscriptionDetails(response.data); // Update subscription details
            setEditMode(false);
            setAmount('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error updating subscription:', error);
            showError('An error occurred while updating subscription');
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
            <NavSideSuper />
            <h2 className="text-xl font-bold mt-20 leading-tight tracking-tight text-gray-500 md:text-2xl dark:text-white ml-80">
                SET AMOUNT
            </h2>
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4 mt-10 border-gray-300 border">
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount:</label>
                        <input
                            id="amount"
                            type="number"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    {!editMode ? (
                        <button
                            className="inline-flex items-center justify-center px-5 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-5"
                            onClick={handleRegister}
                        >
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            SUBSCRIPTION AMOUNT
                        </button>
                    ) : (
                        <button
                            className="inline-flex items-center justify-center px-5 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-5"
                            onClick={handleSave}
                        >
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            SAVE AMOUNT
                        </button>
                    )}
                </div>
                {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
                <h3 className="text-base font-medium">Subscription Details:</h3>
                <div className="mt-4 overflow-y-auto max-h-80">
                    <ul className="mt-2 border border-gray-200 divide-y divide-gray-200 rounded-md font-semibold">
                        {subscriptionDetails && (
                            <li className="px-4 py-3 text-sm flex justify-between items-center">
                                {subscriptionDetails.email}
                                <span>{subscriptionDetails.subscriptionPrice}</span>
                                <FontAwesomeIcon icon={faEdit} size='lg'
                                    style={{ color: '#1F618D', marginLeft: '19px', cursor: 'pointer' }}
                                    onClick={handleEdit}
                                />
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};
export default Amount;