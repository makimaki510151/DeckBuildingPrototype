// carvedSeal.js: 刻印（特殊効果）の定義

const CARVED_SEALS = {
    '力上昇': {
        name: '力上昇',
        effect: 'ターン内で初めて使う時、**力**を 1 獲得する (永続)。',
        // action: 刻印はカード使用時に `battle.js` でチェック
        // 力: 攻撃力。ダメージに直接影響
    },
    '軟化': {
        name: '軟化',
        effect: 'ターン内で初めて使う時、敵に **軟化** を 1 付与する (永続)。',
        // 軟化: 被ダメージ上昇のデバフ。数値分受けるダメージが増える。
    },
    '力減少': {
        name: '力減少',
        effect: 'ターン内で初めて使う時、敵の **力** を一時的に 1 点減少する (1ターン)。',
        // 力減少: 敵の攻撃力を減少させるデバフ。
    },
    // 他の刻印もここに追加可能
};

// 刻印の処理を管理するヘルパー関数
const applySealEffect = (cardName, sealType, game) => {
    // ターン内で初めて使用したかチェックするロジックは battle.js で管理
    if (game.gameState.cardUsedThisTurn.includes(cardName)) return;

    if (sealType === '力上昇') {
        game.addBuff('力', 1, null); // 永続
    } else if (sealType === '軟化') {
        game.addEnemyDebuff('軟化', 1, null); // 永続デバフ
    } else if (sealType === '力減少') {
        game.addEnemyDebuff('力減少', 1, 1); // 1ターンのみ
    }

    game.gameState.cardUsedThisTurn.push(cardName);
};