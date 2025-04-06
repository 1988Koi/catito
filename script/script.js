document.addEventListener('DOMContentLoaded', () => {
    let dinheiro = parseInt(localStorage.getItem('dinheiro')) || 0;
    let cliquesTotais = parseInt(localStorage.getItem('cliquesTotais')) || 0;
    let dinheiroTotalGanho = parseInt(localStorage.getItem('dinheiroTotalGanho')) || 0;
    let skinAtual = localStorage.getItem('skinAtual') || null;
    let dinheiroPorSegundo = 0;
    valorPorClique = parseFloat(localStorage.getItem('valorporclique')) || 1;

    

    function atualizarUI() {
        document.getElementById('dinheiro').textContent = dinheiro.toFixed(2);
        document.getElementById('rps').textContent = dinheiroPorSegundo.toFixed(2);
        document.getElementById('trabalhar').addEventListener('click', trabalhar);
    }      

    const itensDisponiveis = [
        { nome: 'ração', preco: 7, quantidade: 0, incremento: 0.1, tipo: "click" },
        { nome: 'Arranhador', preco: 30, quantidade: 0, incremento: 0.5, tipo: "gerador"},
        { nome: 'Cama', preco: 200, quantidade: 0, incremento: 15, tipo: "gerador" },
        { nome: 'Fonte de água', preco: 500, quantidade: 0, incremento: 27, tipo: "gerador" },
        { nome: 'Dispenser de comida', preco: 900, quantidade: 0, incremento: 55, tipo: "gerador" },
        { nome: 'Casinha', preco: 1200, quantidade: 0, incremento: 100, tipo: "gerador" },
        { nome: 'Brinquedo', preco: 1700, quantidade: 0, incremento: 164, tipo: "gerador" },
        { nome: 'Laser', preco: 2000, quantidade: 0, incremento: 230, tipo: "click" },
        { nome: 'Serviço de mordomo', preco: 2400, quantidade: 0, incremento: 300, tipo: "gerador" },
        { nome: 'Ração Premium XX', preco: 2900, quantidade: 0, incremento: 390, tipo: "click" },
        { nome: 'Brinquedos que se mexem', preco: 3300, quantidade: 0, incremento: 500, tipo: "gerador"},
        { nome: 'Casinha maior', preco: 3600, quantidade: 0, incremento: 650, tipo: "gerador" },
        { nome: 'Coleirinha dourada', preco: 4000, quantidade: 0, incremento: 840, tipo: "gerador" },
        { nome: 'Mais gatos', preco: 5000, quantidade: 0, incremento: 1200, tipo: "gerador" },
        { nome: 'Ração final', preco: 10000, quantidade: 0, incremento: 1500, tipo: "gerador" }
      ];

      function renderizarItensLoja() {
        const lojaItens = document.getElementById('loja-itens');
        lojaItens.innerHTML = '';
      
        itensDisponiveis.forEach((item, index) => {
          const botao = document.createElement('button');
          botao.innerHTML = `
            ${item.nome}<br>
            R$${item.preco} <br>
            Possui: ${item.quantidade}
          `;
          
          botao.onclick = () => comprarItem(index);
          lojaItens.appendChild(botao);
          
        });
        
      }

      function comprarItem(index) {
        const item = itensDisponiveis[index];
        if (dinheiro >= item.preco) {
            dinheiro -= item.preco;
            item.quantidade += 1;
    
            if (item.tipo === "gerador") {
                dinheiroPorSegundo += item.incremento;
            } else if (item.tipo === "click") {
                valorPorClique += item.incremento;
            }
    
            item.preco = Math.floor(item.preco * 1.25);
    
            salvarProgresso();
            atualizarUI();
            renderizarItensLoja();
        } else {
            alert("Dinheiro insuficiente!");
        }
    }
    
      

    const rpsEl = document.getElementById('rps');
  
    const skinsDisponiveis = [
      { nome: 'Gatito default 1', arquivo: 'oggatito.jpg', preco: 0, desbloqueado: true },
      { nome: 'Gatito default 2', arquivo: 'ogtito.png', preco: 0, desbloqueado: true },
      { nome: 'Lalo Salatito', arquivo: 'lalogatito.jpg', preco: 10, desbloqueado: false },
      { nome: 'Saul Goodtito', arquivo: 'saulgatito.jpg', preco: 50, desbloqueado: false },
      { nome: 'Tyler the gatito', arquivo: 'tylergatito.jpg', preco: 100, desbloqueado: false },
      { nome: 'Johnny gatostar', arquivo: 'johnnygatito.jpg', preco: 150, desbloqueado: false },
      { nome: 'Gyro Zepetito', arquivo: 'gyrogatito.jpg', preco: 200, desbloqueado: false },
      { nome: 'Funny Valentito', arquivo: 'valentinegatito.jpg', preco: 300, desbloqueado: false },
      { nome: 'Diavotito', arquivo: 'diavologatito.jpg', preco: 300, desbloqueado: false },
      { nome: 'Gatito Pucci', arquivo: 'puccigatito.jpg', preco: 400, desbloqueado: false },
      { nome: 'Tito', arquivo: 'mexicogatito.jpg', preco: 500, desbloqueado: false },
      { nome: 'Jojito', arquivo: 'jojigatito.jpg', preco: 10000, desbloqueado: false},
      { nome: 'pepito', arquivo: 'pepito.jpg', preco: 472023, desbloqueado: false}
    ];

    let tempoInicio = localStorage.getItem('tempoInicio');

if (!tempoInicio) {
  tempoInicio = new Date().toISOString();
  localStorage.setItem('tempoInicio', tempoInicio);
}

function mostrarTempoDecorrido() {
    let nomeGato = localStorage.getItem('nomeGato') || 'Gatito';
    const inicio = new Date(tempoInicio);
    const agora = new Date();
    const diffMs = agora - inicio;

    const segundos = Math.floor(diffMs / 1000) % 60;
    const minutos = Math.floor(diffMs / 60000) % 60;
    const horas = Math.floor(diffMs / 3600000) % 24;
    const dias = Math.floor(diffMs / 86400000);

    let texto = '';
    if (dias > 0) texto += `${dias} dia${dias > 1 ? 's' : ''}, `;
    if (horas > 0 || dias > 0) texto += `${horas} hora${horas > 1 ? 's' : ''}, `;
    if (minutos > 0 || horas > 0 || dias > 0) texto += `${minutos} minuto${minutos !== 1 ? 's' : ''}, `;
    texto += `${segundos} segundo${segundos !== 1 ? 's' : ''}`;

    document.getElementById('tempo-decorrido').textContent = `Idade do ${nomeGato}: ${texto}`;

}
  

  mostrarTempoDecorrido();
  setInterval(mostrarTempoDecorrido, 1000);



    let nomeGato = localStorage.getItem('nomeGato') || '';

function salvarNomeGato() {
  const input = document.getElementById('nome-gato');
  nomeGato = input.value.trim();
  localStorage.setItem('nomeGato', nomeGato);
  exibirNomeGato();
}

exibirNomeGato();

function exibirNomeGato() {
  const nomeEl = document.getElementById('nome-gato-exibido');
  nomeEl.textContent = nomeGato ? `${nomeGato}` : '';
}


    function alternarCheats() {
        const cheatBox = document.getElementById('cheat-box');
        cheatBox.style.display = cheatBox.style.display === 'none' ? 'block' : 'none';
      }
      
      function usarCheat() {
        const codigo = document.getElementById('cheat-input').value.trim();
        const msg = document.getElementById('cheat-msg');
      
        switch (codigo.toLowerCase()) {
          case 'graninha':
            dinheiro += 100000;
            msg.textContent = "💰 Você ganhou R$100.000!";
            break;
          case 'uwu':
            dinheiro = Math.max(0, dinheiro - 100000);
            msg.textContent = "Você perdeu R$100.000!";
            break;
            case 'joji':
                const joji = skinsDisponiveis.find(s => s.nome === 'Joji gatito');        
                if (joji && !joji.desbloqueado) {
                  joji.desbloqueado = true;
                  salvarProgressoSkins();
                  renderizarSkins();
                  msg.textContent = "Melhor artista";
                } else {
                  msg.textContent = "Melhor artista";
                }
            break;
            case 'pepito':
                const pepito = skinsDisponiveis.find(s => s.nome === 'pepito gatito');        
                if (pepito && !pepito.desbloqueado) {
                  pepito.desbloqueado = true;
                  salvarProgressoSkins();
                  renderizarSkins();
                  msg.textContent = "🎉 Skin secreta desbloqueada!";
                } else {
                  msg.textContent = "❗ Já desbloqueada ou inexistente.";
                }
                break;
                
                default:
                    msg.textContent = "Código inválido ou desconhecido.";
                    break;
            }
            
      
        atualizarUI();
        salvarProgresso();


    }      
  
    function salvarProgresso() {
      const itensComprados = itensDisponiveis.filter(item => item.quantidade > 0);
      localStorage.setItem('itensComprados', JSON.stringify(itensComprados));
      localStorage.setItem('dinheiroPorSegundo', dinheiroPorSegundo);
      localStorage.setItem('valorPorClique', valorPorClique);
      localStorage.setItem('dinheiro', dinheiro);
      localStorage.setItem('cliquesTotais', cliquesTotais);
      localStorage.setItem('dinheiroTotalGanho', dinheiroTotalGanho);
      localStorage.setItem('skinAtual', skinAtual);
      localStorage.setItem('itensComprados', JSON.stringify(itensDisponiveis));
    }
  
    function salvarProgressoSkins() {
      localStorage.setItem('skinsDesbloqueadas', JSON.stringify(skinsDisponiveis.map(s => s.desbloqueado)));
    }

    function resetarJogo() {
        if (confirm("Tem certeza que quer resetar tudo?")) {
            dinheiro = 0;
            cliquesTotais = 0;
            dinheiroTotalGanho = 0;
            dinheiroPorSegundo = 0;
            valorPorClique = 1;
            itensDisponiveis.forEach(item => {
                item.quantidade = 0;
                item.preco = item.preco / Math.pow(1.25, localStorage.getItem('itensComprados') ? JSON.parse(localStorage.getItem('itensComprados')).filter(i => i.nome === item.nome)[0]?.quantidade || 0 : 0);
            });
            skinsDisponiveis.forEach(s => s.desbloqueado = s.preco === 0);
            localStorage.setItem('skinAtual', 'oggatito.jpg');
            skinAtual = 'oggatito.jpg';
    
            localStorage.removeItem('itensComprados');
            console.log('Itens comprados removidos.');
    
            localStorage.removeItem('dinheiroPorSegundo');
            localStorage.removeItem('valorPorClique');
            localStorage.removeItem('dinheiro');
            localStorage.removeItem('cliquesTotais');
            localStorage.removeItem('dinheiroTotalGanho');
            localStorage.removeItem('skinsDesbloqueadas');

    
            localStorage.setItem('nomeGato', 'Gato Virtual');
            localStorage.removeItem('tempoInicio');
    
            atualizarUI();
            renderizarItensLoja();
            window.location.reload();
        }
    }
         
  
    function carregarProgressoSkins() {
      const salvas = JSON.parse(localStorage.getItem('skinsDesbloqueadas'));
      if (salvas) {
        salvas.forEach((val, i) => {
          if (skinsDisponiveis[i]) skinsDisponiveis[i].desbloqueado = val;
        });
      }
    }

    function carregarItensComprados() {
        const salvos = JSON.parse(localStorage.getItem('itensComprados'));
        if (salvos) {
          salvos.forEach((item, i) => {
            if (itensDisponiveis[i]) {
              itensDisponiveis[i].quantidade = item.quantidade;
              itensDisponiveis[i].preco = item.preco;
              dinheiroPorSegundo += itensDisponiveis[i].incremento * item.quantidade;
            }
          });
        }
      }
      

    function alternarLoja() {
        const loja = document.getElementById('loja-itens');
        if (loja.style.display === 'none') {
          loja.style.display = 'block';
        } else {
          loja.style.display = 'none';
        }
      }
      
  
  
    function trabalhar() {
        dinheiro += valorPorClique;
        dinheiroTotalGanho += valorPorClique;
        atualizarUI();
        salvarProgresso();
      }
      
  
    function comprarSkin(arquivo, preco) {
      const skin = skinsDisponiveis.find(s => s.arquivo === arquivo);
      if (!skin) return;
  
      if (skin.desbloqueado || dinheiro >= preco) {
        if (!skin.desbloqueado) {
          dinheiro -= preco;
          skin.desbloqueado = true;
          salvarProgressoSkins();
        }
        document.getElementById('gato-img').src = `img/${arquivo}`;
        skinAtual = arquivo;
        atualizarUI();
        salvarProgresso();
      } else {
        alert("Você não tem dinheiro suficiente para essa skin!");
      }
    }

      
  
    function renderizarSkins() {
        const lojaSkins = document.getElementById('loja-skins');
        lojaSkins.innerHTML = '';
        skinsDisponiveis.forEach(skin => {
          if (skin.secreta && !skin.desbloqueado) return;
      
          const botao = document.createElement('button');
          botao.innerHTML = `
            <img src="img/${skin.arquivo}" alt="${skin.nome}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
            <br>${skin.nome}<br>${skin.desbloqueado ? '✔️ Desbloqueado' : 'R$' + skin.preco}
          `;
          botao.onclick = () => comprarSkin(skin.arquivo, skin.preco);
          lojaSkins.appendChild(botao);
        });
      }
      
  
  
    window.comprarSkin = comprarSkin;
    window.alternarLoja = alternarLoja;
    window.usarCheat = usarCheat;
    window.alternarCheats = alternarCheats;
    window.resetarJogo = resetarJogo; 
    window.salvarNomeGato = salvarNomeGato;
    window.exibirNomeGato = exibirNomeGato;
    window.comprarItem = comprarItem;
    window.renderizarItensLoja = renderizarItensLoja;
  
    carregarProgressoSkins();
    renderizarSkins();
    atualizarUI();
  
    const imagemDefault = 'ogatito.jpg';

    document.getElementById('gato-img').src = skinAtual ? `img/${skinAtual}` : `img/${imagemDefault}`;
    
    setInterval(() => {
        dinheiro += dinheiroPorSegundo;
        dinheiroTotalGanho += dinheiroPorSegundo;
        atualizarUI();
        salvarProgresso();
      }, 1000);
      
  carregarItensComprados();
  carregarProgressoSkins();
  renderizarSkins();
  renderizarItensLoja();
  atualizarUI();
  exibirNomeGato();
  });