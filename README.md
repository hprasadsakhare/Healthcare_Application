
# HealthcareRecords Smart Contract

This repository contains a Solidity smart contract for managing healthcare records on the Ethereum blockchain. The contract enables authorized healthcare providers to create and access patient medical records in a secure and controlled environment.

## Contract Overview

The `HealthcareRecords` contract is designed to store medical records for patients while maintaining strict access control. Only the contract owner can authorize healthcare providers, and only authorized providers can add or view patient records.

### Key Features

- Secure storage of patient medical records on the blockchain
- Role-based access control system
- Owner-managed provider authorization
- Structured medical record storage with patient and record identification
- Timestamp tracking for all medical records

## Contract Structure

### State Variables

- `owner`: Address of the contract owner/administrator
- `patientRecords`: Mapping that stores arrays of patient records, indexed by patient ID
- `authorizedProviders`: Mapping that tracks which addresses are authorized as healthcare providers

### Struct

- `Record`: Data structure for medical records containing:
  - `recordID`: Unique identifier for each record
  - `patientName`: Name of the patient
  - `diagnosis`: Medical diagnosis information
  - `treatment`: Treatment plan or prescription
  - `timestamp`: When the record was created

### Modifiers

- `onlyOwner`: Restricts function access to the contract owner
- `onlyAuthorizedProvider`: Restricts function access to authorized healthcare providers

### Functions

- `constructor()`: Initializes the contract and sets the deployer as the owner
- `getOwner()`: Returns the address of the contract owner
- `authorizeProvider(address provider)`: Allows the owner to authorize a healthcare provider
- `addRecord(uint256 patientID, string memory patientName, string memory diagnosis, string memory treatment)`: Allows authorized providers to add medical records
- `getPatientRecords(uint256 patientID)`: Allows authorized providers to retrieve a patient's records

## Usage

### Deployment

The contract can be deployed to the Ethereum network using tools like Truffle, Hardhat, or Remix IDE. Upon deployment, the deploying address becomes the contract owner.

### Role Management

1. The contract owner can authorize healthcare providers using `authorizeProvider(address)`
2. Only authorized providers can add and access patient records

### Record Management

1. Authorized providers can add patient records using `addRecord()`
2. Records are stored with the patient ID as the key
3. Each record contains detailed medical information and a timestamp
4. Providers can retrieve patient records using `getPatientRecords(uint256 patientID)`

## Security Considerations

- Access control is implemented through modifiers to ensure only authorized parties can access sensitive functions
- Patient data is protected and only accessible to authorized healthcare providers
- The contract doesn't implement record deletion or modification to maintain an immutable medical history
- Consider implementing additional encryption for sensitive medical data

## Technical Details

- Written in Solidity version ^0.8.0
- Uses mapping data structures for efficient data storage and retrieval
- Implements SPDX license identifier (MIT)

## Future Enhancements

Potential improvements for future versions:

1. Patient consent management system
2. Record revocation or amendment capabilities with history tracking
3. Time-limited access for providers
4. Multi-signature requirements for critical operations
5. Integration with decentralized identity systems
6. Events for important state changes to facilitate frontend integration
7. Enhanced privacy features using zero-knowledge proofs

## License

This project is licensed under the MIT License - see the LICENSE file for details.
