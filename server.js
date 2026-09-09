const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // GitHub Pagesからのアクセスを許可
app.use(express.json());

// 簡易テスト用URL（ブラウザで開いて確認用）
app.get('/', (req, res) => {
    res.send('Othello Server is running!');
});

// ここにランキングやカウントの処理を書いていきます

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
