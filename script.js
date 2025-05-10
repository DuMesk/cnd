
const senhaCorreta = "admin123";
const urlPlanilha = "https://script.google.com/macros/s/AKfycbw5RW-lmA3abuh9z-ti0jL219fcQv8kd2GQgJJdL4BAKMN81jLByQ0YoLJDtPq4DvJ0_g/exec";
                    

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
    fetch(urlPlanilha)
        .then(res => res.json())
        .then(dados => {
            const corpo = document.querySelector("#tabela tbody");
            corpo.innerHTML = "";
            dados.forEach((item, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <tr>
                    <td data-label="Nome">${item.nome}</td>
                    <td data-label="Data">${formatarDataBR(item.dataEscolhida)}</td>
                    <td data-label="Hora">${item.horarioEscolhido}</td>
                    <td data-label="Serviço">${item.servico || '-'}</td>
                    <td data-label="Status">${item.status || 'Pendente'}</td>
                    <td data-label="Ações">
                        <button onclick="alterarStatus(${index}, 'Confirmado')">Confirmar</button>
                        <button onclick="alterarStatus(${index}, 'Cancelado')">Cancelar</button>
                    </td>
                    </tr>

                `;
                corpo.appendChild(tr);
            });
        });
}

function alterarStatus(index, novoStatus) {
    fetch(urlPlanilha, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            acao: 'alterarStatus',
            linha: index + 2, // linha na planilha
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
