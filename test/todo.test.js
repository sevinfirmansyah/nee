const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('../src/todo.js');

const sample = () => [
  { id: 'a', text: 'Belajar JavaScript', done: false },
  { id: 'b', text: 'Beli kopi', done: true },
  { id: 'c', text: 'Olahraga', done: false },
];

test('normalizeText merapikan spasi dan menolak non-string', () => {
  assert.equal(T.normalizeText('  halo   dunia \n '), 'halo dunia');
  assert.equal(T.normalizeText('   '), '');
  assert.equal(T.normalizeText(null), '');
  assert.equal(T.normalizeText(42), '');
});

test('normalizeText memotong teks ke MAX_LENGTH tanpa merusak emoji', () => {
  const long = 'a'.repeat(T.MAX_LENGTH + 50);
  assert.equal(T.normalizeText(long).length, T.MAX_LENGTH);

  const emojis = '😀'.repeat(T.MAX_LENGTH + 5);
  const cut = T.normalizeText(emojis);
  assert.equal(Array.from(cut).length, T.MAX_LENGTH);
  assert.ok(Array.from(cut).every((ch) => ch === '😀'));
});

test('addTodo menambah tugas baru di akhir daftar', () => {
  const todos = sample();
  const next = T.addTodo(todos, '  Tidur siang  ', 'x');
  assert.equal(next.length, 4);
  assert.deepEqual(next[3], { id: 'x', text: 'Tidur siang', done: false });
  assert.equal(todos.length, 3, 'array asli tidak boleh berubah');
});

test('addTodo membuat id unik bila tidak diberikan', () => {
  let todos = [];
  for (let i = 0; i < 50; i++) todos = T.addTodo(todos, 'tugas ' + i);
  const ids = new Set(todos.map((t) => t.id));
  assert.equal(ids.size, 50);
});

test('addTodo mengabaikan teks kosong dan mengembalikan array yang sama', () => {
  const todos = sample();
  assert.equal(T.addTodo(todos, ''), todos);
  assert.equal(T.addTodo(todos, '   '), todos);
  assert.equal(T.addTodo(todos, undefined), todos);
});

test('toggleTodo membalik status selesai tanpa mengubah aslinya', () => {
  const todos = sample();
  const next = T.toggleTodo(todos, 'a');
  assert.equal(next[0].done, true);
  assert.equal(todos[0].done, false);
  assert.equal(next[1], todos[1], 'tugas lain tetap objek yang sama');
  assert.equal(T.toggleTodo(next, 'a')[0].done, false);
});

test('toggleTodo dengan id tidak dikenal tidak mengubah apa pun', () => {
  const todos = sample();
  assert.equal(T.toggleTodo(todos, 'zzz'), todos);
});

test('editTodo mengganti teks tugas', () => {
  const todos = sample();
  const next = T.editTodo(todos, 'c', '  Lari pagi  ');
  assert.equal(next[2].text, 'Lari pagi');
  assert.equal(next[2].done, false);
  assert.equal(todos[2].text, 'Olahraga');
});

test('editTodo menolak teks kosong, id tidak dikenal, dan teks yang sama', () => {
  const todos = sample();
  assert.equal(T.editTodo(todos, 'a', '   '), todos);
  assert.equal(T.editTodo(todos, 'zzz', 'Apa saja'), todos);
  assert.equal(T.editTodo(todos, 'a', 'Belajar   JavaScript'), todos);
});

test('removeTodo menghapus tugas berdasarkan id', () => {
  const todos = sample();
  const next = T.removeTodo(todos, 'b');
  assert.deepEqual(
    next.map((t) => t.id),
    ['a', 'c'],
  );
  assert.equal(todos.length, 3);
  assert.equal(T.removeTodo(todos, 'zzz'), todos);
});

test('clearCompleted hanya menyisakan tugas yang belum selesai', () => {
  const todos = sample();
  const next = T.clearCompleted(todos);
  assert.deepEqual(
    next.map((t) => t.id),
    ['a', 'c'],
  );
  assert.equal(T.clearCompleted(next), next, 'tidak ada yang selesai → array sama');
});

test('filterTodos menyaring sesuai pilihan', () => {
  const todos = sample();
  assert.deepEqual(
    T.filterTodos(todos, 'semua').map((t) => t.id),
    ['a', 'b', 'c'],
  );
  assert.deepEqual(
    T.filterTodos(todos, 'aktif').map((t) => t.id),
    ['a', 'c'],
  );
  assert.deepEqual(
    T.filterTodos(todos, 'selesai').map((t) => t.id),
    ['b'],
  );
  assert.deepEqual(
    T.filterTodos(todos, 'ngawur').map((t) => t.id),
    ['a', 'b', 'c'],
  );
  assert.notEqual(T.filterTodos(todos, 'semua'), todos, 'selalu array baru');
});

test('countActive dan countDone menghitung dengan benar', () => {
  const todos = sample();
  assert.equal(T.countActive(todos), 2);
  assert.equal(T.countDone(todos), 1);
  assert.equal(T.countActive([]), 0);
  assert.equal(T.countDone([]), 0);
});

test('serialize lalu deserialize menghasilkan data yang sama', () => {
  const todos = sample();
  assert.deepEqual(T.deserialize(T.serialize(todos)), todos);
});

test('deserialize aman terhadap data rusak', () => {
  assert.deepEqual(T.deserialize(null), []);
  assert.deepEqual(T.deserialize(''), []);
  assert.deepEqual(T.deserialize('{bukan json'), []);
  assert.deepEqual(T.deserialize('{"a":1}'), []);
  assert.deepEqual(T.deserialize('null'), []);
});

test('deserialize membuang item yang tidak valid atau duplikat', () => {
  const raw = JSON.stringify([
    { id: 'a', text: 'Valid', done: true },
    { id: 'a', text: 'Id duplikat', done: false },
    { id: '', text: 'Id kosong' },
    { id: 7, text: 'Id bukan string' },
    { id: 'b', text: '   ' },
    { id: 'c', text: 123 },
    null,
    'teks',
    { id: 'd', text: '  Sisa  spasi ', done: 'ya' },
  ]);
  assert.deepEqual(T.deserialize(raw), [
    { id: 'a', text: 'Valid', done: true },
    { id: 'd', text: 'Sisa spasi', done: false },
  ]);
});

test('FILTERS berisi tiga pilihan yang dipakai tampilan', () => {
  assert.deepEqual(T.FILTERS, ['semua', 'aktif', 'selesai']);
});
