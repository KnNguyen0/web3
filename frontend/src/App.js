import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import GachaGameArtifact from './contracts/GachaGame.json';
import contractAddress from './contracts/contract-address.json';
import BattleArena from './BattleArena';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [lastRoll, setLastRoll] = useState(null);
  const [rollPrice, setRollPrice] = useState('0.01');
  const [balance, setBalance] = useState('0');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [inBattle, setInBattle] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask to use this dApp!');
        return;
      }

      setLoading(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAccount(accounts[0]);

      // Initialize contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const gachaContract = new ethers.Contract(
        contractAddress.GachaGame,
        GachaGameArtifact.abi,
        signer
      );

      setContract(gachaContract);

      // Get roll price
      const price = await gachaContract.rollPrice();
      setRollPrice(ethers.formatEther(price));

      // Get user balance
      const userBalance = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(userBalance));

      // Load user's characters
      await loadCharacters(gachaContract, accounts[0]);

      setLoading(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setLoading(false);
      alert('Failed to connect wallet');
    }
  };

  // Load characters
  const loadCharacters = async (contractInstance, userAddress) => {
    try {
      const tokenIds = await contractInstance.getUserCharacters(userAddress);
      const characterData = [];

      for (let tokenId of tokenIds) {
        const character = await contractInstance.getCharacter(tokenId);
        characterData.push({
          id: character.id.toString(),
          name: character.name,
          rarity: getRarityName(character.rarity),
          power: character.power.toString(),
          rolledAt: new Date(Number(character.rolledAt) * 1000).toLocaleString()
        });
      }

      setCharacters(characterData.reverse()); // Show newest first
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  // Roll gacha
  const rollGacha = async () => {
    if (!contract) return;

    try {
      setRolling(true);
      setLastRoll(null);

      const price = await contract.rollPrice();
      const tx = await contract.roll({ value: price });

      // Wait for transaction
      const receipt = await tx.wait();

      // Find the CharacterRolled event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'CharacterRolled';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        const tokenId = parsed.args.tokenId;

        // Get character details
        const character = await contract.getCharacter(tokenId);

        const newCharacter = {
          id: character.id.toString(),
          name: character.name,
          rarity: getRarityName(character.rarity),
          power: character.power.toString(),
          rolledAt: new Date(Number(character.rolledAt) * 1000).toLocaleString()
        };

        setLastRoll(newCharacter);
        setCharacters([newCharacter, ...characters]);

        // Update balance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const userBalance = await provider.getBalance(account);
        setBalance(ethers.formatEther(userBalance));
      }

      setRolling(false);
    } catch (error) {
      console.error('Error rolling gacha:', error);
      setRolling(false);
      alert('Failed to roll gacha. Check console for details.');
    }
  };

  // Get rarity name
  const getRarityName = (rarityNum) => {
    const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
    return rarities[rarityNum] || 'UNKNOWN';
  };

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      'COMMON': '#9e9e9e',
      'RARE': '#4caf50',
      'EPIC': '#9c27b0',
      'LEGENDARY': '#ff9800'
    };
    return colors[rarity] || '#000';
  };

  // Enter battle
  const enterBattle = (character) => {
    setSelectedCharacter(character);
    setInBattle(true);
  };

  // Exit battle
  const exitBattle = () => {
    setInBattle(false);
    setSelectedCharacter(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) {
            loadCharacters(contract, accounts[0]);
          }
        } else {
          setAccount(null);
          setContract(null);
          setCharacters([]);
        }
      });
    }
  }, [contract]);

  return (
    <div className="App">
      {inBattle && selectedCharacter ? (
        <BattleArena character={selectedCharacter} onExit={exitBattle} />
      ) : (
        <>
          <header className="App-header">
            <h1>Web3 Gacha Game</h1>
            <p className="subtitle">Roll for legendary characters!</p>
          </header>

          <div className="container">
            {!account ? (
              <div className="connect-section">
                <button
                  className="connect-button"
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
                <p className="info-text">Connect your wallet to start rolling!</p>
              </div>
            ) : (
              <>
                <div className="account-info">
                  <p><strong>Account:</strong> {account.substring(0, 6)}...{account.substring(38)}</p>
                  <p><strong>Balance:</strong> {parseFloat(balance).toFixed(4)} ETH</p>
                  <p><strong>Roll Price:</strong> {rollPrice} ETH</p>
                </div>

                <div className="roll-section">
                  <button
                    className="roll-button"
                    onClick={rollGacha}
                    disabled={rolling}
                  >
                    {rolling ? 'Rolling...' : `Roll Gacha (${rollPrice} ETH)`}
                  </button>
                </div>

                {lastRoll && (
                  <div className="last-roll">
                    <h2>New Character!</h2>
                    <div className="character-card highlight" style={{ borderColor: getRarityColor(lastRoll.rarity) }}>
                      <h3 style={{ color: getRarityColor(lastRoll.rarity) }}>{lastRoll.name}</h3>
                      <p className="rarity" style={{ color: getRarityColor(lastRoll.rarity) }}>
                        {lastRoll.rarity}
                      </p>
                      <p className="power">Power: {lastRoll.power}</p>
                      <p className="token-id">Token ID: #{lastRoll.id}</p>
                      <button
                        className="battle-button"
                        onClick={() => enterBattle(lastRoll)}
                      >
                        Enter Battle
                      </button>
                    </div>
                  </div>
                )}

                <div className="characters-section">
                  <h2>Your Characters ({characters.length})</h2>
                  {characters.length === 0 ? (
                    <p className="no-characters">No characters yet. Roll to get started!</p>
                  ) : (
                    <div className="characters-grid">
                      {characters.map((char) => (
                        <div
                          key={char.id}
                          className="character-card"
                          style={{ borderColor: getRarityColor(char.rarity) }}
                        >
                          <h3>{char.name}</h3>
                          <p className="rarity" style={{ color: getRarityColor(char.rarity) }}>
                            {char.rarity}
                          </p>
                          <p className="power">Power: {char.power}</p>
                          <p className="token-id">Token ID: #{char.id}</p>
                          <p className="rolled-at">{char.rolledAt}</p>
                          <button
                            className="battle-button"
                            onClick={() => enterBattle(char)}
                          >
                            Enter Battle
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <footer>
            <p>Contract: {contractAddress.GachaGame}</p>
            <p className="probabilities">
              Drop Rates: Legendary 1% | Epic 5% | Rare 20% | Common 74%
            </p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
