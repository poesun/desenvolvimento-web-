const MAX_MOVES = 5;      
const LAST_ID = 151;

const $ = (sel) => document.querySelector(sel);
const clamp = (n) => Math.min(Math.max(n, 1), LAST_ID);

let pokemonId = clamp(parseInt(new URLSearchParams(location.search).get("id")) || 1); 
let moves = [];
let showingAll = false;
let requestToken = 0;    

const getJSON = async (url) => {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} em ${url}`);
  return resp.json();
};

const english = (list, key = "effect") =>
  list?.find((e) => e.language.name === "en")?.[key] ?? "";

async function getAbilities(pokemon) {
  return Promise.all(pokemon.abilities.map(async ({ ability }) => {
    const data = await getJSON(ability.url);
    const name = data.names.find((n) => n.language.name === "en")?.name ?? ability.name;
    return `${name}: ${english(data.effect_entries) || "Sem descrição."}`;
  }));
}

async function getMoves(pokemon) {
  
  const levelUp = pokemon.moves.map((m) => {
    const details = m.version_group_details.filter((d) => d.move_learn_method.name === "level-up");
    if (!details.length) return null;
    const d = details.find((x) => x.version_group.name === "red-blue") ?? details[0];
    return { url: m.move.url, level: d.level_learned_at };
  }).filter(Boolean).sort((a, b) => a.level - b.level);

  
  return Promise.all(levelUp.map(async ({ url, level }) => {
    const m = await getJSON(url);
    return {
      name: m.name.replaceAll("-", " "),
      level,
      type: m.type.name,
      power: m.power ?? "-",
      pp: m.pp ?? "-",
      desc: english(m.effect_entries).replace("$effect_chance", m.effect_chance),
    };
  }));
}

function renderMoves() {
  const list = showingAll ? moves : moves.slice(0, MAX_MOVES);   
  $(".moves").innerHTML = list.map((m) => `
    <li>
      <strong>${m.name}</strong> (Nível ${m.level})
      <span class="type-badge type-${m.type}">${m.type}</span><br>
      Power: ${m.power} | PP: ${m.pp}<br>
      ${m.desc}
    </li>`).join("");
  $(".see-more-button").hidden = showingAll || moves.length <= MAX_MOVES;
  $(".see-less-button").hidden = !showingAll;
}

async function loadPokemon(id) {
  const token = ++requestToken;
  try {
    const p = await getJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (token !== requestToken) return;
    pokemonId = id;
    history.replaceState(null, "", `?id=${id}`);

    
    $(".name").textContent = p.name;
    $(".imgContainer img").src = p.sprites.front_default;
    $(".height").textContent = `${p.height / 10} m`;
    $(".weight").textContent = `${p.weight / 10} kg`;
    $(".type").innerHTML = p.types.map((t) => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`).join("");
    $(".pokemon-stats").innerHTML = p.stats.map((s) => `<li>${s.stat.name}: ${s.base_stat}</li>`).join("");
    $(".back-pokemon-button").disabled = id <= 1;
    $(".next-pokemon-button").disabled = id >= LAST_ID;
    $(".abilities").innerHTML = "<li>Carregando...</li>";
    $(".moves").innerHTML = "<li>Carregando...</li>";
    $(".see-more-button").hidden = true;
    $(".see-less-button").hidden = true;

    const [abilities, mv] = await Promise.all([getAbilities(p), getMoves(p)]);
    if (token !== requestToken) return;

    $(".abilities").innerHTML = abilities.map((a) => `<li>${a}</li><br>`).join("");
    moves = mv;
    showingAll = false;
    renderMoves();
  } catch (err) {
    console.error(err);
    if (token === requestToken) $(".name").textContent = "Erro ao carregar o Pokémon";
  }
}

$(".next-pokemon-button").addEventListener("click", () => loadPokemon(clamp(pokemonId + 1)));
$(".back-pokemon-button").addEventListener("click", () => loadPokemon(clamp(pokemonId - 1)));
$(".see-more-button").addEventListener("click", () => { showingAll = true; renderMoves(); });
$(".see-less-button").addEventListener("click", () => { showingAll = false; renderMoves(); });

loadPokemon(pokemonId);
