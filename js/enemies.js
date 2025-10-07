// enemies.js: 敵（障害）のデータ定義

const ENEMY_ACTIONS = {
    'A': { icon: '⚔️', desc: (val) => `${val} ダメージの攻撃` },
    'D': { icon: '🛡️', desc: (val) => `${val} シールドの防御` },
    'B': { icon: '⏫', desc: (val) => `自身に 力 を ${val} 付与` },
    'S': { icon: '⬇️', desc: (val) => `パーティーに 軟化 を ${val} 付与` },
};

const ENEMIES = [
    // 1~5戦目 (刻印報酬)
    {
        name: '下っ端バイト',
        maxHP: 30,
        actions: [
            { type: 'A', value: 5 },
            { type: 'D', value: 5 },
            { type: 'A', value: 5 },
            { type: 'A', value: 5 },
            { type: 'D', value: 10 },
        ],
        description: '一番最初に立ちはだかる障害。',
    },
    // 6~10戦目 (特殊カード報酬)
    {
        name: '中間管理職',
        maxHP: 50,
        actions: [
            { type: 'A', value: 7 },
            { type: 'B', value: 2 },
            { type: 'A', value: 7, repeat: 2 }, // 攻撃3*2の表現を代替
            { type: 'D', value: 10 },
            { type: 'A', value: 10 },
        ],
        description: 'ちょっと強気の敵。',
    },
    // 11~15戦目 (刻印報酬)
    {
        name: 'ベテラントレーナー',
        maxHP: 70,
        actions: [
            { type: 'A', value: 10 },
            { type: 'S', value: 3 },
            { type: 'A', value: 5 },
            { type: 'D', value: 15 },
            { type: 'A', value: 10, repeat: 2 },
        ],
        description: 'デバフを使い始める。',
    },
    // 16~20戦目 (特殊カード報酬)
    {
        name: '最終試験官',
        maxHP: 90,
        actions: [
            { type: 'B', value: 5 },
            { type: 'A', value: 15 },
            { type: 'S', value: 5 },
            { type: 'D', value: 20 },
            { type: 'A', value: 20 },
        ],
        description: 'ボスの風格。',
    },
    // 21~25戦目 (報酬なしの連戦)
    {
        name: '究極の試練',
        maxHP: 120,
        actions: [
            { type: 'A', value: 10, repeat: 3 },
            { type: 'D', value: 30 },
            { type: 'S', value: 5 },
            { type: 'B', value: 5 },
            { type: 'A', value: 25 },
        ],
        description: 'ゲームクリアを阻む壁。',
    },
];

// 戦闘数に応じてループさせるための関数 (簡易)
const getEnemyForBattle = (battleNumber) => {
    let index = Math.floor((battleNumber - 1) / 5);
    if (index >= ENEMIES.length) index = ENEMIES.length - 1;
    return ENEMIES[index];
};