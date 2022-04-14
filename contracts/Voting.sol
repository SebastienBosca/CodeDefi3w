// SPDX-License-Identifier: MIT

// j'ai préféré calculer le ou les gagnants au fur et à mesure mais on peut aussi lancer un calcul avec une boucle type FOR à la fin.
// winners est un tableau d'entiers car il peut y avoir plusieurs gagnants.

pragma solidity 0.8.11;
 
import "@openzeppelin/contracts/access/Ownable.sol";
 
contract Voting is Ownable {

uint NombreProp; 
uint Max;
uint SessionNumber=1;

uint[] public winners; //tableau des gagnants
uint[] public viewableWinners; //tableau des gagnants officiellement publiés
address[] public RegVoters; //tableau des votants enregistrés
Proposal[] public propositions; //tableau des propositions + nombre de voix
string[] public props; //tableau des propositions 
WorkflowStatus public status;
mapping (address => Voter) public profil; //mettre private si on veut plus de confidentialité

struct Voter {
bool isRegistered;
bool hasVoted;
uint votedProposalId;
}
struct Proposal {
string description;
uint voteCount;
}
enum WorkflowStatus {
RegisteringVoters,
ProposalsRegistrationStarted,
ProposalsRegistrationEnded,
VotingSessionStarted,
VotingSessionEnded,
VotesTallied
}


event VoterRegistered(address voterAddress); 
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
event ProposalRegistered(uint proposalId);
event Voted (address voter, uint proposalId);


// Etape 0: l'administrateur (et lui seul) peut modifier le statut


function changeStatus(WorkflowStatus newStatus) public { // ou public onlyOwner { et on supprime la ligne suivante mais alors le message est celui specifie dans Ownable
    require (msg.sender == owner(), "not owner"); 
    require ((uint(newStatus) == uint(status)+1 || uint(newStatus)+5 == uint(status)), "wrong step"); // les étapes doivent se suivre dans l'ordre
    WorkflowStatus previousStatus = status;
    if (newStatus == WorkflowStatus.RegisteringVoters) {
        NombreProp = 0;
        delete propositions;
        delete props;
        Max = 0;
        delete winners ;
        SessionNumber++;
        
        for(uint i=0; i < RegVoters.length; i++){
        profil[RegVoters[i]].isRegistered=false;
        profil[RegVoters[i]].hasVoted=false;
        profil[RegVoters[i]].votedProposalId=0;   
        } 
        delete RegVoters; // on efface tout
    }

    status = newStatus;
    emit WorkflowStatusChange(previousStatus, newStatus); 
}

// Etape 1: Enregistrement des votants

function Register(address voterAddress) public  { // ou public onlyOwner { et on supprime la ligne suivante
    require (msg.sender == owner(), "not owner");
    require (status == WorkflowStatus.RegisteringVoters , "no time for this"); 
    require ( profil[voterAddress].isRegistered==false, "already registered");
    profil[voterAddress].isRegistered=true;
    RegVoters.push(voterAddress);
    emit VoterRegistered(voterAddress);
}

// Etape 2: Enregistrement des Propositions 

function RegisterProposal(string memory prop) public {  
    require (profil[msg.sender].isRegistered==true, "not registered");
    require (status == WorkflowStatus.ProposalsRegistrationStarted , "no time for this");  
    ++ NombreProp ; 
    Proposal memory newProp = Proposal(prop , 0);
    propositions.push(newProp) ;
    props.push(prop);
    emit ProposalRegistered(NombreProp);
}

// Etape 3: Fin de la session d'enregistrement des propositions 
// Rien à Faire

// Etape 4: Votes

function RegisterVote(uint PropId) public {
    require (profil[msg.sender].isRegistered==true, "not registered");
    require (status == WorkflowStatus.VotingSessionStarted , "this is no time for vote");  
    require (profil[msg.sender].hasVoted==false, "already voted");
    ++propositions[PropId-1].voteCount;  
    if (propositions[PropId-1].voteCount == Max) {
    winners.push(PropId) ;
    }
    if (propositions[PropId-1].voteCount > Max) {
    delete winners ;  
    Max = propositions[PropId-1].voteCount ;
    winners.push(PropId) ;
    }
    profil[msg.sender].hasVoted=true;
    profil[msg.sender].votedProposalId = PropId ;
    emit Voted(msg.sender , PropId);

}

// Etape 5: Fin de la session de vote
// Rien à Faire

// Etape 6: Comptabilisation des votes et publication du ou des gagnants; fonctions getCeciCela

 

function getWinner() public returns (uint256[] memory) {  
 if (status == WorkflowStatus.VotesTallied) {viewableWinners = winners ;} else {delete viewableWinners;}  
    return viewableWinners; // le tableau public de propositions permet à tous de vérifier les détails de la ou des propositions gagnantes: string associé, nombre de votes.
}

function getSessionNumber() public view returns (uint) { return SessionNumber; }
function getRegVoters() public view returns (address[] memory) { return RegVoters; }
function getNombreProp() public view returns (uint) { return NombreProp; }
function getprop(uint n) public view returns (string memory) { return propositions[n-1].description; }
function getStatus() public view returns (uint) { return uint(status); }
function getProp() public view returns (string[] memory) { return props;}

}

