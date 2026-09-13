const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// 別のURL（GitHub Pagesなど）からの通信を許可する設定
app.use(cors());
app.use(express.json());

// Renderの設定（Environment）に入れたSupabaseの鍵を自動で読み込みます
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーが生きているか確認するためのテスト用URL
app.get('/', (req, res) => {
    res.send('Othello Server is running with Supabase!');
});

// 【追加】Pi Network セッション検証用API
app.post('/api/verify-session', async (req, res) => {
    const { accessToken } = req.body;
    // （トークン検証ロジック）
});


// 【機能1】ゲーム終了時に、対戦回数を1増やす（または新規登録する）API
app.post('/api/match-complete', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'ユーザー名が必要です' });
    }

    try {
        // 1. まず、すでにそのユーザー名が登録されているか確認する
        const { data: existingUser, error: selectError } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (selectError) throw selectError;

        if (existingUser) {
            // 2. すでに存在する場合は、match_countを+1して更新する
            const { data, error: updateError } = await supabase
                .from('leaderboard')
                .update({ match_count: existingUser.match_count + 1 })
                .eq('username', username)
                .select();

            if (updateError) throw updateError;
            return res.json({ message: '対戦回数を更新しました', data });
        } else {
            // 3. まだ存在しない場合は、新規登録する（match_countはデフォルトで1になります）
            const { data, error: insertError } = await supabase
                .from('leaderboard')
                .insert([{ username: username }])
                .select();

            if (insertError) throw insertError;
            return res.json({ message: '新規ユーザーを登録しました', data });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

// 【機能2】最新のランキング（対戦回数が多い順にトップ10）を取得するAPI
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('username, match_count')
            .order('match_count', { ascending: false }) // 多い順に並び替え
            .limit(10); // 上位10名まで取得

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'ランキングの取得に失敗しました' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
