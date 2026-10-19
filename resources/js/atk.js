const LAST_GEN1_MOVE = 165;   
const MOVES_PER_PAGE = 30;

async function getMove(id) {
  const resp = await fetch(`https://pokeapi.co/api/v2/move/${id}`);
  if (!resp.ok) return null;
  const m = await resp.json();
  const text = m.flavor_text_entries.find(e => e.language.name === "en")?.flavor_text ?? "Sem descrição.";
  return {
    name: m.name.replaceAll("-", " "),
    type: m.type.name,
    power: m.power ?? "-",          
    accuracy: m.accuracy ?? "-",
    pp: m.pp ?? "-",
    description: text.replace(/[\n\f]/g, " "),
  };
}


async function getFirstGenMoves() {
  const ids = Array.from({ length: LAST_GEN1_MOVE }, (_, i) => i + 1);
  const moves = await Promise.all(ids.map(getMove));
  return moves.filter(Boolean);
}

function setupPagination(moves) {
  const list = document.getElementById("moves-list");
  const prev = document.getElementById("prev-button");
  const next = document.getElementById("next-button");
  const info = document.getElementById("page-info");
  const totalPages = Math.ceil(moves.length / MOVES_PER_PAGE);
  let page = 1;

  function render() {
    const start = (page - 1) * MOVES_PER_PAGE;
    list.innerHTML = moves.slice(start, start + MOVES_PER_PAGE).map(m => `
      <li>
        <strong class="type-badge type-${m.type}">${m.name}</strong> - ${m.type}<br>
        <em>Power:</em> ${m.power}<br>
        <em>Accuracy:</em> ${m.accuracy}<br>
        <em>PP:</em> ${m.pp}<br>
        <em>Descrição:</em> ${m.description}
      </li>`).join("");
    prev.disabled = page === 1;
    next.disabled = page === totalPages;
    info.textContent = `Página ${page} de ${totalPages}`;
  }

  prev.addEventListener("click", () => { if (page > 1) { page--; render(); } });
  next.addEventListener("click", () => { if (page < totalPages) { page++; render(); } });
  render();
}

getFirstGenMoves()
  .then(setupPagination)
  .catch(err => {
    console.error(err);
    document.getElementById("moves-list").innerHTML = "<li>Erro ao carregar os ataques.</li>";
  });
