import React, { useEffect, useRef, useState } from 'react';
import './BattleArena.css';

function BattleArena({ character, onExit, onLootCollected, equipment = {}, isBossBattle = false, battleCounter = 0, enemy = null }) {
  const canvasRef = useRef(null);
  const [lootScreen, setLootScreen] = useState(null);

  // Type advantages system (like Pokémon)
  const typeAdvantages = {
    'FIRE': { strong: ['EARTH'], weak: ['WATER'] },
    'WATER': { strong: ['FIRE'], weak: ['ELECTRIC'] },
    'ELECTRIC': { strong: ['WATER'], weak: ['EARTH'] },
    'EARTH': { strong: ['ELECTRIC'], weak: ['FIRE'] },
    'LIGHT': { strong: ['DARK'], weak: ['DARK'] },
    'DARK': { strong: ['LIGHT'], weak: ['LIGHT'] }
  };

  // Randomly assign enemy attribute that creates interesting matchup
  const getEnemyAttribute = () => {
    // If enemy prop is provided (from dungeon), use its attribute
    if (enemy && enemy.attribute) {
      return enemy.attribute;
    }

    const playerAttr = character.attribute || 'FIRE';
    const advantages = typeAdvantages[playerAttr];

    // 40% chance enemy has advantage, 40% disadvantage, 20% neutral
    const rand = Math.random();
    if (rand < 0.4 && advantages?.weak) {
      return advantages.weak[0];
    } else if (rand < 0.8 && advantages?.strong) {
      return advantages.strong[0];
    }
    return playerAttr; // neutral matchup
  };

  const enemyAttribute = getEnemyAttribute();

  const [gameState, setGameState] = useState({
    player: {
      x: 150,
      y: 300,
      width: 60,
      height: 60,
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      isAttacking: false,
      attackAnimation: 0,
      attribute: character.attribute || 'FIRE'
    },
    enemy: {
      x: 600,
      y: 300,
      width: enemy ? (enemy.isBoss || enemy.isFinalBoss ? 80 : 60) : (isBossBattle ? 80 : 60), // Bosses are larger
      height: enemy ? (enemy.isBoss || enemy.isFinalBoss ? 80 : 60) : (isBossBattle ? 80 : 60),
      health: enemy ? enemy.health : (isBossBattle ? 250 : 120), // Use enemy prop health if provided
      maxHealth: enemy ? enemy.maxHealth : (isBossBattle ? 250 : 120),
      isAttacking: false,
      attackAnimation: 0,
      attribute: enemyAttribute,
      name: enemy ? enemy.name : 'Shadow Enemy'
    },
    turn: 'player',
    selectedAttack: null,
    battleLog: [isBossBattle ? `⚔️ BOSS BATTLE! A powerful ${enemyAttribute} Boss appears! ⚔️` : `Battle started! Enemy is ${enemyAttribute} type!`],
    gameOver: false,
    victory: false,
    animating: false
  });

  // Calculate type effectiveness
  const getTypeEffectiveness = (attackerType, defenderType) => {
    if (!attackerType || !defenderType) return 1.0;

    const advantages = typeAdvantages[attackerType];
    if (!advantages) return 1.0;

    if (advantages.strong?.includes(defenderType)) {
      return 1.5; // Super effective
    } else if (advantages.weak?.includes(defenderType)) {
      return 0.75; // Not very effective
    }
    return 1.0; // Normal damage
  };

  // Loot generation system
  const generateLoot = () => {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    const slots = ['weapon', 'armor', 'accessory'];
    const weaponNames = ['Sword', 'Axe', 'Staff', 'Bow', 'Dagger'];
    const armorNames = ['Helmet', 'Chestplate', 'Shield', 'Boots', 'Gauntlets'];
    const accessoryNames = ['Ring', 'Amulet', 'Belt', 'Cloak', 'Bracelet'];

    // Boss battles have MUCH better loot chances
    const rand = Math.random() * 100;
    let rarity;

    if (isBossBattle) {
      // Boss battle rarity: Legendary 20%, Epic 35%, Rare 40%, Uncommon 5%, Common 0%
      if (rand < 20) rarity = 'Legendary';
      else if (rand < 55) rarity = 'Epic';
      else if (rand < 95) rarity = 'Rare';
      else rarity = 'Uncommon';
    } else {
      // Normal battle rarity: Common 50%, Uncommon 30%, Rare 15%, Epic 4%, Legendary 1%
      if (rand < 1) rarity = 'Legendary';
      else if (rand < 5) rarity = 'Epic';
      else if (rand < 20) rarity = 'Rare';
      else if (rand < 50) rarity = 'Uncommon';
      else rarity = 'Common';
    }

    const slot = slots[Math.floor(Math.random() * slots.length)];
    let itemName;

    if (slot === 'weapon') {
      itemName = weaponNames[Math.floor(Math.random() * weaponNames.length)];
    } else if (slot === 'armor') {
      itemName = armorNames[Math.floor(Math.random() * armorNames.length)];
    } else {
      itemName = accessoryNames[Math.floor(Math.random() * accessoryNames.length)];
    }

    // Calculate stat bonuses based on rarity
    const rarityMultiplier = {
      'Common': 1,
      'Uncommon': 1.5,
      'Rare': 2,
      'Epic': 3,
      'Legendary': 5
    };

    const mult = rarityMultiplier[rarity];

    return {
      id: Date.now() + Math.random(),
      name: `${rarity} ${itemName}`,
      slot: slot,
      rarity: rarity,
      bonuses: {
        power: Math.floor((5 + Math.random() * 10) * mult),
        health: Math.floor((3 + Math.random() * 7) * mult),
        mana: Math.floor((2 + Math.random() * 5) * mult)
      }
    };
  };

  const attacks = [
    {
      name: 'Quick Strike',
      damage: Math.floor(parseInt(character.power) / 20) + 10,
      manaCost: 0,
      effect: 'Fast attack with moderate damage',
      color: '#f39c12'
    },
    {
      name: 'Power Slam',
      damage: Math.floor(parseInt(character.power) / 10) + 20,
      manaCost: 30,
      effect: 'Heavy attack with high damage',
      color: '#e74c3c'
    },
    {
      name: 'Magic Burst',
      damage: Math.floor(parseInt(character.power) / 15) + 15,
      manaCost: 20,
      effect: 'Magical attack that also restores 10 HP',
      color: '#9b59b6',
      heal: 10
    }
  ];

  // Player attack
  const performPlayerAttack = (attack) => {
    if (gameState.animating || gameState.turn !== 'player' || gameState.gameOver) return;
    if (gameState.player.mana < attack.manaCost) {
      addToBattleLog('Not enough mana!');
      return;
    }

    setGameState(prev => ({
      ...prev,
      animating: true,
      player: { ...prev.player, isAttacking: true, mana: prev.player.mana - attack.manaCost }
    }));

    setTimeout(() => {
      // Calculate type effectiveness
      const effectiveness = getTypeEffectiveness(gameState.player.attribute, gameState.enemy.attribute);
      const baseDamage = attack.damage;
      const damage = Math.floor(baseDamage * effectiveness);
      const newEnemyHealth = Math.max(0, gameState.enemy.health - damage);
      const healAmount = attack.heal || 0;
      const newPlayerHealth = Math.min(gameState.player.maxHealth, gameState.player.health + healAmount);

      let logMessage = `You used ${attack.name}! Dealt ${damage} damage.`;

      // Add effectiveness message
      if (effectiveness > 1.0) {
        logMessage += ' It\'s super effective!';
      } else if (effectiveness < 1.0) {
        logMessage += ' It\'s not very effective...';
      }

      if (healAmount > 0) {
        logMessage += ` Restored ${healAmount} HP.`;
      }
      addToBattleLog(logMessage);

      setGameState(prev => ({
        ...prev,
        enemy: { ...prev.enemy, health: newEnemyHealth },
        player: { ...prev.player, isAttacking: false, health: newPlayerHealth },
        animating: false
      }));

      if (newEnemyHealth <= 0) {
        setTimeout(() => {
          addToBattleLog('Victory! You defeated the enemy!');
          setGameState(prev => ({ ...prev, gameOver: true, victory: true }));

          // Generate loot after a short delay
          setTimeout(() => {
            const loot = generateLoot();
            setLootScreen(loot);
          }, 1000);
        }, 500);
      } else {
        setTimeout(() => {
          performEnemyTurn();
        }, 1000);
      }
    }, 600);
  };

  // Enemy turn
  const performEnemyTurn = () => {
    setGameState(prev => ({
      ...prev,
      turn: 'enemy',
      animating: true,
      enemy: { ...prev.enemy, isAttacking: true }
    }));

    setTimeout(() => {
      // Calculate type effectiveness for enemy attack
      const effectiveness = getTypeEffectiveness(gameState.enemy.attribute, gameState.player.attribute);
      const baseDamage = 10 + Math.floor(Math.random() * 15);
      const damage = Math.floor(baseDamage * effectiveness);
      const newPlayerHealth = Math.max(0, gameState.player.health - damage);

      let logMessage = `Enemy attacked! Dealt ${damage} damage.`;
      if (effectiveness > 1.0) {
        logMessage += ' It\'s super effective!';
      } else if (effectiveness < 1.0) {
        logMessage += ' It\'s not very effective...';
      }
      addToBattleLog(logMessage);

      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: newPlayerHealth,
          mana: Math.min(prev.player.maxMana, prev.player.mana + 15)
        },
        enemy: { ...prev.enemy, isAttacking: false },
        turn: 'player',
        animating: false
      }));

      if (newPlayerHealth <= 0) {
        setTimeout(() => {
          addToBattleLog('Defeat! You were defeated...');
          setGameState(prev => ({ ...prev, gameOver: true, victory: false }));
        }, 500);
      }
    }, 800);
  };

  const addToBattleLog = (message) => {
    setGameState(prev => ({
      ...prev,
      battleLog: [...prev.battleLog.slice(-4), message]
    }));
  };

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const drawGame = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern
      ctx.strokeStyle = '#16213e';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw player
      const playerColor = getRarityColor(character.rarity);
      ctx.fillStyle = playerColor;
      if (gameState.player.isAttacking) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = playerColor;
      }
      ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

      // Draw player health bar
      drawHealthBar(ctx, gameState.player.x, gameState.player.y - 30, gameState.player.width,
        gameState.player.health, gameState.player.maxHealth, '#4caf50');

      // Draw player mana bar
      drawManaBar(ctx, gameState.player.x, gameState.player.y - 18, gameState.player.width,
        gameState.player.mana, gameState.player.maxMana, '#3498db');

      // Draw player attribute label
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = getAttributeColor(gameState.player.attribute);
      ctx.fillText(gameState.player.attribute, gameState.player.x + gameState.player.width / 2, gameState.player.y + gameState.player.height + 15);

      // Draw enemy
      ctx.fillStyle = '#e74c3c';
      if (gameState.enemy.isAttacking) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#e74c3c';
      }
      ctx.fillRect(gameState.enemy.x, gameState.enemy.y, gameState.enemy.width, gameState.enemy.height);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 3;
      ctx.strokeRect(gameState.enemy.x, gameState.enemy.y, gameState.enemy.width, gameState.enemy.height);

      // Draw enemy health bar
      drawHealthBar(ctx, gameState.enemy.x, gameState.enemy.y - 30, gameState.enemy.width,
        gameState.enemy.health, gameState.enemy.maxHealth, '#e74c3c');

      // Draw enemy attribute label
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = getAttributeColor(gameState.enemy.attribute);
      ctx.fillText(gameState.enemy.attribute, gameState.enemy.x + gameState.enemy.width / 2, gameState.enemy.y + gameState.enemy.height + 15);

      // Draw turn indicator
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      if (gameState.turn === 'player' && !gameState.gameOver) {
        ctx.fillStyle = '#4caf50';
        ctx.fillText('YOUR TURN', canvas.width / 2, 50);
      } else if (gameState.turn === 'enemy' && !gameState.gameOver) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillText('ENEMY TURN', canvas.width / 2, 50);
      }

      // Draw attack lines during animation
      if (gameState.player.isAttacking) {
        ctx.strokeStyle = playerColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(gameState.player.x + gameState.player.width, gameState.player.y + gameState.player.height / 2);
        ctx.lineTo(gameState.enemy.x, gameState.enemy.y + gameState.enemy.height / 2);
        ctx.stroke();
      }

      if (gameState.enemy.isAttacking) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(gameState.enemy.x, gameState.enemy.y + gameState.enemy.height / 2);
        ctx.lineTo(gameState.player.x + gameState.player.width, gameState.player.y + gameState.player.height / 2);
        ctx.stroke();
      }

      // Draw game over text
      if (gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = gameState.victory ? '#4caf50' : '#e74c3c';
        ctx.fillText(gameState.victory ? 'VICTORY!' : 'DEFEAT!', canvas.width / 2, canvas.height / 2);

        ctx.font = '24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Press ESC to exit', canvas.width / 2, canvas.height / 2 + 50);
      }
    };

    const drawHealthBar = (ctx, x, y, width, health, maxHealth, color) => {
      const healthPercent = Math.max(0, health / maxHealth);

      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(x, y, width, 10);

      // Health
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width * healthPercent, 10);

      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, 10);

      // Text
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(health)}/${maxHealth}`, x + width / 2, y + 9);
    };

    const drawManaBar = (ctx, x, y, width, mana, maxMana, color) => {
      const manaPercent = Math.max(0, mana / maxMana);

      // Background
      ctx.fillStyle = '#222';
      ctx.fillRect(x, y, width, 8);

      // Mana
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width * manaPercent, 8);

      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, 8);
    };

    const getRarityColor = (rarity) => {
      const colors = {
        'COMMON': '#9e9e9e',
        'RARE': '#4caf50',
        'EPIC': '#9c27b0',
        'LEGENDARY': '#ff9800'
      };
      return colors[rarity] || '#fff';
    };

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

    // Handle ESC key to exit
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleEscape);

    // Animation loop
    const animate = () => {
      drawGame();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('keydown', handleEscape);
      cancelAnimationFrame(animationId);
    };
  }, [gameState, character, onExit]);

  // Handle loot collection
  const collectLoot = () => {
    if (lootScreen && onLootCollected) {
      onLootCollected(lootScreen);
    }
    onExit();
  };

  // Handle loot rejection
  const rejectLoot = () => {
    // Exit without collecting the loot
    onExit();
  };

  // Show loot screen if available
  if (lootScreen) {
    const rarityColors = {
      'Common': '#9e9e9e',
      'Uncommon': '#4caf50',
      'Rare': '#3498db',
      'Epic': '#9c27b0',
      'Legendary': '#ff9800'
    };

    return (
      <div className="battle-arena">
        <div className="loot-screen">
          <h1 className="loot-title">Victory!</h1>
          <h2 className="loot-subtitle">You found loot!</h2>

          <div className="loot-card" style={{ borderColor: rarityColors[lootScreen.rarity] }}>
            <div className="loot-name" style={{ color: rarityColors[lootScreen.rarity] }}>
              {lootScreen.name}
            </div>
            <div className="loot-rarity" style={{ color: rarityColors[lootScreen.rarity] }}>
              {lootScreen.rarity}
            </div>
            <div className="loot-slot">
              Slot: {lootScreen.slot.toUpperCase()}
            </div>
            <div className="loot-bonuses">
              <h3>Stat Bonuses:</h3>
              <div className="bonus-list">
                <div className="bonus-item">
                  <span className="bonus-label">Power:</span>
                  <span className="bonus-value">+{lootScreen.bonuses.power}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">Health:</span>
                  <span className="bonus-value">+{lootScreen.bonuses.health}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">Mana:</span>
                  <span className="bonus-value">+{lootScreen.bonuses.mana}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="loot-buttons">
            <button className="loot-collect-button" onClick={collectLoot}>
              Collect & Continue
            </button>
            <button className="loot-reject-button" onClick={rejectLoot}>
              Discard Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-arena">
      <div className={`battle-header ${isBossBattle || (enemy && (enemy.isBoss || enemy.isFinalBoss)) ? 'boss-battle-header' : ''}`}>
        {(isBossBattle || (enemy && (enemy.isBoss || enemy.isFinalBoss))) && (
          <div className="boss-battle-banner">
            👑 {enemy && enemy.isFinalBoss ? 'FINAL BOSS BATTLE' : isBossBattle ? `BOSS BATTLE #${Math.floor(battleCounter / 5)}` : 'BOSS BATTLE'} 👑
          </div>
        )}
        <h2>{character.name} vs {gameState.enemy.name}</h2>
        {(isBossBattle || (enemy && (enemy.isBoss || enemy.isFinalBoss))) && (
          <div className="boss-warning">
            ⚠️ Powerful enemy with increased health! ⚠️
          </div>
        )}
        <div className="turn-indicator">
          {gameState.turn === 'player' && !gameState.gameOver && (
            <span className="player-turn">Your Turn - Choose an attack!</span>
          )}
          {gameState.turn === 'enemy' && !gameState.gameOver && (
            <span className="enemy-turn">Enemy is attacking...</span>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="game-canvas"
      />

      <div className="battle-controls">
        <div className="attack-buttons">
          {attacks.map((attack, index) => (
            <button
              key={index}
              className="attack-button"
              style={{
                borderColor: attack.color,
                opacity: gameState.turn !== 'player' || gameState.animating || gameState.gameOver || gameState.player.mana < attack.manaCost ? 0.5 : 1
              }}
              onClick={() => performPlayerAttack(attack)}
              disabled={gameState.turn !== 'player' || gameState.animating || gameState.gameOver || gameState.player.mana < attack.manaCost}
            >
              <div className="attack-name" style={{ color: attack.color }}>{attack.name}</div>
              <div className="attack-info">
                <span className="attack-damage">Damage: {attack.damage}</span>
                <span className="attack-mana">Mana: {attack.manaCost}</span>
              </div>
              <div className="attack-effect">{attack.effect}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="battle-log">
        <h3>Battle Log</h3>
        <div className="log-messages">
          {gameState.battleLog.map((log, index) => (
            <div key={index} className="log-message">{log}</div>
          ))}
        </div>
      </div>

      <div className="battle-stats">
        <div className="stat">
          <strong>Your Type:</strong> <span style={{ color: getAttributeColorHex(gameState.player.attribute) }}>
            {gameState.player.attribute}
          </span>
        </div>
        <div className="stat">
          <strong>Enemy Type:</strong> <span style={{ color: getAttributeColorHex(gameState.enemy.attribute) }}>
            {gameState.enemy.attribute}
          </span>
        </div>
        <div className="stat">
          <strong>Power:</strong> {character.power}
        </div>
        <div className="stat">
          <strong>Rarity:</strong> <span style={{ color: getRarityColorHex(character.rarity) }}>
            {character.rarity}
          </span>
        </div>
        <div className="stat">
          <strong>Press ESC to exit</strong>
        </div>
      </div>
    </div>
  );
}

const getRarityColorHex = (rarity) => {
  const colors = {
    'COMMON': '#9e9e9e',
    'RARE': '#4caf50',
    'EPIC': '#9c27b0',
    'LEGENDARY': '#ff9800'
  };
  return colors[rarity] || '#fff';
};

const getAttributeColorHex = (attribute) => {
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

export default BattleArena;
