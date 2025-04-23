import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import './Healthcare.css';

const Healthcare = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [patientID, setPatientID] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [patientRecords, setPatientRecords] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [providerAddress, setProviderAddress] = useState("");

    const contractAddress = "0x5B8C376CDb66bf68cFCb2A02662B7b1add0ac9ED";
    const contractABI = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "patientName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizeProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "patientName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert('Please install MetaMask to use this DApp!');
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = provider.getSigner();
            setProvider(provider);
            setSigner(signer);

            const accountAddress = await signer.getAddress();
            setAccount(accountAddress);
            setIsConnected(true);

            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(contract);

            const ownerAddress = await contract.getOwner();
            setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
        } catch (error) {
            console.error("Error connecting to wallet: ", error);
            alert('Error connecting to wallet. Please try again.');
        }
    };

    const disconnectWallet = () => {
        setProvider(null);
        setSigner(null);
        setContract(null);
        setAccount(null);
        setIsOwner(null);
        setIsConnected(false);
        setPatientRecords([]);
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    connectWallet();
                }
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
            }
        };
    }, []);

    const fetchPatientRecords = async () => {
        if (!contract) {
            alert('Please connect your wallet first');
            return;
        }

        if (!patientID) {
            alert('Please enter a Patient ID');
            return;
        }

        try {
            // Convert patientID to number and validate
            const patientIdNumber = parseInt(patientID);
            if (isNaN(patientIdNumber)) {
                alert('Please enter a valid Patient ID number');
                return;
            }

            // Call the contract function
            const records = await contract.getPatientRecords(patientIdNumber);
            
            // Check if records exist and are in the correct format
            if (records && Array.isArray(records)) {
                setPatientRecords(records);
            } else {
                setPatientRecords([]);
                alert('No records found for this Patient ID');
            }
        } catch (error) {
            console.error("Error fetching patient records:", error);
            let errorMessage = 'Error fetching records. ';
            
            if (error.message.includes('revert')) {
                errorMessage += 'Invalid Patient ID or no records found.';
            } else if (error.message.includes('gas')) {
                errorMessage += 'Gas estimation failed. Please try again.';
            } else {
                errorMessage += 'Please try again.';
            }
            
            alert(errorMessage);
            setPatientRecords([]);
        }
    };

    const addRecord = async () => {
        if (!contract || !patientID || !diagnosis || !treatment) {
            alert('Please fill in all fields and connect wallet');
            return;
        }

        try {
            // Convert patientID to number
            const patientIdNumber = parseInt(patientID);
            if (isNaN(patientIdNumber)) {
                alert('Please enter a valid Patient ID number');
                return;
            }

            // Check if the contract is properly initialized
            if (!contract.addRecord) {
                throw new Error('Contract function not found');
            }

            // Call the contract function
            const tx = await contract.addRecord(
                patientIdNumber,
                "Alice", // You might want to make this dynamic
                diagnosis,
                treatment,
                { gasLimit: 300000 } // Add gas limit to prevent out of gas errors
            );

            // Wait for transaction to be mined
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                // Clear the form
                setDiagnosis('');
                setTreatment('');
                // Refresh the records
                await fetchPatientRecords();
                alert('Record added successfully!');
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error("Error adding records:", error);
            let errorMessage = 'Error adding record. ';
            
            // Provide more specific error messages
            if (error.message.includes('revert')) {
                errorMessage += 'Transaction was reverted. ';
            } else if (error.message.includes('gas')) {
                errorMessage += 'Gas estimation failed. ';
            } else if (error.message.includes('user denied')) {
                errorMessage += 'Transaction was rejected. ';
            }
            
            errorMessage += 'Please try again.';
            alert(errorMessage);
        }
    };

    const authorizeProvider = async () => {
        if (!isOwner) {
            alert("Only contract owner can call this function");
            return;
        }

        if (!providerAddress) {
            alert("Please enter a provider address");
            return;
        }

        try {
            const tx = await contract.authorizeProvider(providerAddress);
            await tx.wait();
            alert(`Provider ${providerAddress} authorized successfully`);
            setProviderAddress('');
        } catch(error) {
            console.error("Error authorizing provider", error);
            alert('Error authorizing provider. Please try again.');
        }
    };

    return(
        <div className='container'>
            <div className='wallet-buttons'>
                <div className="app-title">HealthCare Application</div>
                {!isConnected ? (
                    <button className='connect-button' onClick={connectWallet}>Connect Wallet</button>
                ) : (
                    <button className='disconnect-button' onClick={disconnectWallet}>Disconnect Wallet</button>
                )}
            </div>
            <h1 className="title">HealthCare Application</h1>
            {account && <p className='account-info'>Connected Account: {account}</p>}
            {isOwner && <p className='owner-info'>You are the contract owner</p>}

            <div className='form-section'>
                <h2>Fetch Patient Records</h2>
                <input 
                    className='input-field' 
                    type='text' 
                    placeholder='Enter Patient ID' 
                    value={patientID} 
                    onChange={(e) => setPatientID(e.target.value)}
                />
                <button className='action-button' onClick={fetchPatientRecords}>Fetch Records</button>
            </div>

            <div className="form-section">
                <h2>Add Patient Record</h2>
                <input 
                    className='input-field' 
                    type='text' 
                    placeholder='Diagnosis' 
                    value={diagnosis} 
                    onChange={(e) => setDiagnosis(e.target.value)}
                />
                <input 
                    className='input-field' 
                    type='text' 
                    placeholder='Treatment' 
                    value={treatment} 
                    onChange={(e) => setTreatment(e.target.value)}
                />
                <button className='action-button' onClick={addRecord}>Add Record</button>
            </div>

            <div className="form-section">
                <h2>Authorize HealthCare Provider</h2>
                <input 
                    className='input-field' 
                    type="text" 
                    placeholder='Provider Address' 
                    value={providerAddress} 
                    onChange={(e) => setProviderAddress(e.target.value)}
                />
                <button className='action-button' onClick={authorizeProvider}>Authorize Provider</button>
            </div>

            <div className='records-section'>
                <h2>Patient Records</h2>
                {patientRecords.length > 0 ? (
                    <table className="records-table">
                        <thead>
                            <tr>
                                <th>Record ID</th>
                                <th>Diagnosis</th>
                                <th>Treatment</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientRecords.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.recordID.toNumber()}</td>
                                    <td>{record.diagnosis}</td>
                                    <td>{record.treatment}</td>
                                    <td>{new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-records">No records found</p>
                )}
            </div>
        </div>
    );
};

export default Healthcare;