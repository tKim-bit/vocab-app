const KEY = "vocab_words_v1";
let words = JSON.parse(localStorage.getItem(KEY) || "[]");
const $ = (s) => document.querySelector(s);
const view = $("#view");
const nextButton = $("#nextQuestion");

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
  // 学習モードが選択されたら「次の問題」ボタンを表示
  nextButton.style.display = 'block';

  if (words.length === 0) {
    view.innerHTML = "<p>単語がありません。追加モードで単語を登録してください。</p>";
    return;
  }

  // ランダムな問題を選択
  const q = words[Math.floor(Math.random() * words.length)];
  
  view.innerHTML = `
    <h2 class="text-xl font-bold">${q.en}</h2>
    <input id="answer" class="border p-2 rounded w-full" placeholder="答えは？" />
    <button id="check" class="bg-indigo-500 text-white p-2 rounded shadow hover:bg-indigo-600 transition">答え合わせ</button>
    <p id="result" class="mt-4 font-semibold"></p>
  `;

  // 答え合わせボタンのイベントハンドラ
  $("#check").onclick = () => {
    const ans = $("#answer").value.trim().toLowerCase();
    const ok = ans === q.ja.toLowerCase();
    const resultElement = $("#result");
    
    resultElement.innerHTML = ok 
      ? `<span style="color: green;">✅ 正解</span>` 
      : `<span style="color: red;">❌ 正解は ${q.ja}</span>`;
    
    // 答え合わせ後、次の問題ボタンにフォーカスを移動
    nextButton.focus();
  };
}

/**
 * リストビューをレンダリングします。
 */
function renderList() {
  // 学習モード以外の時は「次の問題」ボタンを非表示
  nextButton.style.display = 'none';

  if (words.length === 0) {
    view.innerHTML = "<p>単語がありません</p>";
    return;
  }

  view.innerHTML = "<ul class='list-disc pl-5 space-y-2'>" +
    words.map(w => `<li class="border-b pb-1 last:border-b-0">${w.en} - ${w.ja}</li>`).join("") +
    "</ul>";
}

/**
 * 単語追加ビューをレンダリングします。
 */
function renderAdd() {
  // 学習モード以外の時は「次の問題」ボタンを非表示
  nextButton.style.display = 'none';

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
