import React, { useState, useEffect, useRef } from 'react';
import './DungeonMap.css';
import BattleArena from './BattleArena';

function DungeonMap({ character, onExit, onLootCollected }) {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [inBattle, setInBattle] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [dungeonCleared, setDungeonCleared] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });

  // Helper function for attribute colors (must be defined early)
  const getAttributeColor = (attribute) => {
    const colors = {
      'FIRE': '#ff6b35',
      'WATER': '#3498db',
      'EARTH': '#8b6914',
      'ELECTRIC': '#f1c40f',
      'DARK': '#9b59b6',
      'LIGHT': '#f1c40f'
    };
    return colors[attribute] || '#fff';
  };

  // Dungeon configurations
  const dungeons = [
    {
      id: 1,
      name: 'Shadow Crypt',
      floors: 3,
      theme: 'DARK',
      description: 'A cursed crypt filled with undead creatures',
      bossNames: ['Skeleton King', 'Lich Lord', 'Death Knight']
    },
    {
      id: 2,
      name: 'Volcanic Depths',
      floors: 4,
      theme: 'FIRE',
      description: 'Scorching caves with lava flows',
      bossNames: ['Fire Golem', 'Magma Wyrm', 'Inferno Dragon', 'Molten Titan']
    },
    {
      id: 3,
      name: 'Frozen Sanctum',
      floors: 3,
      theme: 'WATER',
      description: 'An icy fortress frozen in time',
      bossNames: ['Ice Wraith', 'Frost Giant', 'Blizzard Elemental']
    },
    {
      id: 4,
      name: 'Thunder Spire',
      floors: 5,
      theme: 'ELECTRIC',
      description: 'A tower crackling with electrical energy',
      bossNames: ['Storm Sentinel', 'Lightning Behemoth', 'Thunder Bird', 'Voltage Colossus', 'Tempest Overlord']
    },
    {
      id: 5,
      name: 'Sacred Temple',
      floors: 3,
      theme: 'LIGHT',
      description: 'A holy place corrupted by darkness',
      bossNames: ['Fallen Crusader', 'Corrupted Saint', 'Twilight Avatar']
    },
    {
      id: 6,
      name: 'Crystal Caverns',
      floors: 4,
      theme: 'EARTH',
      description: 'Deep underground caves of precious minerals',
      bossNames: ['Rock Guardian', 'Crystal Golem', 'Earth Titan', 'Ancient Colossus']
    }
  ];

  const [selectedDungeon, setSelectedDungeon] = useState(null);

  // Generate random boss based on floor and dungeon theme
  const generateBoss = (floor, dungeon) => {
    const powerMultiplier = floor * 1.5;
    const bossName = dungeon.bossNames[floor - 1] || 'Ancient Guardian';

    // Boss gets stronger on higher floors
    const basePower = 200 + (floor * 150);
    const baseHealth = 300 + (floor * 200);

    // Determine if it's a final boss
    const isFinalBoss = floor === dungeon.floors;

    return {
      name: isFinalBoss ? `${bossName} (FINAL BOSS)` : bossName,
      power: Math.floor(basePower * (isFinalBoss ? 1.5 : 1)),
      health: Math.floor(baseHealth * (isFinalBoss ? 2 : 1)),
      maxHealth: Math.floor(baseHealth * (isFinalBoss ? 2 : 1)),
      mana: 100,
      maxMana: 100,
      attribute: dungeon.theme,
      isBoss: true,
      isFinalBoss: isFinalBoss,
      specialAbility: generateBossAbility(dungeon.theme, isFinalBoss)
    };
  };

  // Generate special abilities for bosses
  const generateBossAbility = (theme, isFinalBoss) => {
    const abilities = {
      FIRE: isFinalBoss ? 'Inferno Apocalypse' : 'Flame Strike',
      WATER: isFinalBoss ? 'Tidal Devastation' : 'Ice Shard',
      ELECTRIC: isFinalBoss ? 'Divine Thunder' : 'Chain Lightning',
      EARTH: isFinalBoss ? 'Earthquake Cataclysm' : 'Boulder Crush',
      DARK: isFinalBoss ? 'Void Annihilation' : 'Shadow Blast',
      LIGHT: isFinalBoss ? 'Celestial Judgment' : 'Holy Smite'
    };
    return abilities[theme] || 'Power Strike';
  };

  // Generate 5x5 dungeon map grid
  const generateMap = (floor = currentFloor, dungeon = selectedDungeon) => {
    if (!dungeon) return [];

    const map = [];
    for (let y = 0; y < 5; y++) {
      const row = [];
      for (let x = 0; x < 5; x++) {
        // Start position
        if (x === 1 && y === 1) {
          row.push('S'); // Start
        }
        // Boss position (always in a corner or center)
        else if (x === 3 && y === 3 && floor === dungeon.floors) {
          row.push('B'); // Final Boss
        }
        else if (x === 3 && y === 3) {
          row.push('N'); // Next floor
        }
        // Random enemies and treasures
        else if (Math.random() < 0.3) {
          row.push('E'); // Enemy
        }
        else if (Math.random() < 0.1) {
          row.push('T'); // Treasure
        }
        else {
          row.push('.'); // Empty
        }
      }
      map.push(row);
    }
    return map;
  };

  const [dungeonMap, setDungeonMap] = useState([]);

  // Generate map when floor changes or dungeon is selected
  useEffect(() => {
    if (selectedDungeon) {
      console.log(`Generating new map for floor ${currentFloor}`);
      const newMap = generateMap(currentFloor, selectedDungeon);
      setDungeonMap(newMap);
      setPlayerPosition({ x: 1, y: 1 });
      console.log(`Map generated for ${selectedDungeon.name} Floor ${currentFloor}/${selectedDungeon.floors}`);
    }
  }, [currentFloor, selectedDungeon]);

  // Handle movement with WASD
  useEffect(() => {
    if (!selectedDungeon || inBattle) return;

    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      let newX = playerPosition.x;
      let newY = playerPosition.y;

      if (key === 'w' && playerPosition.y > 0) newY--;
      else if (key === 's' && playerPosition.y < 4) newY++;
      else if (key === 'a' && playerPosition.x > 0) newX--;
      else if (key === 'd' && playerPosition.x < 4) newX++;

      if (newX !== playerPosition.x || newY !== playerPosition.y) {
        setPlayerPosition({ x: newX, y: newY });
        checkTile(newX, newY);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPosition, selectedDungeon, inBattle, dungeonMap]);

  // Check what's on the tile
  const checkTile = (x, y) => {
    const tile = dungeonMap[y][x];
    console.log(`Player moved to (${x}, ${y}), tile type: '${tile}'`);

    if (tile === 'E') {
      // Random enemy encounter
      const enemy = generateBoss(currentFloor, selectedDungeon);
      enemy.isBoss = false;
      enemy.isFinalBoss = false;
      enemy.name = `${selectedDungeon.theme} Minion`;
      enemy.power = Math.floor(enemy.power * 0.5);
      enemy.health = Math.floor(enemy.health * 0.6);
      enemy.maxHealth = Math.floor(enemy.maxHealth * 0.6);
      setCurrentEnemy(enemy);
      setInBattle(true);

      // Remove enemy from map
      const newMap = [...dungeonMap];
      newMap[y][x] = '.';
      setDungeonMap(newMap);
    }
    else if (tile === 'B') {
      // Final Boss battle - remove the tile first
      const newMap = [...dungeonMap];
      newMap[y][x] = '.';
      setDungeonMap(newMap);

      // Start final boss battle
      const boss = generateBoss(currentFloor, selectedDungeon);
      setCurrentEnemy(boss);
      setInBattle(true);
    }
    else if (tile === 'N') {
      // Next floor - remove the tile first to prevent re-triggering
      const newMap = [...dungeonMap];
      newMap[y][x] = '.';
      setDungeonMap(newMap);

      // Start guardian battle
      const boss = generateBoss(currentFloor, selectedDungeon);
      const guardianEnemy = {
        ...boss,
        name: `Floor ${currentFloor} Guardian`,
        isGuardian: true
      };
      console.log('Starting guardian battle:', guardianEnemy.name);
      setCurrentEnemy(guardianEnemy);
      setInBattle(true);
    }
    else if (tile === 'T') {
      // Treasure found - generate bonus loot
      alert('Treasure found! You got bonus loot!');
      // Remove treasure from map
      const newMap = [...dungeonMap];
      newMap[y][x] = '.';
      setDungeonMap(newMap);
    }
  };

  const handleBattleEnd = (victory, loot) => {
    const enemyInfo = currentEnemy ? {
      name: currentEnemy.name,
      isFinalBoss: currentEnemy.isFinalBoss,
      isGuardian: currentEnemy.isGuardian
    } : null;

    console.log('=== BATTLE END ===');
    console.log('Victory:', victory);
    console.log('Enemy Info:', enemyInfo);
    console.log('Current Floor:', currentFloor);
    console.log('Max Floors:', selectedDungeon?.floors);

    if (victory) {
      // Pass loot to parent first
      if (loot && onLootCollected) {
        onLootCollected(loot);
      }

      // Check if final boss
      if (currentEnemy && currentEnemy.isFinalBoss) {
        console.log('Final boss defeated!');
        alert(`Congratulations! You cleared ${selectedDungeon.name}!`);
        setDungeonCleared(true);
        setInBattle(false);
      }
      // Check if floor guardian
      else if (currentEnemy && (currentEnemy.isGuardian || (currentEnemy.name && currentEnemy.name.includes('Guardian')))) {
        console.log('Floor Guardian defeated!');
        // Advance to next floor
        if (currentFloor < selectedDungeon.floors) {
          alert(`Floor ${currentFloor} cleared! Advancing to Floor ${currentFloor + 1}...`);
          setInBattle(false);
          setCurrentFloor(currentFloor + 1);
        } else {
          setInBattle(false);
        }
      } else {
        // Regular enemy defeated, return to same map
        console.log('>>> Regular enemy defeated');
        setInBattle(false);
      }
    } else {
      // Player lost - exit dungeon
      console.log('>>> Player defeated');
      setInBattle(false);
      alert('You were defeated! Returning to town...');
      onExit();
    }
  };

  const selectDungeon = (dungeon) => {
    setSelectedDungeon(dungeon);
    setCurrentFloor(1);
    setDungeonCleared(false);
  };

  const exitDungeon = () => {
    setSelectedDungeon(null);
    setCurrentFloor(1);
    setDungeonCleared(false);
    onExit();
  };

  const getTileDisplay = (tile, x, y) => {
    if (x === playerPosition.x && y === playerPosition.y) {
      return '🧙'; // Player
    }

    switch(tile) {
      case 'S': return '🚪'; // Start
      case 'B': return '👹'; // Boss
      case 'N': return '🔽'; // Next floor
      case 'E': return '👾'; // Enemy
      case 'T': return '💎'; // Treasure
      default: return '·';
    }
  };

  if (inBattle && currentEnemy) {
    return (
      <BattleArena
        character={character}
        enemy={currentEnemy}
        onExit={() => handleBattleEnd(false, null)}
        onLootCollected={(loot) => handleBattleEnd(true, loot)}
      />
    );
  }

  if (dungeonCleared) {
    return (
      <div className="dungeon-cleared">
        <h1>🏆 DUNGEON CLEARED! 🏆</h1>
        <h2>{selectedDungeon.name}</h2>
        <p>You have conquered all {selectedDungeon.floors} floors!</p>
        <button className="exit-button" onClick={exitDungeon}>
          Return to Town
        </button>
      </div>
    );
  }

  if (!selectedDungeon) {
    return (
      <div className="dungeon-selection">
        <h1>🗺️ Select a Dungeon</h1>
        <div className="dungeon-list">
          {dungeons.map(dungeon => (
            <div
              key={dungeon.id}
              className="dungeon-card"
              onClick={() => selectDungeon(dungeon)}
              style={{ borderColor: getAttributeColor(dungeon.theme) }}
            >
              <h2>{dungeon.name}</h2>
              <div className="dungeon-info">
                <div className="dungeon-theme" style={{ color: getAttributeColor(dungeon.theme) }}>
                  {dungeon.theme}
                </div>
                <div className="dungeon-floors">Floors: {dungeon.floors}</div>
              </div>
              <p className="dungeon-description">{dungeon.description}</p>
              <div className="boss-preview">
                <strong>Bosses:</strong>
                <div className="boss-list">
                  {dungeon.bossNames.map((boss, idx) => (
                    <span key={idx} className="boss-name">
                      {idx === dungeon.bossNames.length - 1 ? `👑 ${boss}` : boss}
                    </span>
                  ))}
                </div>
              </div>
              {dungeonProgress[dungeon.id] && (
                <div className="dungeon-progress">
                  📍 Progress Saved: Floor {dungeonProgress[dungeon.id].floor}
                </div>
              )}
              <button className="enter-button">Enter Dungeon</button>
              {dungeonProgress[dungeon.id] && (
                <button
                  className="reset-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newProgress = { ...dungeonProgress };
                    delete newProgress[dungeon.id];
                    setDungeonProgress(newProgress);
                    localStorage.setItem('dungeonProgress', JSON.stringify(newProgress));
                  }}
                >
                  Reset Progress
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="back-button" onClick={onExit}>
          Back to Character Selection
        </button>
      </div>
    );
  }

  return (
    <div className="dungeon-container">
      <div className="dungeon-header">
        <h1>{selectedDungeon.name}</h1>
        <div className="floor-info">
          Floor {currentFloor} / {selectedDungeon.floors} {isTransitioningFloor && '(Transitioning...)'}
        </div>
        <button className="exit-button" onClick={exitDungeon}>
          Exit Dungeon
        </button>
      </div>
      <div style={{ padding: '10px', background: 'rgba(255,0,0,0.2)', color: 'white', textAlign: 'center', fontSize: '12px' }}>
        <div>DEBUG: currentFloor={currentFloor}, mapGenerated={mapGenerated.toString()}, isTransitioningFloor={isTransitioningFloor.toString()}</div>
        <div>savedFloor={dungeonProgress[selectedDungeon?.id]?.floor || 'none'}, inBattle={inBattle.toString()}</div>
        <div>mapSize={dungeonMap.length}x{dungeonMap[0]?.length || 0}, position=({playerPosition.x},{playerPosition.y})</div>
      </div>

      <div className="dungeon-info-bar">
        <div className="player-info">
          <strong>{character.name}</strong>
          <span className="player-attribute" style={{ color: getAttributeColor(character.attribute) }}>
            {character.attribute}
          </span>
        </div>
        <div className="controls-hint">
          Use WASD to move
        </div>
      </div>

      <div className="dungeon-map">
        {dungeonMap.map((row, y) => (
          <div key={y} className="map-row">
            {row.map((tile, x) => (
              <div
                key={`${x}-${y}`}
                className={`map-tile ${x === playerPosition.x && y === playerPosition.y ? 'player-tile' : ''}`}
              >
                {getTileDisplay(tile, x, y)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="map-legend">
        <div className="legend-item">🧙 You</div>
        <div className="legend-item">👾 Enemy</div>
        <div className="legend-item">👹 Boss</div>
        <div className="legend-item">💎 Treasure</div>
        <div className="legend-item">🔽 Next Floor</div>
        <div className="legend-item">🚪 Start</div>
      </div>
    </div>
  );
}

export default DungeonMap;
