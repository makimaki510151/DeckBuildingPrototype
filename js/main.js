// main.js: ゲーム全体の管理、画面遷移、初期化処理

const game = {
    screens: {
        title: document.getElementById('titleScreen'),
        party: document.getElementById('partyScreen'),
        battle: document.getElementById('battleScreen'),
    },
    party: [], // 編成されたキャラのIDリスト
    partyState: { // パーティー全体の戦闘状態
        maxHP: 0,
        currentHP: 0,
        shield: 0,
        buffs: {}, // { name: amount, duration: turns_left }
        soulCharge: 0, // 魂の震えポイント
    },
    gameState: {
        battleNumber: 0, // 現在の戦闘数 (1からスタート)
        deck: [], // 現在のデッキ
        hand: [], // 現在の手札
        discard: [], // 現在の捨て札
        cost: 5,
        maxCost: 5,
        // その他の戦闘情報
    }
};

// 画面遷移関数
const changeScreen = (screenName) => {
    Object.values(game.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    game.screens[screenName].classList.add('active');
};

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    // タイトル画面のボタン設定
    document.getElementById('startCallButton').addEventListener('click', () => {
        changeScreen('party');
        initializePartyScreen();
    });
    
    // 編成画面のボタン設定は party.js で
    // 戦闘画面のボタン設定は battle.js で
    
    changeScreen('title');
});

// パーティーHPの計算
const calculatePartyHP = (currentParty) => {
    return currentParty.reduce((sum, charId) => {
        const char = ALL_CHARACTERS.find(c => c.id === charId);
        return sum + (char ? char.maxHP : 0);
    }, 0);
};

// 戦闘状態の初期化
const initializeBattleState = () => {
    const maxHP = calculatePartyHP(game.party);
    game.partyState = {
        maxHP: maxHP,
        currentHP: maxHP,
        shield: 0,
        buffs: { 力: 0, 防御強化: 0, コスト減少: 0 },
        soulCharge: 0,
    };
    
    // デッキ構築
    let initialDeck = [];
    game.party.forEach(charId => {
        const char = ALL_CHARACTERS.find(c => c.id === charId);
        if (char) {
            char.baseDeck.forEach(cardName => {
                initialDeck.push({
                    name: cardName,
                    seal: '初級刻印', // 初期カードには初級刻印が仮でついている
                    sealType: null,
                    owner: char.id,
                });
            });
            // 特殊カードは獲得後に deck に追加される
        }
    });
    
    // 実際にデッキに加える処理は簡易化のためフラットなリストとして扱う
    game.gameState = {
        battleNumber: game.gameState.battleNumber + 1,
        deck: initialDeck, // TODO: 永続的な特殊カードや刻印を考慮してロードする
        hand: [],
        discard: [],
        cost: 5,
        maxCost: 5,
        turnNumber: 0,
        cardUsedThisTurn: [], // 刻印の初回使用チェック用
    };

    // シャッフル
    shuffleDeck();
};

const shuffleDeck = () => {
    // 捨て札をデッキに戻しシャッフル
    game.gameState.deck = [...game.gameState.deck, ...game.gameState.discard];
    game.gameState.discard = [];
    
    for (let i = game.gameState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [game.gameState.deck[i], game.gameState.deck[j]] = [game.gameState.deck[j], game.gameState.deck[i]];
    }
};

// ダメージ処理、シールド処理などのヘルパー関数は battle.js に記述