document.getElementById("loginBtn").addEventListener("click", () => {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const erro = document.getElementById("erro");

  if (usuario === "joao" && senha === "1234") {
    window.location.href = "loja.html";
  } else {
    erro.textContent = "Usuário ou senha incorretos!";
  }
});
