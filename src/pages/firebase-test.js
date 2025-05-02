import { useState, useEffect } from 'react';
import { db, app } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testData, setTestData] = useState([]);
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    // Check environment variables
    const env = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
    };
    setEnvVars(env);

    // Check if Firebase is initialized
    if (!app) {
      setStatus('Firebase app not initialized');
      setError('Firebase app object is undefined or null');
      return;
    }

    if (!db) {
      setStatus('Firestore not initialized');
      setError('Firestore db object is undefined or null');
      return;
    }

    setStatus('Firebase initialized, testing read/write...');

    // Try to read data
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'test-collection'));
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setTestData(data);
        setStatus('Successfully read from Firestore');
      } catch (error) {
        console.error('Error reading from Firestore:', error);
        setError(`Read error: ${error.message}`);
        setStatus('Failed to read from Firestore');
      }
    };

    fetchData();
  }, []);

  const handleTestWrite = async () => {
    try {
      setStatus('Testing write to Firestore...');
      
      const docRef = await addDoc(collection(db, 'test-collection'), {
        message: 'Test document',
        timestamp: new Date().toISOString()
      });
      
      setTestResult(`Write succeeded! Document ID: ${docRef.id}`);
      setStatus('Successfully wrote to Firestore');
      
      // Refresh data
      const querySnapshot = await getDocs(collection(db, 'test-collection'));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setTestData(data);
    } catch (error) {
      console.error('Error writing to Firestore:', error);
      setError(`Write error: ${error.message}`);
      setTestResult(`Write failed: ${error.message}`);
      setStatus('Failed to write to Firestore');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">← Back to Home</Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className={`p-4 mb-6 rounded-lg ${
        status.includes('Failed') ? 'bg-red-100' : 
        status.includes('Success') ? 'bg-green-100' : 'bg-yellow-100'
      }`}>
        <h2 className="font-bold">Status: {status}</h2>
        {error && <p className="text-red-600 mt-1">{error}</p>}
        {testResult && <p className="mt-1">{testResult}</p>}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <ul>
            {Object.entries(envVars).map(([key, value]) => (
              <li key={key} className={value.includes('✗') ? 'text-red-600' : 'text-green-600'}>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <button 
        onClick={handleTestWrite}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition mb-6"
      >
        Test Write to Firestore
      </button>
      
      <div>
        <h2 className="text-lg font-bold mb-2">Test Collection Data</h2>
        {testData.length === 0 ? (
          <p className="italic text-gray-500">No data found in test-collection</p>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg">
            <ul>
              {testData.map(item => (
                <li key={item.id} className="mb-2 pb-2 border-b border-gray-300 last:border-0">
                  <div><strong>ID:</strong> {item.id}</div>
                  <div><strong>Message:</strong> {item.message}</div>
                  <div><strong>Timestamp:</strong> {item.timestamp}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 