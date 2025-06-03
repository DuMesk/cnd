
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
    const url = `${urlPlanilha}?acao=alterarStatus&linha=${index}&status=${novoStatus}&callback=callbackStatus`;

    const script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);

    window.callbackStatus = function(response) {
        if (response.status === "sucesso") {
            Swal.fire({
                title: 'Status atualizado!',
                text: `Agendamento marcado como "${novoStatus}".`,
                icon: 'success',
                confirmButtonColor: '#D4AFB9'
            });
            carregarAgendamentos();
        } else {
            Swal.fire({
                title: 'Erro!',
                text: response.mensagem || 'Não foi possível atualizar o status.',
                icon: 'error',
                confirmButtonColor: '#D4AFB9'
            });
        }
    };
}




function formatarDataBR(data) {
    if (!data) return "";

    // Se já vier no formato DD/MM/YYYY
    if (data.includes("/")) {
        return data;
    }

    // Se vier no formato YYYY-MM-DD
    if (data.includes("-")) {
        const [ano, mes, dia] = data.split("-");
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }

    // Se vier como objeto Date (ex.: Wed Jun 04 2025 ...)
    const dataObj = new Date(data);
    if (!isNaN(dataObj.getTime())) {
        const dia = String(dataObj.getDate()).padStart(2, '0');
        const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
        const ano = dataObj.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    // Se não reconhece, retorna como veio
    return data;
}

