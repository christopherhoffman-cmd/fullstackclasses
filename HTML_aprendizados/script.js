function mostrarDataAtual() {
    const dataAtual = new Date();

    const dataFormatada = dataAtual.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    // Mostra a data atual no parágrafo
    document.getElementById("minhaDiv").textContent = dataFormatada;
}

// Executa quando a página carrega
mostrarDataAtual();


function preencherMensagem() {
    const paragrafo = document.getElementById("mensagem");

    if (paragrafo) {
        paragrafo.textContent =
            "JavaScript é uma linguagem de programação versátil e amplamente utilizada para desenvolvimento web.";
    }
}

// Preenche a mensagem
preencherMensagem();


function calcularMediaFormulario() {

    // Pega o nome digitado
    const nome = document.getElementById("nomeAluno").value;

    // Pega as notas e transforma em números
    const n1 = parseFloat(document.getElementById("nota1").value);
    const n2 = parseFloat(document.getElementById("nota2").value);

    // Verifica se as notas foram preenchidas corretamente
    if (isNaN(n1) || isNaN(n2)) {
        document.getElementById("resultadoMedia").textContent =
            "Por favor, insira notas válidas!";
        return;
    }

    // Calcula a média
    const media = (n1 + n2) / 2;

    // Mostra o resultado
    document.getElementById("resultadoMedia").textContent =
        "Olá, " + nome + "! A sua média é: " + media.toFixed(1);
}


function calcularDobroNumero(numero) {
    // Pega o número digitado
    const n = numero;

    if (isNaN(n)) {
        document.getElementById("resultadoDobro").textContent =
            "Por favor, insira um número válido!";
        return;
    }

    // Calcula o dobro
    const dobro = n * 2;

    // Mostra o resultado
    document.getElementById("resultadoDobro").textContent =
        `O dobro de ${numero} é: ${dobro}`;
}

calcularDobroNumero(5); // Exemplo de chamada da função com o número 5

function somar(numero1, numero2) {
    // Pega os números digitados
    const n1 = parseFloat(numero1);
    const n2 = parseFloat(numero2);

    if (isNaN(n1) || isNaN(n2)) {
        document.getElementById("resultadoSoma").textContent =
            "Por favor, insira números válidos!";
        return;
    }

   const soma = n1 + n2;

    // Mostra o resultado
    document.getElementById("resultadoSoma").textContent =
        "A soma de " + n1 + " e " + n2 + " é: " + soma;
}

somar(3.5, 7.2); // Exemplo de chamada da função com os números 3.5 e 7.2

function receberNome() {
    const nome = document.getElementById("nome").value;
    console.log(`Nome recebido: ${nome}`);
    document.getElementById("resultadoNome").textContent = "Olá, " + nome + "! Seja bem-vindo.";

}
