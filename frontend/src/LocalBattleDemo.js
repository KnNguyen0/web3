import React, { useState, useEffect } from 'react';
import './App.css';
import BattleArena from './BattleArena';
import DungeonMap from './DungeonMap';

function LocalBattleDemo() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [inBattle, setInBattle] = useState(false);
  const [inDungeon, setInDungeon] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedCharForEquip, setSelectedCharForEquip] = useState(null);

  // Load from localStorage or initialize
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('gameInventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [characterEquipment, setCharacterEquipment] = useState(() => {
    const saved = localStorage.getItem('characterEquipment');
    return saved ? JSON.parse(saved) : {};
  });

  // Battle counter for boss encounters
  const [battleCounter, setBattleCounter] = useState(() => {
    const saved = localStorage.getItem('battleCounter');
    return saved ? parseInt(saved) : 0;
  });

  const [isBossBattle, setIsBossBattle] = useState(false);

  // Save to localStorage whenever inventory or equipment changes
  useEffect(() => {
    localStorage.setItem('gameInventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('characterEquipment', JSON.stringify(characterEquipment));
  }, [characterEquipment]);

  useEffect(() => {
    localStorage.setItem('battleCounter', battleCounter.toString());
  }, [battleCounter]);

  // Mock characters for local testing
  const mockCharacters = [
    {
      id: '1',
      name: 'Legendary Dragon Warrior',
      rarity: 'LEGENDARY',
      power: '1000',
      attribute: 'FIRE',
      rolledAt: new Date().toLocaleString()
    },
    {
      id: '2',
      name: 'Epic Shadow Assassin',
      rarity: 'EPIC',
      power: '500',
      attribute: 'DARK',
      rolledAt: new Date().toLocaleString()
    },
    {
      id: '3',
      name: 'Rare Water Spirit',
      rarity: 'RARE',
      power: '300',
      attribute: 'WATER',
      rolledAt: new Date().toLocaleString()
    },
    {
      id: '4',
      name: 'Common Earth Guardian',
      rarity: 'COMMON',
      power: '150',
      attribute: 'EARTH',
      rolledAt: new Date().toLocaleString()
    },
    {
      id: '5',
      name: 'Rare Lightning Striker',
      rarity: 'RARE',
      power: '280',
      attribute: 'ELECTRIC',
      rolledAt: new Date().toLocaleString()
    },
    {
      id: '6',
      name: 'Epic Light Paladin',
      rarity: 'EPIC',
      power: '520',
      attribute: 'LIGHT',
      rolledAt: new Date().toLocaleString()
    }
  ];

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

  // Get attribute color
  const getAttributeColor = (attribute) => {
    const colors = {
      'FIRE': '#ff6b35',
      'WATER': '#3498db',
      'EARTH': '#8b6914',
      'ELECTRIC': '#f1c40f',
      'DARK': '#8e44ad',
      'LIGHT': '#f9ca24'
    };
    return colors[attribute] || '#fff';
  };

  // Enter battle
  const enterBattle = (character) => {
    setSelectedCharacter(character);

    // Check if this should be a boss battle (every 5 battles)
    const newCounter = battleCounter + 1;
    setBattleCounter(newCounter);

    if (newCounter % 5 === 0) {
      setIsBossBattle(true);
    } else {
      setIsBossBattle(false);
    }

    setInBattle(true);
  };

  // Exit battle
  const exitBattle = () => {
    setInBattle(false);
    setSelectedCharacter(null);
    setIsBossBattle(false);
  };

  // Handle loot from battle
  const handleLootCollected = (loot) => {
    setInventory(prev => [...prev, loot]);
  };

  // Get character's equipped items
  const getCharacterEquipment = (characterId) => {
    return characterEquipment[characterId] || { weapon: null, armor: null, accessory: null };
  };

  // Equip item to character
  const equipItem = (characterId, item) => {
    setCharacterEquipment(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        [item.slot]: item
      }
    }));
  };

  // Unequip item from character
  const unequipItem = (characterId, slot) => {
    setCharacterEquipment(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        [slot]: null
      }
    }));
  };

  // Calculate total stats for character including equipment
  const getCharacterStats = (character) => {
    const equipment = getCharacterEquipment(character.id);
    let bonuses = { power: 0, health: 0, mana: 0 };

    Object.values(equipment).forEach(item => {
      if (item && item.bonuses) {
        bonuses.power += item.bonuses.power || 0;
        bonuses.health += item.bonuses.health || 0;
        bonuses.mana += item.bonuses.mana || 0;
      }
    });

    return {
      basePower: parseInt(character.power),
      totalPower: parseInt(character.power) + bonuses.power,
      bonuses: bonuses
    };
  };

  // Remove item from inventory
  const removeFromInventory = (itemId) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="App">
      {inDungeon && selectedCharacter ? (
        <DungeonMap
          character={selectedCharacter}
          onExit={() => {
            setInDungeon(false);
            setSelectedCharacter(null);
          }}
          onLootCollected={handleLootCollected}
        />
      ) : inBattle && selectedCharacter ? (
        <BattleArena
          character={selectedCharacter}
          onExit={exitBattle}
          onLootCollected={handleLootCollected}
          equipment={getCharacterEquipment(selectedCharacter.id)}
          isBossBattle={isBossBattle}
          battleCounter={battleCounter}
        />
      ) : (
        <>
          <header className="App-header">
            <h1>Web3 Gacha Game - Battle Demo</h1>
            <p className="subtitle">Local test version - No wallet needed!</p>
          </header>

          <div className="container">
            <div className="account-info">
              <p><strong>Mode:</strong> Local Demo (No blockchain required)</p>
              <p><strong>Controls:</strong> Select a character below to start battle</p>
            </div>

            <div className="characters-section">
              <h2>Available Characters ({mockCharacters.length})</h2>
              <div className="characters-grid">
                {mockCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="character-card"
                    style={{ borderColor: getRarityColor(char.rarity) }}
                  >
                    <h3>{char.name}</h3>
                    <p className="rarity" style={{ color: getRarityColor(char.rarity) }}>
                      {char.rarity}
                    </p>
                    {(() => {
                      const stats = getCharacterStats(char);
                      const equipment = getCharacterEquipment(char.id);
                      return (
                        <>
                          <p className="power">
                            Base Power: {stats.basePower}
                            {stats.bonuses.power > 0 && (
                              <span style={{ color: '#4caf50', fontWeight: 'bold' }}> (+{stats.bonuses.power})</span>
                            )}
                          </p>
                          <p className="power" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f39c12' }}>
                            Total Power: {stats.totalPower}
                          </p>
                          <p className="attribute" style={{
                            color: getAttributeColor(char.attribute),
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            marginTop: '8px'
                          }}>
                            ⚡ {char.attribute}
                          </p>

                          <div style={{ marginTop: '12px', fontSize: '0.9rem', textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#ddd' }}>Equipment:</div>
                            <div style={{ color: equipment.weapon ? '#4caf50' : '#666' }}>
                              🗡️ Weapon: {equipment.weapon ? equipment.weapon.name : 'None'}
                            </div>
                            <div style={{ color: equipment.armor ? '#4caf50' : '#666' }}>
                              🛡️ Armor: {equipment.armor ? equipment.armor.name : 'None'}
                            </div>
                            <div style={{ color: equipment.accessory ? '#4caf50' : '#666' }}>
                              💍 Accessory: {equipment.accessory ? equipment.accessory.name : 'None'}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                    <p className="token-id">Character ID: #{char.id}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <button
                        className="battle-button"
                        style={{ flex: 1 }}
                        onClick={() => enterBattle(char)}
                      >
                        Battle
                      </button>
                      <button
                        className="battle-button"
                        style={{ flex: 1, background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)' }}
                        onClick={() => {
                          setSelectedCharacter(char);
                          setInDungeon(true);
                        }}
                      >
                        Dungeon
                      </button>
                      <button
                        className="battle-button"
                        style={{ flex: 1, background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' }}
                        onClick={() => {
                          setSelectedCharForEquip(char);
                          setShowInventory(true);
                        }}
                      >
                        Equip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '2rem',
              borderRadius: '15px',
              marginTop: '3rem',
              textAlign: 'center'
            }}>
              <h2 style={{ marginBottom: '1rem' }}>Battle Controls</h2>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <strong>W</strong> - Move Up
                </div>
                <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <strong>A</strong> - Move Left
                </div>
                <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <strong>S</strong> - Move Down
                </div>
                <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <strong>D</strong> - Move Right
                </div>
                <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <strong>SPACE</strong> - Attack
                </div>
                <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <strong>ESC</strong> - Exit Battle
                </div>
              </div>
            </div>
          </div>

          <footer>
            <p>Local Battle Demo - No MetaMask Required</p>
            <p className="probabilities">
              Inventory Items: {inventory.length} | Click "Equip" to manage character equipment!
            </p>
          </footer>

          {/* Inventory Modal */}
          {showInventory && selectedCharForEquip && (
            <div className="inventory-modal-overlay" onClick={() => setShowInventory(false)}>
              <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
                <div className="inventory-header">
                  <h2>Equipment Manager</h2>
                  <p>Managing: {selectedCharForEquip.name}</p>
                  <button className="close-button" onClick={() => setShowInventory(false)}>✕</button>
                </div>

                <div className="inventory-content">
                  {/* Currently Equipped */}
                  <div className="equipped-section">
                    <h3>Currently Equipped</h3>
                    {(() => {
                      const equipment = getCharacterEquipment(selectedCharForEquip.id);
                      const getRarityColor = (rarity) => ({
                        'Common': '#9e9e9e',
                        'Uncommon': '#4caf50',
                        'Rare': '#3498db',
                        'Epic': '#9c27b0',
                        'Legendary': '#ff9800'
                      }[rarity] || '#fff');

                      return (
                        <div className="equipped-slots">
                          {['weapon', 'armor', 'accessory'].map(slot => {
                            const item = equipment[slot];
                            return (
                              <div key={slot} className="equipped-slot">
                                <div className="slot-header">
                                  {slot === 'weapon' && '🗡️'}
                                  {slot === 'armor' && '🛡️'}
                                  {slot === 'accessory' && '💍'}
                                  {slot.toUpperCase()}
                                </div>
                                {item ? (
                                  <div className="equipped-item" style={{ borderColor: getRarityColor(item.rarity) }}>
                                    <div className="item-name" style={{ color: getRarityColor(item.rarity) }}>
                                      {item.name}
                                    </div>
                                    <div className="item-bonuses">
                                      +{item.bonuses.power} PWR | +{item.bonuses.health} HP | +{item.bonuses.mana} MP
                                    </div>
                                    <button
                                      className="unequip-button"
                                      onClick={() => unequipItem(selectedCharForEquip.id, slot)}
                                    >
                                      Unequip
                                    </button>
                                  </div>
                                ) : (
                                  <div className="empty-slot">Empty</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Inventory */}
                  <div className="inventory-section">
                    <h3>Inventory ({inventory.length} items)</h3>
                    {inventory.length === 0 ? (
                      <p className="no-items">No items yet. Win battles to get loot!</p>
                    ) : (
                      <div className="inventory-grid">
                        {inventory.map((item) => {
                          const getRarityColor = (rarity) => ({
                            'Common': '#9e9e9e',
                            'Uncommon': '#4caf50',
                            'Rare': '#3498db',
                            'Epic': '#9c27b0',
                            'Legendary': '#ff9800'
                          }[rarity] || '#fff');

                          const currentEquipment = getCharacterEquipment(selectedCharForEquip.id);
                          const isEquipped = currentEquipment[item.slot]?.id === item.id;

                          return (
                            <div key={item.id} className="inventory-item" style={{ borderColor: getRarityColor(item.rarity) }}>
                              <div className="item-name" style={{ color: getRarityColor(item.rarity) }}>
                                {item.name}
                              </div>
                              <div className="item-rarity" style={{ color: getRarityColor(item.rarity) }}>
                                {item.rarity}
                              </div>
                              <div className="item-slot">
                                {item.slot.toUpperCase()}
                              </div>
                              <div className="item-bonuses">
                                <div>Power: +{item.bonuses.power}</div>
                                <div>Health: +{item.bonuses.health}</div>
                                <div>Mana: +{item.bonuses.mana}</div>
                              </div>
                              {!isEquipped && (
                                <button
                                  className="equip-button"
                                  onClick={() => {
                                    const currentEquipment = getCharacterEquipment(selectedCharForEquip.id);
                                    const oldItem = currentEquipment[item.slot];

                                    // If there's already an item in this slot, return it to inventory
                                    if (oldItem) {
                                      setInventory(prev => [...prev, oldItem]);
                                    }

                                    // Equip the new item and remove it from inventory
                                    equipItem(selectedCharForEquip.id, item);
                                    removeFromInventory(item.id);
                                  }}
                                >
                                  Equip
                                </button>
                              )}
                              {isEquipped && (
                                <div className="equipped-badge">EQUIPPED</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LocalBattleDemo;
