// cardEffects.js: カード効果、必殺技（魂の叫び）の効果定義

// 基本の攻撃と防御カード
const BASE_CARDS = {
    '攻撃': {
        cost: 1,
        effect: '敵に 5 ダメージを与える。',
        action: (game) => {
            const damage = 5 + game.partyState.buffs.力; // 力バフ適用
            game.damageEnemy(damage);
        }
    },
    '防御': {
        cost: 1,
        effect: '自身に 5 シールドを付与する。',
        action: (game) => {
            const shield = 5; // 防御は固定
            game.addShield(shield);
        }
    },
};

// キャラ固有カード（AIの自由な発想による効果）
const CHARACTER_CARDS = {
    '基本1': { cost: 1, effect: '敵に 3 ダメージ。自身に 力(一時的) を 1 付与。', action: (game) => {
        game.damageEnemy(3 + game.partyState.buffs.力);
        game.addBuff('力', 1, 1); // 一時的な力バフ
    }},
    '基本2': { cost: 0, effect: 'カードを 1 枚引く。', action: (game) => {
        game.drawCards(1);
    }},
    '基本3': { cost: 2, effect: '敵全体に 7 ダメージ。', action: (game) => {
        game.damageEnemy(7 + game.partyState.buffs.力);
    }},
    '基本4': { cost: 1, effect: '味方全体に シールド を 3 付与。', action: (game) => {
        game.addShield(3);
    }},
    '基本5': { cost: 3, effect: 'シールド を 15 付与。', action: (game) => {
        game.addShield(15);
    }},
    '基本6': { cost: 0, effect: '自身に 力 を 1 付与 (永続)。', action: (game) => {
        game.addBuff('力', 1, null); // 永続
    }},
    '基本7': { cost: 1, effect: '敵に 2 ダメージ。 魂の震え を 5 獲得。', action: (game) => {
        game.damageEnemy(2 + game.partyState.buffs.力);
        game.addSoulCharge(5);
    }},
    '基本8': { cost: 2, effect: '次のターン開始時まで、受けるダメージを 3 軽減 (永続的な防御)。', action: (game) => {
        game.addBuff('防御強化', 3, null); // ダメージ軽減バフ
    }},
};

// 特殊カード（AIの自由な発想による効果） - 初期デッキには含まれない
const SPECIAL_CARDS = {
    '特殊1': { cost: 2, effect: '山札をシャッフルし、コスト 0 のカードを 2 枚手札に加える。', action: (game) => {
        // カード生成ロジックは簡易化
    }},
    '特殊2': { cost: 3, effect: '敵に 12 ダメージ。与えたダメージの半分の シールド を獲得。', action: (game) => {
        const damage = 12 + game.partyState.buffs.力;
        game.damageEnemy(damage);
        game.addShield(Math.floor(damage / 2));
    }},
    '特殊3': { cost: 1, effect: '手札のカードをすべて破棄し、破棄したカード 1 枚につき コスト を 1 回復。', action: (game) => {
        game.discardHandAndRestoreCost();
    }},
    '特殊4': { cost: 2, effect: 'この戦闘中、最大 HP を 10 増加させ、HP を 10 回復する。', action: (game) => {
        game.increaseMaxHP(10);
        game.healParty(10);
    }},
};

// 必殺技 (魂の叫び) の効果
const SCREAM_EFFECTS = {
    '叫び1': {
        effect: '敵に 大ダメージ (20) を与える。',
        action: (game) => {
            game.damageEnemy(20 + game.partyState.buffs.力);
        }
    },
    '叫び2': {
        effect: 'シールド を 20 付与し、手札を 3 枚引く。',
        action: (game) => {
            game.addShield(20);
            game.drawCards(3);
        }
    },
    '叫び3': {
        effect: '敵に 軟化 を 5 付与し、次のターンまで敵の 力 を 3 減少させる。',
        action: (game) => {
            game.addEnemyDebuff('軟化', 5, null);
            game.addEnemyDebuff('力減少', 3, 1);
        }
    },
    '叫び4': {
        effect: '全コスト を 5 回復し、全てのカードの コスト を このターン のみ 1 減少させる (最低 0)。',
        action: (game) => {
            game.restoreCost(5);
            game.addBuff('コスト減少', 1, 1); // 次のターン開始時まで
        }
    },
};

const ALL_CARDS = { ...BASE_CARDS, ...CHARACTER_CARDS, ...SPECIAL_CARDS };