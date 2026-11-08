import { MAX_FAVORITES, restoreFavorites, toggleFavorite } from "./favorites.ts";
import "./style.css";

const sessions = [
  {
    id: "toolchain",
    time: "10:00",
    duration: "40 MIN",
    track: "工程实践",
    title: "从 cnpm 到 Vite+",
    subtitle: "AI 时代的开发者体验演进",
    speaker: "苏千 / fengmk2",
  },
  {
    id: "interaction",
    time: "11:00",
    duration: "30 MIN",
    track: "AI 新交互",
    title: "一次对话之后",
    subtitle: "让界面接住 AI 的下一步动作",
    speaker: "示例嘉宾 A",
  },
  {
    id: "testing",
    time: "13:30",
    duration: "40 MIN",
    track: "质量与验证",
    title: "把反馈带回开发流程",
    subtitle: "测试、诊断与快速迭代",
    speaker: "示例嘉宾 B",
  },
  {
    id: "runtime",
    time: "14:30",
    duration: "30 MIN",
    track: "多端体验",
    title: "同一个任务，不同的屏幕",
    subtitle: "从桌面到移动端的连续体验",
    speaker: "示例嘉宾 C",
  },
];

const storageKey = "seeconf-demo-favorites-v1";
const knownIds = sessions.map((session) => session.id);
let favorites: string[] = [];
let onlyFavorites = false;
let message = "选择你感兴趣的分享，收藏会保存在当前浏览器。";

try {
  favorites = restoreFavorites(localStorage.getItem(storageKey), knownIds);
} catch {
  message = "浏览器存储不可用，本次收藏仍可在当前页面使用。";
}

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing #app element");

function render() {
  if (!app) return;
  const visibleSessions = onlyFavorites
    ? sessions.filter((session) => favorites.includes(session.id))
    : sessions;

  app.innerHTML = `
    <header class="site-header">
      <a class="wordmark" href="/">SEE Conf <span>× Vite+</span></a>
      <span class="demo-label">LOCAL DEMO / 01</span>
    </header>
    <main>
      <section class="hero" aria-labelledby="page-title">
        <p class="eyebrow">MY CONFERENCE PLAN</p>
        <h1 id="page-title">把感兴趣的分享，<br /><em>放进我的议程。</em></h1>
        <p class="intro">一次小改动，也值得一套完整的验证。</p>
        <p class="disclaimer">演示数据 · 以下时间与示例分享不代表大会正式议程</p>
      </section>
      <section class="agenda" aria-labelledby="agenda-title">
        <div class="agenda-heading">
          <h2 id="agenda-title">分享议程</h2>
          <div class="agenda-actions">
            <span class="favorite-count">已收藏 <strong>${favorites.length}</strong> / ${MAX_FAVORITES}</span>
            <button id="filter" class="filter-button" type="button" aria-pressed="${onlyFavorites}">${onlyFavorites ? "查看全部" : "只看收藏"}</button>
          </div>
        </div>
        <p class="status" role="status" aria-live="polite">${message}</p>
        <div class="session-list">
          ${
            visibleSessions.length
              ? visibleSessions
                  .map(
                    (session) => `
            <article class="session">
              <div class="session-time"><time>${session.time}</time><span>${session.duration}</span></div>
              <div class="session-info"><p class="track">${session.track}</p><h3>${session.title}</h3><p class="session-subtitle">${session.subtitle}</p><p class="speaker">${session.speaker}</p></div>
              <button class="favorite-button ${favorites.includes(session.id) ? "is-selected" : ""}" type="button" data-session="${session.id}" aria-pressed="${favorites.includes(session.id)}" aria-label="${favorites.includes(session.id) ? "取消收藏" : "收藏"}：${session.title}"><span aria-hidden="true">${favorites.includes(session.id) ? "✓" : "+"}</span> ${favorites.includes(session.id) ? "已收藏" : "收藏"}</button>
            </article>`,
                  )
                  .join("")
              : `<p class="empty">还没有收藏。先从全部议程中选一场分享。</p>`
          }
        </div>
      </section>
    </main>
    <footer><span>SEE CONF / 技术分享演示项目</span><code>vp check · vp test · vp build</code></footer>
  `;
}

app.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>("button");
  if (!button) return;

  if (button.id === "filter") {
    onlyFavorites = !onlyFavorites;
    render();
    document.querySelector<HTMLButtonElement>("#filter")?.focus();
    return;
  }

  const id = button.dataset.session;
  if (!id) return;
  const result = toggleFavorite(favorites, id, knownIds);
  favorites = result.ids;
  message =
    result.status === "limit"
      ? `最多收藏 ${MAX_FAVORITES} 场分享，请先取消一场收藏。`
      : result.status === "removed"
        ? "已取消收藏。"
        : "已加入我的议程。";

  try {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  } catch {
    message += " 浏览器存储不可用，刷新后不会保留。";
  }

  render();
  document.querySelector<HTMLButtonElement>(`[data-session="${id}"]`)?.focus();
});

render();
