function mostrarCadastro() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("cadastro-login-container").style.display = "block";
}

function voltarLoginDeCadastro() {
  document.getElementById("cadastro-login-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
}

function criarConta() {
  const usuario = document.getElementById("novoUsuario").value.trim();
  const email = document.getElementById("novoEmail").value.trim();
  const senha = document.getElementById("novaSenha").value;
  const confirmar = document.getElementById("confirmarSenha").value;
  const erro = document.getElementById("erro-cadastro");

  if (!usuario || !email || !senha || !confirmar) {
    erro.textContent = "Preencha todos os campos.";
    return;
  }

  if (senha !== confirmar) {
    erro.textContent = "As senhas não coincidem.";
    return;
  }

  const contas = JSON.parse(localStorage.getItem("contas") || "[]");
  if (contas.some(c => c.usuario === usuario || c.email === email)) {
    erro.textContent = "Usuário ou email já cadastrado.";
    return;
  }

  contas.push({ usuario, email, senha });
  localStorage.setItem("contas", JSON.stringify(contas));
  alert("Conta criada com sucesso!");
  voltarLoginDeCadastro();
}


let enderecoCompleto = "";
let timeout;

window.onload = () => {
  listarVoluntarios();
  if (localStorage.getItem("logado") === "true") {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app").style.display = "block";
    resetarInatividade();
    document.body.addEventListener("click", resetarInatividade);
    document.body.addEventListener("keydown", resetarInatividade);
  }
};

function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const contas = JSON.parse(localStorage.getItem("contas") || "[]");

  const contaValida = contas.find(c => c.usuario === usuario && c.senha === senha);

  if (contaValida) {
    localStorage.setItem("logado", "true");
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app").style.display = "block";
    resetarInatividade();
    document.body.addEventListener("click", resetarInatividade);
    document.body.addEventListener("keydown", resetarInatividade);
  } else {
    document.getElementById("login-erro").textContent = "Usuário ou senha incorretos";
  }
}

function cadastrarLogin() {
  const usuario = prompt("Novo nome de usuário:");
  const senha = prompt("Nova senha:");
  if (usuario && senha) {
    const contas = JSON.parse(localStorage.getItem("contas") || "[]");
    contas.push({ usuario, senha });
    localStorage.setItem("contas", JSON.stringify(contas));
    alert("Usuário cadastrado com sucesso!");
  }
}

function voltarLogin() {
  localStorage.setItem("logado", "false");
  document.getElementById("app").style.display = "none";
  document.getElementById("login-container").style.display = "block";
}

function mostrarSecao(id) {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function buscarCEP(cep) {
  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(res => res.json())
      .then(data => {
        enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        document.getElementById("endereco").textContent = enderecoCompleto;
      });
  }
}

function buscarClima(cidade) {
  const chave = "f52258f360a0c8e09540ad558293f96e";
  return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${chave}&units=metric&lang=pt_br`)
    .then(res => res.json())
    .then(data => data.main.temp)
    .catch(() => null);
}

async function cadastrarVoluntario() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;

  if (!nome || !email || !enderecoCompleto) {
    document.getElementById("erro-cadastro").textContent = "Preencha todos os campos e CEP válido.";
    return;
  }

  const voluntarios = JSON.parse(localStorage.getItem("voluntarios") || "[]");

  if (voluntarios.some(v => v.email === email)) {
    document.getElementById("erro-cadastro").textContent = "Email já cadastrado.";
    return;
  }

  const unsplashKey = "Q-TnypTmOHCv3eY6sAE3fgrWRhHkluMTobURc7wmQy4";
  const cidade = enderecoCompleto.split(',')[2]?.split('-')[0]?.trim() || '';
  const temp = await buscarClima(cidade);

  fetch(`https://api.unsplash.com/photos/random?query=voluntario&client_id=${unsplashKey}`)
    .then(res => res.json())
    .then(data => {
      const imagem = data.urls?.small || "https://via.placeholder.com/160?text=Voluntario";

      voluntarios.push({ nome, email, endereco: enderecoCompleto, imagem, temperatura: temp });
      localStorage.setItem("voluntarios", JSON.stringify(voluntarios));

      document.getElementById("nome").value = "";
      document.getElementById("email").value = "";
      document.getElementById("cep").value = "";
      document.getElementById("endereco").textContent = "";
      document.getElementById("erro-cadastro").textContent = "";

      listarVoluntarios();
    })
    .catch(() => alert("Erro ao carregar imagem do Unsplash."));
}

function listarVoluntarios() {
  const container = document.getElementById("voluntarios");
  const filtro = (document.getElementById("filtro")?.value || "").toLowerCase();
  const voluntarios = JSON.parse(localStorage.getItem("voluntarios") || "[]");

  container.innerHTML = "";

  voluntarios
    .filter(v => v.nome.toLowerCase().includes(filtro))
    .forEach(v => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${v.imagem}" alt="Foto">
        <div class="card-content">
          <strong>${v.nome}</strong>
          <small>${v.email}</small>
          <small>${v.endereco}</small>
          <div class="temp">Temperatura: ${v.temperatura ? v.temperatura + "°C" : "N/A"}</div>
        </div>
        <button onclick="excluirVoluntario('${v.email}')">Excluir</button>
      `;
      container.appendChild(card);
    });
}

function excluirVoluntario(email) {
  const voluntarios = JSON.parse(localStorage.getItem("voluntarios") || "[]");
  const novos = voluntarios.filter(v => v.email !== email);
  localStorage.setItem("voluntarios", JSON.stringify(novos));
  listarVoluntarios();
}

function limparTudo() {
  localStorage.removeItem("voluntarios");
  listarVoluntarios();
}

function filtrarVoluntarios() {
  listarVoluntarios();
}

function resetarInatividade() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    alert("Sessão expirada por inatividade.");
    window.location.reload();
  }, 5 * 60 * 1000);
}
