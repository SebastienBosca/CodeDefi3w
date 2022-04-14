const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider'); 
require('dotenv').config();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 7545
    },


goerli: {
    provider: function() {
      return new HDWalletProvider( 
process.env.MNEMONIC, process.env.INFURA_URL);
    },
    gas: 3000000, //2000000
    gasPrice: 5000000000,// remplacer 5 par 20
    network_id: 5,
  }

},

 //Ajouter cette partie (ou décommenter directement dans le fichier):
 compilers: {
   solc: {
     version: "0.8.11", // Récupérer la version exacte de solc-bin (par défaut : la  version de truffle)
    // settings: {  // Voir les documents de solidity pour des conseils sur l'optimisation et l'evmVersion
       optimizer: {
       enabled: true,
       runs: 200
    //   },
      }
   },
 },
};
