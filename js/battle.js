// battle.js: 戦闘画面のロジック、ゲームサイクル、カード処理

const partyHPBar = document.getElementById('partyHPBar');
const partyHPText = document.getElementById('partyHPText');
const partyBuffsContainer = document.getElementById('partyBuffs');
const currentCostSpan = document.getElementById('currentCost');
const handCardsContainer = document.getElementById('handCards');
const soulScreamIcon = document.getElementById('soulScreamIcon');
const soulBarFill = document.getElementById('soulBarFill');
const soulScreamProgress = document.getElementById('soulScreamProgress');
const endTurnButton = document.getElementById('endTurnButton');
const enemyHPBar = document.getElementById('enemyHPBar');
const enemyNameH3 = document.getElementById('enemyName');
const enemyNextActionDiv = document.getElementById('enemyNextAction');
const partyMembersDiv = document.getElementById('partyMembers');
const handCountSpan = document.getElementById('handCount');
const deckCountSpan = document.getElementById('deckCount');
const discardCountSpan = document.getElementById('discardCount');

// 敵の状態
let currentEnemy = null;
let enemyState = {
    currentHP: 0,
    maxHP: 0,
    nextActionIndex: 0,
    buffs: { 力: 0, 軟化: 0, 力減少: 0 },
};

// ゲームヘルパー関数 (main.jsからも参照される)
game.addShield = (amount) => {
    game.partyState.shield += amount;
    updateUI();
};

game.damageEnemy = (baseDamage) => {
    let damage = Math.max(0, baseDamage + enemyState.buffs.軟化);
    damage = Math.floor(damage);
    enemyState.currentHP = Math.max(0, enemyState.currentHP - damage);
    
    // 魂の震え獲得（与えたダメージに応じて）- 攻撃を受ける毎のロジックと分けて簡易化
    // 今回は攻撃カード使用時に一律で 1 溜まるロジックを一時的に採用
    game.addSoulCharge(1); 
    
    updateUI();
    if (enemyState.currentHP <= 0) {
        endBattle('win');
    }
};

game.takeDamage = (baseDamage) => {
    let damage = Math.max(0, baseDamage - game.partyState.buffs.防御強化);
    
    if (game.partyState.shield > 0) {
        const takenFromShield = Math.min(damage, game.partyState.shield);
        game.partyState.shield -= takenFromShield;
        damage -= takenFromShield;
    }
    
    if (damage > 0) {
        game.partyState.currentHP -= damage;
        // 攻撃を受ける毎に魂の震えが全キャラ1溜まる (4体入れば合計4溜まる)
        game.addSoulCharge(game.party.length);
    }
    
    updateUI();
    if (game.partyState.currentHP <= 0) {
        endBattle('lose');
    }
};

game.addBuff = (name, amount, duration) => {
    if (!game.partyState.buffs[name]) game.partyState.buffs[name] = 0;
    game.partyState.buffs[name] += amount;
    
    // durationがnullの場合は永続
    if (duration !== null) {
        if (!game.partyState.buffs.durations) game.partyState.buffs.durations = {};
        if (!game.partyState.buffs.durations[name]) game.partyState.buffs.durations[name] = 0;
        game.partyState.buffs.durations[name] += duration;
    } else {
        // 永続バフは duration を持たない
    }
    updateUI();
};

game.addEnemyDebuff = (name, amount, duration) => {
    if (!enemyState.buffs[name]) enemyState.buffs[name] = 0;
    enemyState.buffs[name] += amount;
    
    if (duration !== null) {
        if (!enemyState.buffs.durations) enemyState.buffs.durations = {};
        if (!enemyState.buffs.durations[name]) enemyState.buffs.durations[name] = 0;
        enemyState.buffs.durations[name] += duration;
    }
    updateUI();
};

game.addSoulCharge = (amount) => {
    game.partyState.soulCharge = Math.min(100, game.partyState.soulCharge + amount);
    updateUI();
};

game.drawCards = (count) => {
    for (let i = 0; i < count; i++) {
        if (game.gameState.deck.length === 0) {
            if (game.gameState.discard.length > 0) {
                shuffleDeck();
            } else {
                break; // デッキも捨て札もない
            }
        }
        
        const card = game.gameState.deck.pop();
        if (card) {
            game.gameState.hand.push(card);
        }
    }
    updateUI();
};

game.restoreCost = (amount) => {
    game.gameState.cost = Math.min(game.gameState.maxCost, game.gameState.cost + amount);
    updateUI();
};

// UI更新関数
const updateUI = () => {
    // HPバー
    const partyPercent = (game.partyState.currentHP / game.partyState.maxHP) * 100;
    partyHPBar.style.width = `${partyPercent}%`;
    partyHPText.textContent = `HP: ${game.partyState.currentHP}/${game.partyState.maxHP}`;

    if (currentEnemy) {
        const enemyPercent = (enemyState.currentHP / enemyState.maxHP) * 100;
        enemyHPBar.style.width = `${enemyPercent}%`;
        
        // 敵の次の行動アイコン
        renderEnemyNextAction();
    }
    
    // コスト
    currentCostSpan.textContent = game.gameState.cost;
    
    // 魂の叫び
    const soulPercent = game.partyState.soulCharge;
    soulBarFill.style.width = `${soulPercent}%`;
    soulScreamProgress.textContent = `${soulPercent}%`;
    soulScreamIcon.classList.toggle('ready', game.partyState.soulCharge === 100);

    // デッキ情報
    handCountSpan.textContent = `手札: ${game.gameState.hand.length}`;
    deckCountSpan.textContent = `山札: ${game.gameState.deck.length}`;
    discardCountSpan.textContent = `捨て札: ${game.gameState.discard.length}`;

    // バフ/デバフ
    renderBuffsDebuffs();
    
    // カード
    renderHandCards();
    
    // シールド
    renderPartyShield();
};

// 敵の次の行動アイコン表示
const renderEnemyNextAction = () => {
    enemyNextActionDiv.innerHTML = '';
    const action = currentEnemy.actions[enemyState.nextActionIndex];
    if (action) {
        const actionType = ENEMY_ACTIONS[action.type];
        enemyNextActionDiv.innerHTML = actionType.icon;
        enemyNextActionDiv.title = actionType.desc(action.value);
    }
};

// カード表示
const renderHandCards = () => {
    handCardsContainer.innerHTML = '';
    game.gameState.hand.forEach((card, index) => {
        const cardData = ALL_CARDS[card.name];
        const currentCost = cardData.cost - game.partyState.buffs.コスト減少;
        const playable = game.gameState.cost >= Math.max(0, currentCost);

        const cardElement = document.createElement('div');
        cardElement.className = `card draggable ${playable ? 'playable' : ''}`;
        cardElement.setAttribute('data-index', index);
        cardElement.innerHTML = `
            <span class="card-cost">${Math.max(0, currentCost)}</span>
            <div class="card-name">${card.name}</div>
            <div class="card-effect">${cardData.effect}</div>
            ${card.seal ? `<span class="card-carved-seal">☆${card.sealType || '初級刻印'}</span>` : ''}
        `;
        
        // カード使用ロジック
        cardElement.addEventListener('click', () => {
            if (playable) {
                playCard(index);
            }
        });

        handCardsContainer.appendChild(cardElement);
    });
};

// カード使用
const playCard = (cardIndex) => {
    const card = game.gameState.hand[cardIndex];
    const cardData = ALL_CARDS[card.name];
    const currentCost = cardData.cost - game.partyState.buffs.コスト減少;
    
    if (game.gameState.cost >= Math.max(0, currentCost)) {
        game.gameState.cost -= Math.max(0, currentCost);
        
        // 刻印効果の適用
        if (card.sealType) {
            applySealEffect(card.name, card.sealType, game);
        }
        
        // メイン効果の実行
        cardData.action(game);
        
        // 手札から捨て札へ
        game.gameState.hand.splice(cardIndex, 1);
        game.gameState.discard.push(card);
        
        updateUI();
    }
};

// 必殺技使用
soulScreamIcon.addEventListener('click', () => {
    if (game.partyState.soulCharge === 100) {
        const charId = game.party[0]; // 簡易化のため、先頭のキャラの必殺技を使用
        const char = ALL_CHARACTERS.find(c => c.id === charId);
        if (char) {
            const screamData = SCREAM_EFFECTS[char.scream];
            screamData.action(game);
            game.partyState.soulCharge = 0;
            updateUI();
        }
    }
});

// ターン開始
const startTurn = () => {
    game.gameState.turnNumber++;
    game.gameState.cost = game.gameState.maxCost; // コスト回復
    game.partyState.shield = 0; // シールドは自身ターン開始時に消える
    game.gameState.cardUsedThisTurn = []; // 刻印の初回使用リセット
    
    // バフ/デバフの残りターン減少（ターン終了後だが、簡略化のためここで処理）
    // 自身のターンで切れる一時的バフ/デバフをここで処理
    decrementBuffDurations(game.partyState.buffs);
    decrementBuffDurations(enemyState.buffs);

    // 手札を捨て札へ
    game.gameState.discard = [...game.gameState.discard, ...game.gameState.hand];
    game.gameState.hand = [];
    
    // 5枚引く
    game.drawCards(5);

    updateUI();
};

const decrementBuffDurations = (buffs) => {
    if (!buffs.durations) return;
    
    Object.keys(buffs.durations).forEach(name => {
        buffs.durations[name]--;
        if (buffs.durations[name] <= 0) {
            // バフを削除
            buffs[name] = 0; // 一時的バフ/デバフは値もリセット
            delete buffs.durations[name];
        }
    });
};

// ターン終了ボタン
endTurnButton.addEventListener('click', () => {
    endPlayerTurn();
});

const endPlayerTurn = () => {
    // 敵の行動
    enemyTurn();
    
    // 自身のターン開始
    startTurn();
};

const enemyTurn = () => {
    const action = currentEnemy.actions[enemyState.nextActionIndex];
    if (!action) return;
    
    for (let i = 0; i < (action.repeat || 1); i++) {
        processEnemyAction(action);
    }
    
    // 次の行動を設定
    enemyState.nextActionIndex = (enemyState.nextActionIndex + 1) % currentEnemy.actions.length;
};

const processEnemyAction = (action) => {
    const baseValue = action.value;
    
    if (action.type === 'A') { // 攻撃
        let finalDamage = Math.max(0, baseValue + enemyState.buffs.力 - enemyState.buffs.力減少);
        game.takeDamage(finalDamage);
    } else if (action.type === 'D') { // 防御
        // 敵のシールド処理は簡易化のため今回はHPで代用
    } else if (action.type === 'B') { // 自身にバフ
        enemyState.buffs.力 += baseValue;
    } else if (action.type === 'S') { // デバフ
        game.addEnemyDebuff('軟化', baseValue, null); // 永続軟化として簡易化
    }
};

// バフ/デバフアイコンの描画
const renderBuffsDebuffs = () => {
    partyBuffsContainer.innerHTML = '';
    
    // パーティーバフ
    Object.keys(game.partyState.buffs).forEach(name => {
        const amount = game.partyState.buffs[name];
        if (amount > 0) {
            const duration = game.partyState.buffs.durations && game.partyState.buffs.durations[name];
            const icon = document.createElement('div');
            icon.className = `buff-icon buff`;
            icon.title = `${name}: ${amount} ${duration !== undefined ? `(残り${duration}ターン)` : '(永続)'}`;
            icon.innerHTML = name.charAt(0); // 簡易アイコン
            
            icon.innerHTML += `<span class="buff-amount">${amount}</span>`;
            if (duration !== undefined) {
                icon.innerHTML += `<span class="buff-duration">${duration}</span>`;
            }
            partyBuffsContainer.appendChild(icon);
        }
    });
};

// パーティーシールドの描画 (HPバーと分けて)
const renderPartyShield = () => {
    // メンバーごとのシールド表示は今回はスキップし、合計シールドをどこかに表示
    // 簡易化のため、シールドはHPバーの下にテキストとして表示する
    const shieldText = document.createElement('span');
    shieldText.textContent = `🛡️ シールド: ${game.partyState.shield}`;
    shieldText.style.cssText = 'font-weight: 700; color: var(--discord-green); margin-left: 20px;';
    partyHPText.parentNode.insertBefore(shieldText, partyHPText.nextSibling);

    // メンバー表示エリアにもシールド値を表示 (簡易)
    partyMembersDiv.innerHTML = '';
    game.party.forEach(charId => {
        const char = ALL_CHARACTERS.find(c => c.id === charId);
        const memberDisplay = document.createElement('div');
        memberDisplay.className = 'battle-member-display';
        memberDisplay.innerHTML = `
            <div class="member-icon" style="background-color: hsl(${char.maxHP * 5}, 70%, 50%);"></div>
            <p>${char.name}</p>
        `;
        partyMembersDiv.appendChild(memberDisplay);
    });
};


// 戦闘開始
const startBattle = () => {
    currentEnemy = getEnemyForBattle(game.gameState.battleNumber);
    enemyState = {
        currentHP: currentEnemy.maxHP,
        maxHP: currentEnemy.maxHP,
        nextActionIndex: 0,
        buffs: { 力: 0, 軟化: 0, 力減少: 0 },
    };
    
    enemyNameH3.textContent = currentEnemy.name;
    
    // 初回ターン開始
    startTurn();
};

// 戦闘終了
const endBattle = (result) => {
    if (result === 'win') {
        alert(`戦闘勝利！現在の勝利数: ${game.gameState.battleNumber}/25`);
        // 報酬選択画面へ遷移 (今回は簡易化し、編成画面に戻る)
        if (game.gameState.battleNumber === 25) {
            alert('ゲームクリア！おめでとうございます！');
            changeScreen('title');
        } else {
            changeScreen('party'); // 勝利後も編成画面に戻って次戦へ
        }
    } else {
        alert(`ゲームオーバー... 勝利数: ${game.gameState.battleNumber}`);
        // ゲーム状態をリセットしてタイトルへ
        game.gameState.battleNumber = 0;
        changeScreen('title');
    }
};