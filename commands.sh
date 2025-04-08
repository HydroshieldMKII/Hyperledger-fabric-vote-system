#!binbash

# ==Network setup==
# .network.sh down && .network.sh up createChannel -s couchdb

#==Install and instantiate the chaincode==
# .network.sh deployCC -ccn votingsystem -ccp ..voting-system -ccl javascript -ccep OR('Org1MSP.peer','Org2MSP.peer')

# Change to test-network directory
TEST_NETWORK_PATH=roothyperledger-fabricfabric-samplestest-network

# Set environment variables for test-network
export FABRIC_CFG_PATH=$PWD..config
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=$TEST_NETWORK_PATHorganizationspeerOrganizationsorg1.example.compeerspeer0.org1.example.comtlsca.crt
export CORE_PEER_MSPCONFIGPATH=$TEST_NETWORK_PATHorganizationspeerOrganizationsorg1.example.comusersAdmin@org1.example.commsp
export CORE_PEER_ADDRESS=localhost7051
export ORDERER_CA=$TEST_NETWORK_PATHorganizationsordererOrganizationsexample.comorderersorderer.example.commsptlscacertstlsca.example.com-cert.pem
export ORG2_TLS_ROOTCERT_FILE=$TEST_NETWORK_PATHorganizationspeerOrganizationsorg2.example.compeerspeer0.org2.example.comtlsca.crt


# Functions
initLedger() {
  peer chaincode invoke -o localhost7050 --tls --cafile $ORDERER_CA -C mychannel -n votingsystem 
    --peerAddresses localhost7051 --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE 
    --peerAddresses localhost9051 --tlsRootCertFiles $ORG2_TLS_ROOTCERT_FILE 
    -c '{functionInitLedger,Args[]}'
}

# Function to create an election
createElection() {
  candidates=$(echo $4  sed 'sg') # Escape double quotes
  
  # Args electionId, name, description, candidatesJSON, startDate, endDate
  peer chaincode invoke -o localhost7050 --tls --cafile $ORDERER_CA -C mychannel -n votingsystem 
    --peerAddresses localhost7051 --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE 
    --peerAddresses localhost9051 --tlsRootCertFiles $ORG2_TLS_ROOTCERT_FILE 
    -c {functionCreateElection,Args[$1,$2,$3,$candidates,$5,$6]}
}

# Function to cast a vote
castVote() {
  # Args electionId, voterId, candidateId
  peer chaincode invoke -o localhost7050 --tls --cafile $ORDERER_CA -C mychannel -n votingsystem 
    --peerAddresses localhost7051 --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE 
    --peerAddresses localhost9051 --tlsRootCertFiles $ORG2_TLS_ROOTCERT_FILE 
    -c {functionCastVote,Args[$1,$2,$3]}
}

# Function to end an election
endElection() {
  # Args electionId
  peer chaincode invoke -o localhost7050 --tls --cafile $ORDERER_CA -C mychannel -n votingsystem 
    --peerAddresses localhost7051 --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE 
    --peerAddresses localhost9051 --tlsRootCertFiles $ORG2_TLS_ROOTCERT_FILE 
    -c {functionEndElection,Args[$1]}
}

# Function to get election results
getElectionResults() {
  # Args electionId
  peer chaincode query -C mychannel -n votingsystem -c {Args[GetElectionResults,$1]}
}

# Function to verify a vote
verifyVote() {
  # Args electionId, voterId
  peer chaincode query -C mychannel -n votingsystem -c {Args[VerifyVote,$1,$2]}
}

# Function to get all elections
getAllElections() {
  peer chaincode query -C mychannel -n votingsystem -c '{Args[GetAllElections]}'
}

#Initialize Ledger
# initLedger

#== Create an Election == 
# Parameters electionId name description candidatesJSON startDate endDate
#createElection election3 City Mayor Election Election for city mayor [candidate1,candidate2,candidate3] 2024-05-01 2024-05-15

#== Cast a Vote ==
# Parameters electionId voterId candidateId
# castVote election1 voter123 candidate1

#==End an Election==
# Parameters electionId
# endElection election1

#==Get Election Results==
# Parameters electionId
# getElectionResults election1

#==Verify a Vote==
# Parameters electionId voterId
# verifyVote election1 voter123

#==Get All Elections==
# getAllElections