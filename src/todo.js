/*
 * Logika inti aplikasi Daftar Tugas.
 *
 * Semua fungsi di sini "murni": tidak menyentuh DOM maupun localStorage,
 * dan tidak pernah mengubah array masukan — selalu mengembalikan array baru.
 * Kalau tidak ada yang berubah (misalnya teks kosong), array yang sama
 * dikembalikan apa adanya, sehingga pemanggil bisa membandingkan dengan `===`.
 *
 * Berkas ini dipakai di dua tempat:
 *   - browser  → tersedia sebagai `window.TodoLogic`
 *   - Node.js  → lewat `require('./src/todo.js')` (untuk pengujian)
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.TodoLogic = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAX_LENGTH = 200;
  const FILTERS = ['semua', 'aktif', 'selesai'];

  let idCounter = 0;

  /** Membuat id unik untuk tugas baru. */
  function makeId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    idCounter += 1;
    return (
      Date.now().toString(36) +
      '-' +
      idCounter.toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 8)
    );
  }

  /**
   * Merapikan teks tugas: spasi berlebih dirapatkan, spasi di awal/akhir
   * dibuang, lalu dipotong ke MAX_LENGTH karakter (aman untuk emoji).
   * Mengembalikan string kosong kalau masukan bukan string.
   */
  function normalizeText(text) {
    if (typeof text !== 'string') return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    const chars = Array.from(clean);
    return chars.length > MAX_LENGTH ? chars.slice(0, MAX_LENGTH).join('').trim() : clean;
  }

  function addTodo(todos, text, id) {
    const clean = normalizeText(text);
    if (!clean) return todos;
    return todos.concat({ id: id || makeId(), text: clean, done: false });
  }

  function toggleTodo(todos, id) {
    if (!todos.some((t) => t.id === id)) return todos;
    return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  function editTodo(todos, id, text) {
    const clean = normalizeText(text);
    const target = todos.find((t) => t.id === id);
    if (!clean || !target || target.text === clean) return todos;
    return todos.map((t) => (t.id === id ? { ...t, text: clean } : t));
  }

  function removeTodo(todos, id) {
    if (!todos.some((t) => t.id === id)) return todos;
    return todos.filter((t) => t.id !== id);
  }

  function clearCompleted(todos) {
    if (!todos.some((t) => t.done)) return todos;
    return todos.filter((t) => !t.done);
  }

  /** Filter yang tidak dikenal diperlakukan sebagai 'semua'. */
  function filterTodos(todos, filter) {
    if (filter === 'aktif') return todos.filter((t) => !t.done);
    if (filter === 'selesai') return todos.filter((t) => t.done);
    return todos.slice();
  }

  function countActive(todos) {
    return todos.filter((t) => !t.done).length;
  }

  function countDone(todos) {
    return todos.filter((t) => t.done).length;
  }

  function serialize(todos) {
    return JSON.stringify(todos);
  }

  /**
   * Membaca data dari penyimpanan. Data yang rusak atau tidak dikenal
   * dibuang diam-diam supaya aplikasi tetap bisa jalan.
   */
  function deserialize(raw) {
    if (typeof raw !== 'string' || raw === '') return [];

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return [];
    }
    if (!Array.isArray(data)) return [];

    const seen = new Set();
    const result = [];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      if (typeof item.id !== 'string' || item.id === '' || seen.has(item.id)) continue;
      const text = normalizeText(item.text);
      if (!text) continue;
      seen.add(item.id);
      result.push({ id: item.id, text: text, done: item.done === true });
    }
    return result;
  }

  return {
    MAX_LENGTH,
    FILTERS,
    makeId,
    normalizeText,
    addTodo,
    toggleTodo,
    editTodo,
    removeTodo,
    clearCompleted,
    filterTodos,
    countActive,
    countDone,
    serialize,
    deserialize,
  };
});
