
const senhaCorreta = "admin123";
const urlPlanilha = "https://script.google.com/macros/s/AKfycbxZMSj_JPcpS_HJrKyiLta7yE8aLCaffqcljA42J1Kp9gIZ5JHpu_HOOwBRLQIzfW4rhg/exec";

function verificarSenha() {
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erro");
    if (senha === senhaCorreta) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("painel").style.display = "block";
        carregarAgendamentos();
    } else {
        erro.textContent = "Senha incorreta!";
    }
}

function carregarAgendamentos() {
    const url = `${urlPlanilha}?acao=listarTodos&callback=callback`;

    const script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);

    window.callback = function(response) {
        if (response.status !== "sucesso") {
            console.error("Erro ao carregar dados:", response);
            return;
        }

        const dados = response.registros;
        const corpo = document.querySelector("#tabela tbody");
        corpo.innerHTML = "";

        dados.forEach((item, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="Nome">${item.nome}</td>
                <td data-label="Data">${formatarDataBR(item.data)}</td>
                <td data-label="Hora">${item.hora}</td>
                <td data-label="Serviço">${item.serviço || '-'}</td>
                <td data-label="Status">${item.status || 'Pendente'}</td>
                <td data-label="Ações">
                    <button onclick="alterarStatus(${index + 2}, 'Confirmado')">Confirmar</button>
                    <button onclick="alterarStatus(${index + 2}, 'Cancelado')">Cancelar</button>
                </td>
            `;
            corpo.appendChild(tr);
        });
    };
}


function alterarStatus(index, novoStatus) {
    fetch(urlPlanilha, {
        method: 'POST',
        mode: no-cors,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            acao: 'alterarStatus',
            linha: index, // linha na planilha
            status: novoStatus
        })
    })
    .then(res => res.json()) // Aqui esperamos uma resposta JSON
    .then(response => {
        if (response.resultado === 'sucesso') {
            Swal.fire({
                title: 'Status atualizado!',
                text: `Agendamento marcado como "${novoStatus}".`,
                icon: 'success',
                confirmButtonColor: '#D4AFB9'
            });
            carregarAgendamentos(); // Atualiza a tabela do painel
        } else {
            throw new Error(response.mensagem || 'Erro ao atualizar status.');
        }
    })
    .catch(error => {
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível atualizar o status.',
            icon: 'error',
            confirmButtonColor: '#D4AFB9'
        });
        console.error(error);
    });
}



function formatarDataBR(dataISO) {
    const data = new Date(dataISO);
    if (!isNaN(data.getTime())) {
        return data.toLocaleDateString('pt-BR');
    }
    return dataISO;
}
