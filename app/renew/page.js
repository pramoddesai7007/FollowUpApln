'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jwtDecode from 'jwt-decode';
import NavSideSuper from '../components/NavSideSuper';
import { useRouter } from 'next/navigation';

const Renew = () => {
    const [subscriptionDetails, setSubscriptionDetails] = useState([]);
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
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
        fetchSubscriptionDetails();
    }, []);

    const fetchSubscriptionDetails = async () => {
        try {
            const response = await axios.get('http://103.159.85.246:4000/api/subscription', {});
            if (Array.isArray(response.data)) {
                setSubscriptionDetails(response.data);
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            console.error('Error fetching subscription details:', error);
            showError('Failed to fetch subscription details');
        }
    };

    const handleSubscribeYearly = async () => {
        try {
            if (!email) {
                showError('Email cannot be empty');
                return;
            }
            const response = await axios.patch('http://103.159.85.246:4000/update-subscription', { email });
            setSubscriptionDetails(prevDetails =>
                prevDetails.map(detail =>
                    detail.email === email ? response.data.data : detail
                )
            );
            setEmail('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error updating subscription:', error);
            showError(error.response?.data?.error || 'Failed to update subscription');
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
            <h2 className="text-xl font-bold mt-20 leading-tight tracking-tight text-slate-500 md:text-2xl dark:text-white ml-80">
                Renew Subscription
            </h2>
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4 mt-8 border-gray-300 border">
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

                <div className='flex justify-center'>
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={handleSubscribeYearly}
                    >
                        <FontAwesomeIcon icon={faKey} className="mr-2" />
                        Subscribe
                    </button>
                </div>

                {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}

                <h3 className="text-base font-medium">Subscribed List:</h3>
                <div className="mt-4 overflow-y-auto max-h-80">
                    <ul className="mt-2 border border-gray-200 divide-y divide-gray-200 rounded-md font-semibold">
                        {subscriptionDetails.map((detail, index) => (
                            <li key={index} className="px-4 py-3 text-sm">
                                {detail.email}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};
export default Renew;