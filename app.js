const KEY = "vocab_words_v1";
let words = JSON.parse(localStorage.getItem(KEY) || "[]");
const $ = (s) => document.querySelector(s);
const view = $("#view");
const nextButton = $("#nextQuestion");

// 連続正解数を保持するグローバル変数
let consecutiveCorrects = 0; 

// 初回ロード時
if (words.length === 0) {
  fetch("words.json")
    .then(r => r.json())
    .then(d => { words = d; save(); renderLearn(); });
} else {
  renderLearn();
}
function save() { localStorage.setItem(KEY, JSON.stringify(words)); }

// モード切り替えイベント
$("#modeLearn").onclick = renderLearn;
$("#modeList").onclick = renderList;
$("#modeAdd").onclick = renderAdd;

// 「次の問題」ボタンのイベントハンドラを設定
nextButton.onclick = renderLearn;

/**
 * 学習（問題表示）ビューをレンダリングします。
 */
function renderLearn() {
  // nextButtonの要素が取得できているか確認（デバッグ用）
  if (!nextButton) {
      console.error("次の問題ボタン（#nextQuestion）が見つかりません。");
      view.innerHTML = "<p>エラー: ボタン要素が見つかりませんでした。</p>" + view.innerHTML;
      return;
  }
  
  // 学習モードが選択されたら「次の問題」ボタンを表示
  nextButton.style.display = 'block';

  if (words.length === 0) {
    view.innerHTML = "<p>単語がありません。追加モードで単語を登録してください。</p>";
    return;
  }

  // --- 問題更新の前に、前回表示された内容を確実にクリア ---
  view.innerHTML = '';
  // -------------------------------------------------------------

  // ランダムな問題を選択
  const q = words[Math.floor(Math.random() * words.length)];
  
  view.innerHTML = `
    <!-- 連続正解数表示エリア: 新しいクラス streak-display を適用 -->
    <p id="streak" class="streak-display">連続正解: ${consecutiveCorrects}</p>
    <h2 class="text-xl font-bold">${q.en}</h2>
    <input id="answer" class="border p-2 rounded w-full" placeholder="答えは？" />
    <button id="check" class="bg-indigo-500 text-white p-2 rounded shadow hover:bg-indigo-600 transition">答え合わせ</button>
    <p id="result" class="mt-4 font-semibold"></p>
  `;
  
  // 新しい問題が表示されたら、回答入力フィールドに自動的にフォーカスを当てる
  const answerInput = $("#answer");
  if (answerInput) {
      answerInput.focus();
  }

  // 答え合わせボタンのイベントハンドラ
  $("#check").onclick = () => {
    const ans = $("#answer").value.trim().toLowerCase();
    const ok = ans === q.ja.toLowerCase();
    const resultElement = $("#result");
    
    if (ok) {
        // ✅ 正解の場合
        consecutiveCorrects++; // カウントアップ
        resultElement.innerHTML = `<span style="color: green;">✅ 正解</span>`;
    } else {
        // ❌ 不正解の場合
        consecutiveCorrects = 0; // リセット
        resultElement.innerHTML = `<span style="color: red;">❌ 正解は ${q.ja}</span>`;
    }

    // 連続正解数を更新して表示
    $("#streak").textContent = `連続正解: ${consecutiveCorrects}`;

    // 答え合わせ後、次の問題ボタンにフォーカスを移動
    nextButton.focus();
  };
}

/**
 * リストビューをレンダリングします。
 */
function renderList() {
  // 学習モード以外の時は「次の問題」ボタンを非表示
  if (nextButton) {
    nextButton.style.display = 'none';
  }

  if (words.length === 0) {
    view.innerHTML = "<p>単語がありません</p>";
    return;
  }

  // チェックボックス付きのリストを生成
  view.innerHTML = `
    <ul id="wordList" class="space-y-3 list-none p-0">
    ${words.map((w, index) => `
        <li class="flex items-center border-b pb-2 last:border-b-0">
            <input type="checkbox" data-index="${index}" class="word-checkbox mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
            <span class="text-gray-800">${w.en} - ${w.ja}</span>
        </li>
    `).join("")}
    </ul>
    <button id="deleteSelected" class="bg-red-500 text-white p-2 rounded shadow hover:bg-red-600 transition mt-4">
        選択した単語を削除
    </button>
  `;
  
  // 削除ボタンのイベントハンドラ
  $("#deleteSelected").onclick = () => {
    // チェックされた全てのチェックボックスを取得
    const checkedBoxes = Array.from(document.querySelectorAll('.word-checkbox:checked'));
    
    if (checkedBoxes.length === 0) {
      view.insertAdjacentHTML('beforeend', '<p class="text-gray-500 mt-2">⚠️ 削除する単語を選択してください。</p>');
      return;
    }
    
    // 削除するインデックスを降順で取得 (降順でないとインデックスがずれてしまうため)
    const indicesToDelete = checkedBoxes
        .map(cb => parseInt(cb.dataset.index, 10))
        .sort((a, b) => b - a); // 降順ソート
        
    // 配列から単語を削除
    indicesToDelete.forEach(index => {
      words.splice(index, 1);
    });
    
    save(); // localStorageを更新
    renderList(); // リストを再レンダリングして更新を反映
  };
}

/**
 * 単語追加ビューをレンダリングします。
 */
function renderAdd() {
  // 学習モード以外の時は「次の問題」ボタンを非表示
  if (nextButton) {
    nextButton.style.display = 'none';
  }

  view.innerHTML = `
    <input id="en" class="border p-2 rounded w-full" placeholder="英語" />
    <input id="ja" class="border p-2 rounded w-full" placeholder="日本語" />
    <button id="add" class="bg-green-500 text-white p-2 rounded shadow hover:bg-green-600 transition">追加</button>
  `;
  
  $("#add").onclick = () => {
    const enValue = $("#en").value.trim();
    const jaValue = $("#ja").value.trim();

    if (enValue && jaValue) {
      words.push({ en: enValue, ja: jaValue });
      save(); 
      // alertの代わりにカスタムメッセージを使用
      view.insertAdjacentHTML('beforeend', '<p class="text-green-600 font-bold">✅ 単語を追加しました！</p>');
      
      // 入力フィールドをクリア
      $("#en").value = '';
      $("#ja").value = '';

      // しばらくしてからリスト画面へ遷移
      setTimeout(renderList, 1000);
    } else {
      view.insertAdjacentHTML('beforeend', '<p class="text-red-600 font-bold">⚠️ 英語と日本語の両方を入力してください。</p>');
    }
  };
}
