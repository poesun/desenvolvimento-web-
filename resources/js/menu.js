
(function () {
  const itens = [
    { href: '/index.html',                icon: 'bi-person-circle',       txt: 'login' },
    { href: '/aaa.html',                  icon: 'bi-record-circle-fill',  txt: 'pokemon' },
    { href: '/atkitens/habilidades.html', icon: 'bi-fire',                txt: 'habilidades' },
    { href: '/atkitens/itens.html',       icon: 'bi-disc',                txt: 'itens' },
  ];

  const links = itens.map(i => `
    <li class="item-menu">
      <a href="${i.href}">
        <span class="icon"><i class="bi ${i.icon}"></i></span>
        <span class="txt-link">${i.txt}</span>
      </a>
    </li>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <nav class="menu-lateral">
      <div class="btn-expandir"><i class="bi bi-list"></i></div>
      <ul>${links}</ul>
    </nav>`);
})();
