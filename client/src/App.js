import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import "./App.css"; 

class App extends Component {
  state = { web3: null, accounts: null, contract: null, ListVoters: null, win: [] };

  componentWillMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
  
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();

      // Récupérer l’instance du smart contract “ListVoters” avec web3 et les informations du déploiement du fichier (client/src/contracts/ListVoters.json)
      const deployedNetwork = Voting.networks[3];
  
      const instance = new web3.eth.Contract(
        Voting.abi,
        "0x308965Ca5e00300c18FCF5c743a121e574E083E9", 
      );
 
      this.setState({ web3, accounts, contract: instance }, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(error);
    }
  };

  runInit = async() => {
    const { accounts, contract } = this.state;
  
    // récupérer la liste des comptes enregistrés
    const ListVoters = await contract.methods.getRegVoters().call();
   
    // récupérer le numéro de statut
    const status = await contract.methods.getStatus().call();

    // récupérer le numéro de session
    const session = await contract.methods.getSessionNumber().call();
 
    // calculer le numéro de la prochaine étape
    const NextStep = parseInt(status)+1-(status==5)*6;

    // récupérer le nombre de propositions
    const propnumber = await contract.methods.getNombreProp().call();

    //récupérer la liste des propositions
    const props = await contract.methods.getProp().call();
     
    // récupérer les gagnants 
    const win = await contract.methods.getWinner().call();
 


    // Mettre à jour le state 
   this.setState({ ListVoters:ListVoters, session:session, propnumber:propnumber, props:props, status:status, NextStep:NextStep, win:win});
  }; 

//Changer le statut et passer à l'étape suivante

  Next = async() => {
    const { accounts, contract, NextStep } = this.state;
    const NextStepS = this.state.NextStep;   //new BN(..)  //new BigNumber(this.NextStep);
  await contract.methods.changeStatus(NextStepS).send({from: accounts[0]});
  this.runInit();
}
  
  ListVoters = async() => {
    const { accounts, contract } = this.state;
    const address = this.address.value;
    
    // Interaction avec le smart contract pour ajouter un compte 
    await contract.methods.Register(address).send({from: accounts[0]});
    // Récupérer la liste des comptes autorisés
    this.runInit();
  }
 
  PROPO = async() => {
    const { accounts, contract } = this.state;
    const propo = this.propo.value;
    
    // Interaction avec le smart contract pour ajouter une proposition
    await contract.methods.RegisterProposal(propo).send({from: accounts[0]});
    // Récupérer la liste des comptes autorisés
    this.runInit();
  }

  VOTE = async() => {
    const { accounts, contract } = this.state;
    const vote = this.vote.value;
    
    // Interaction avec le smart contract pour ajouter une proposition
    await contract.methods.RegisterVote(vote).send({from: accounts[0]});
    // Récupérer la liste des comptes autorisés
    this.runInit();
  }

 







  render() {
    const { ListVoters } = this.state;
    const { props } = this.state;
    const { win } = this.state;
   
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }


    if (this.state.status==0) {
    return (
      <div className="App">
        <div>
            <h2 className="text-center">Système de vote</h2>
            <hr></hr>
            <br></br>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Session de vote n° {this.state.session}  </strong></Card.Header>
            <Card.Header><strong>Etape 1: enregistrement des votants </strong></Card.Header>
            <Card.Header><strong>Liste des adresses enregistrées pour le vote:</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ListVoters !== null && 
                        ListVoters.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Le propriétaire peut enregistrer une nouvelle adresse:</strong></Card.Header>
            <Card.Body>
              <Form.Group controlId="formAddress">
                <Form.Control type="text" id="address"
                ref={(input) => { this.address = input }}
                />
              </Form.Group>
              <Button onClick={ this.ListVoters } variant="dark" > Enregistrer </Button>
            </Card.Body>
          </Card>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Le propriétaire peut passer à l'étape suivante:</strong></Card.Header>
            <Card.Body>
            <Button onClick={ this.Next } variant="dark" > Etape Suivante </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
      </div>
    );
}

if (this.state.status==1) {
    return (
      <div className="App">
        <div>
            <h2 className="text-center">Système de vote</h2>
            <hr></hr>
            <br></br>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Session de vote n° {this.state.session}  </strong></Card.Header>
            <Card.Header><strong>Etape 2: enregistrement des propositions </strong></Card.Header>
            <Card.Header><strong>Liste des propositions enregistrées:</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props !== null && 
                       props.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Les votants peuvent enregistrer une nouvelle proposition:</strong></Card.Header>
            <Card.Body>
              <Form.Group controlId="formAddress">
                <Form.Control type="text" id="propo"
                ref={(input) => { this.propo = input }}
                />
              </Form.Group>
              <Button onClick={ this.PROPO } variant="dark" > Enregistrer </Button>
            </Card.Body>
          </Card>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Le propriétaire peut passer à l'étape suivante:</strong></Card.Header>
            <Card.Body>
            <Button onClick={ this.Next } variant="dark" > Etape Suivante </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
      </div>
    );
}

if (this.state.status==2) {
    return (
      <div className="App">
        <div>
            <h2 className="text-center">Système de vote</h2>
            <hr></hr>
            <br></br>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Session de vote n° {this.state.session}  </strong></Card.Header>
            <Card.Header><strong>Etape 3: l'enregistrement des propositions est terminé, en voici la liste finale: </strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props !== null && 
                       props.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}> 
          </Card>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Le propriétaire peut passer à l'étape suivante:</strong></Card.Header>
            <Card.Body>
            <Button onClick={ this.Next } variant="dark" > Etape Suivante </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
      </div>
    );
}

if (this.state.status==3) {
    return (
      <div className="App">
        <div>
            <h2 className="text-center">Système de vote</h2>
            <hr></hr>
            <br></br>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Session de vote n° {this.state.session}  </strong></Card.Header>
            <Card.Header><strong>Etape 4: Début du Vote </strong></Card.Header>
            <Card.Header><strong>Liste des propositions:</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      { props !== null && 
                        props.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Voter pour la proposition n°:</strong></Card.Header>
            <Card.Body>
              <Form.Group controlId="formAddress">
                <Form.Control type="text" id="vote"
                ref={(input) => { this.vote = input }}
                />
              </Form.Group>
              <Button onClick={ this.VOTE } variant="dark" > Enregistrer </Button>
            </Card.Body>
          </Card>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Le propriétaire peut passer à l'étape suivante:</strong></Card.Header>
            <Card.Body>
            <Button onClick={ this.Next } variant="dark" > Etape Suivante </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
      </div>
    );
}

if (this.state.status==4) {
    return (
      <div className="App">
        <div>
            <h2 className="text-center">Système de vote</h2>
            <hr></hr>
            <br></br>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Session de vote n° {this.state.session}  </strong></Card.Header>
            <Card.Header><strong>Etape 5: Fin du Vote </strong></Card.Header>
            <Card.Header><strong>Liste des propositions:</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props !== null && 
                        props.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Le propriétaire peut passer à l'étape suivante:</strong></Card.Header>
            <Card.Body>
            <Button onClick={ this.Next } variant="dark" > Etape Suivante </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
      </div>
    );
}

if (this.state.status==5) {
    return (
      <div className="App">
        <div>
            <h2 className="text-center">Système de vote</h2>
            <hr></hr>
            <br></br>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Session de vote n° {this.state.session}  </strong></Card.Header>
            <Card.Header><strong>Etape 6: Publication des résultats </strong></Card.Header>
            <Card.Header><strong>Liste des propositions:</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props !== null && 
                        props.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
 <div style={{display: 'flex', justifyContent: 'center'}}>
        <Card style={{ width: '50rem' }}>
            <Card.Header><strong>La ou les propositions gagnantes ont le ou les n°:</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {win !== null && 
                        win.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Le propriétaire peut passer à l'étape suivante:</strong></Card.Header>
            <Card.Body>
            <Button onClick={ this.Next } variant="dark" > Etape Suivante </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
      </div>
    );
}

else return null


  }
}

export default App;
