// party.js: 編成画面のロジック、パーティー編成管理

const memberListContainer = document.getElementById('memberList');
const currentPartyContainer = document.getElementById('currentParty');
const startBattleButton = document.getElementById('startBattleButton');
const leaveCallButton = document.getElementById('leaveCallButton');
const memberDetailsBox = document.getElementById('memberDetails');

let selectedMemberId = null;

const renderMemberCard = (member, isCurrentParty = false) => {
    const card = document.createElement('div');
    card.className = `party-member-card ${isCurrentParty ? '' : (game.party.includes(member.id) ? 'in-party' : '')}`;
    card.setAttribute('data-member-id', member.id);
    card.draggable = !isCurrentParty; // 編成済みのメンバーは一覧からドラッグ不可（代わりにcurrentPartyから移動）

    card.innerHTML = `
        <div class="member-icon" style="background-color: hsl(${member.maxHP * 5}, 70%, 50%);"></div>
        <h4>${member.name}</h4>
        <p>体力: ${member.maxHP}</p>
    `;
    
    // 詳細表示用クリックイベント
    card.addEventListener('click', () => {
        selectedMemberId = member.id;
        renderMemberDetails(member);
        document.querySelectorAll('.party-member-card').forEach(c => c.classList.remove('selected'));
        if (!isCurrentParty) {
            card.classList.add('selected');
        } else {
            // currentPartyのカードは詳細表示のみで選択状態にしない（選択解除ロジックが複雑化するため簡易化）
        }
    });
    
    // ドラッグ＆ドロップイベント (簡易的な実装)
    if (!isCurrentParty) {
        card.addEventListener('dragstart', (e) => {
            if (game.party.length >= 4 || game.party.includes(member.id)) {
                e.preventDefault(); // 定員オーバー、または既に編成済みの場合はドラッグ不可
                return;
            }
            e.dataTransfer.setData('text/plain', member.id);
        });
    } else {
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', member.id + '_remove');
            e.dataTransfer.effectAllowed = 'move';
        });
    }

    return card;
};

const renderMemberList = () => {
    memberListContainer.innerHTML = '';
    ALL_CHARACTERS.forEach(member => {
        memberListContainer.appendChild(renderMemberCard(member));
    });
};

const updatePartyUI = () => {
    currentPartyContainer.innerHTML = '';
    game.party.forEach(charId => {
        const member = ALL_CHARACTERS.find(c => c.id === charId);
        if (member) {
            currentPartyContainer.appendChild(renderMemberCard(member, true));
        }
    });

    // メンバー一覧の更新
    document.querySelectorAll('.party-member-card').forEach(card => {
        const id = card.getAttribute('data-member-id');
        card.classList.toggle('in-party', game.party.includes(id));
        card.draggable = !game.party.includes(id);
    });

    // 通話の時間ボタンの更新
    const isReady = game.party.length >= 1 && game.party.length <= 4;
    startBattleButton.disabled = !isReady;
    startBattleButton.classList.toggle('disabled', !isReady);
    startBattleButton.classList.toggle('large-button', game.party.length === 4); // 主張激しく
};

const renderMemberDetails = (member) => {
    if (!member) {
        memberDetailsBox.innerHTML = '<p>メンバーを選択またはドラッグしてください。</p>';
        return;
    }

    const allCards = [
        ...member.baseDeck,
        member.specialCard,
        member.scream
    ].filter(Boolean); // null/undefinedを除外

    memberDetailsBox.innerHTML = `
        <h3>${member.name}</h3>
        <p><strong>体力:</strong> ${member.maxHP}</p>
        <p><strong>必殺技:</strong> ${SCREAM_EFFECTS[member.scream].effect} (${member.scream})</p>
        <h4>保有カード (${member.baseDeck.length + 1}枚/特殊除く)</h4>
        <ul>
            ${member.baseDeck.map(cardName => `<li>${cardName} (コスト: ${ALL_CARDS[cardName].cost}): <span class="card-effect-summary">${ALL_CARDS[cardName].effect}</span></li>`).join('')}
        </ul>
        <h4>特殊カード</h4>
        <p>${member.specialCard} (コスト: ${SPECIAL_CARDS[member.specialCard].cost}): <span class="card-effect-summary">${SPECIAL_CARDS[member.specialCard].effect}</span></p>
    `;
};

// ドロップイベントリスナー
currentPartyContainer.addEventListener('dragover', (e) => {
    e.preventDefault(); // ドロップを許可
});

currentPartyContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const memberId = data.replace('_remove', '');

    if (data.endsWith('_remove')) {
        // currentPartyからの除外 (ドラッグ＆ドロップで戻す動作は一旦なしとし、クリックで除外のUIを後で追加する方が簡単)
        // 今回は簡略化のため、ドラッグ＆ドロップでのメンバー入れ替え・除外のロジックは最小限に留める
        return;
    }

    // 新規編成
    if (memberId && game.party.length < 4 && !game.party.includes(memberId)) {
        game.party.push(memberId);
        updatePartyUI();
    }
});


// イベントリスナー設定
const initializePartyScreen = () => {
    game.party = []; // 画面遷移時にパーティーリセット
    selectedMemberId = null;
    renderMemberList();
    updatePartyUI();
    renderMemberDetails(null);

    leaveCallButton.addEventListener('click', () => {
        changeScreen('title');
    });

    startBattleButton.addEventListener('click', () => {
        if (game.party.length >= 1) {
            initializeBattleState();
            changeScreen('battle');
            startBattle();
        }
    });
};