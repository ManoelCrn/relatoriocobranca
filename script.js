document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-registro");
    const tabelaMeses = document.getElementById("tabela-meses");
    const corpoTabelaMeses = document.getElementById("corpo-tabela-meses");
    const corpoTabelaRegistros = document.getElementById("corpo-tabela-registros");
    const selecionarTodosChk = document.getElementById("selecionarTodos");
    const adicionarBtn = document.getElementById("adicionar");
    const limparBtn = document.getElementById("limpar");
    const removerSelecionadosBtn = document.getElementById("removerSelecionados");
    const gerarRelatorioBtn = document.getElementById("gerarRelatorio");
    const gerarRelatorioAssociadoBtn = document.getElementById("gerarRelatorioAssociado");
    const acoesTabela = document.getElementById("acoes-tabela");
    const matriculaInput = document.getElementById("matricula");

    let registros = [];
    const multa = 2; // 2% fixa
    const juros = 1; // 1% ao mês

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const abrevMes = {
        "Janeiro": "JAN", "Fevereiro": "FEV", "Março": "MAR", "Abril": "ABR",
        "Maio": "MAI", "Junho": "JUN", "Julho": "JUL", "Agosto": "AGO",
        "Setembro": "SET", "Outubro": "OUT", "Novembro": "NOV", "Dezembro": "DEZ"
    };

    const valoresParticular = {
        2007: 15, 2008: 15, 2009: 15, 2010: 20, 2011: 20,
        2012: 20, 2013: 30, 2014: 50, 2015: 50, 2016: 50,
        2017: 60, 2018: 65, 2019: 68, 2020: 72, 2021: 75,
        2022: 80, 2023: 85, 2024: 90, 2025: 95
    };

    const valoresSUS = {
        2007: 1, 2008: 1, 2009: 1, 2010: 2, 2011: 2,
        2012: 2, 2013: 5, 2014: 10, 2015: 10, 2016: 10,
        2017: 20, 2018: 20, 2019: 20, 2020: 20, 2021: 20,
        2022: 25, 2023: 30, 2024: 30, 2025: 30
    };

    if (matriculaInput) {
        matriculaInput.addEventListener("input", () => {
            matriculaInput.value = matriculaInput.value.replace(/\D/g, "");
        });
    }

    function getValorBase(tipo, ano) {
        if (tipo === "Convênio/Plano de Saúde") return valoresParticular[ano] ?? 95;
        if (tipo === "SUS") return valoresSUS[ano] ?? 1;
        return 0;
    }

    function calculaMesesAtraso(ano, mesIndex) {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();
        let atraso = 0;

        if (ano < anoAtual) {
            atraso = (anoAtual - ano) * 12 + (mesAtual - mesIndex);
        } else if (ano === anoAtual) {
            atraso = mesAtual - mesIndex;
            if (atraso < 0) atraso = 0;
        }
        return atraso;
    }

    function atualizarTabelaMeses() {
        const ano = parseInt(document.getElementById("ano").value);
        const tipo = document.getElementById("tipo").value;

        if (!ano || ano < 2007 || ano > 2100 || !["Convênio/Plano de Saúde", "SUS"].includes(tipo)) {
            tabelaMeses.style.display = "none";
            acoesTabela.style.display = "none";
            return;
        }

        const valorBaseAno = getValorBase(tipo, ano);
        corpoTabelaMeses.innerHTML = "";

        meses.forEach((mes, i) => {
            const mesesAtraso = calculaMesesAtraso(ano, i);

            let totalAtualizado = valorBaseAno;
            if (mesesAtraso > 0) {
                totalAtualizado += (valorBaseAno * multa / 100) + (valorBaseAno * (juros / 100) * mesesAtraso);
            }

            corpoTabelaMeses.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="mes-selecionado" value="${mes}" data-mensalidade="${valorBaseAno}" data-atraso="${mesesAtraso}" data-total="${totalAtualizado.toFixed(2)}"></td>
                    <td>${mes}</td>
                    <td>${valorBaseAno.toFixed(2)}</td>
                    <td>${mesesAtraso > 0 ? multa : 0}</td>
                    <td>${mesesAtraso > 0 ? juros : 0}</td>
                    <td>${mesesAtraso}</td>
                    <td class="total-atualizado">${totalAtualizado.toFixed(2)}</td>
                </tr>
            `;
        });

        tabelaMeses.style.display = "table";
        acoesTabela.style.display = "flex";
        if (selecionarTodosChk) selecionarTodosChk.checked = false;
    }

    const anoInput = document.getElementById("ano");
    const tipoSelect = document.getElementById("tipo");
    if (anoInput) anoInput.addEventListener("input", atualizarTabelaMeses);
    if (tipoSelect) tipoSelect.addEventListener("change", atualizarTabelaMeses);

    if (selecionarTodosChk) {
        selecionarTodosChk.addEventListener("change", () => {
            document.querySelectorAll(".mes-selecionado").forEach(chk => chk.checked = selecionarTodosChk.checked);
        });
    }

    // ** Alteração principal aqui **
    if (adicionarBtn) {
        adicionarBtn.addEventListener("click", () => {
            const matricula = document.getElementById("matricula").value.trim();
            const nome = document.getElementById("nome").value.trim();
            const tipo = document.getElementById("tipo").value;
            const colaborador = document.getElementById("colaborador").value.trim();
            const ano = document.getElementById("ano").value;

            if (!matricula || !nome || !tipo || !colaborador || !ano) {
                alert("Preencha todos os campos.");
                return;
            }

            const mesesSelecionados = [];
            document.querySelectorAll("#corpo-tabela-meses tr").forEach(linha => {
                const chk = linha.querySelector(".mes-selecionado");
                if (chk && chk.checked) {
                    mesesSelecionados.push({
                        descricao: `${chk.value} - ${ano}`,
                        mensalidade: parseFloat(chk.dataset.mensalidade),
                        mesesAtraso: parseInt(chk.dataset.atraso),
                        multa: parseInt(chk.dataset.atraso) > 0 ? multa : 0,
                        juros: parseInt(chk.dataset.atraso) > 0 ? juros : 0,
                        valorTotal: parseFloat(chk.dataset.total)
                    });
                }
            });

            if (mesesSelecionados.length === 0) {
                alert("Selecione pelo menos um mês.");
                return;
            }

            // 🔹 VALIDAÇÃO: verificar se já existe registro com mesma matrícula e ano
            const existe = registros.some(r => r.matricula === matricula && r.ano === ano);
            if (existe) {
                alert("Esse ano já foi adicionado para essa matrícula. Se precisar, clique no botão Editar.");
                return;
            }

            // Se passou na validação, adiciona
            registros.push({ matricula, nome, tipo, colaborador, ano, mesesSelecionados });
            atualizarTabelaRegistros();

            // NÃO limpar formulário para manter os dados
            // form.reset();

            // Manter tabela e botões visíveis
            tabelaMeses.style.display = "table";
            acoesTabela.style.display = "flex";

            // Mostrar botão limpar
            limparBtn.style.display = "inline-block";
        });
    }

    if (limparBtn) {
        limparBtn.addEventListener("click", () => {
            form.reset();
            tabelaMeses.style.display = "none";
            acoesTabela.style.display = "none";

            // Esconder botão limpar novamente após limpar
            limparBtn.style.display = "none";
        });
    }

    function atualizarTabelaRegistros() {
        corpoTabelaRegistros.innerHTML = "";
        registros.forEach((reg, index) => {
            corpoTabelaRegistros.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="registro-selecionado" data-index="${index}"></td>
                    <td>${reg.matricula}</td>
                    <td>${reg.nome}</td>
                    <td>${reg.tipo}</td>
                    <td>${reg.colaborador}</td>
                    <td>${reg.ano}</td>
                    <td>${reg.mesesSelecionados.map(m => `${m.descricao} (R$ ${m.valorTotal.toFixed(2)})`).join(", ")}</td>
                    <td>
                        <button onclick="editarRegistro(${index})">Editar</button>
                        <button onclick="removerRegistro(${index})">Remover</button>
                    </td>
                </tr>
            `;
        });
    }

    window.editarRegistro = (index) => {
        const reg = registros[index];
        document.getElementById("matricula").value = reg.matricula;
        document.getElementById("nome").value = reg.nome;
        document.getElementById("tipo").value = reg.tipo;
        document.getElementById("colaborador").value = reg.colaborador;
        document.getElementById("ano").value = reg.ano;
        tabelaMeses.style.display = "table";
        acoesTabela.style.display = "flex";

        document.querySelectorAll(".mes-selecionado").forEach(chk => {
            chk.checked = reg.mesesSelecionados.some(m => m.descricao.startsWith(chk.value));
        });

        registros.splice(index, 1);
        atualizarTabelaRegistros();
    };

    window.removerRegistro = (index) => {
        registros.splice(index, 1);
        atualizarTabelaRegistros();
    };

    if (removerSelecionadosBtn) {
        removerSelecionadosBtn.addEventListener("click", () => {
            const selecionados = document.querySelectorAll(".registro-selecionado:checked");
            const indices = Array.from(selecionados).map(chk => parseInt(chk.dataset.index));
            registros = registros.filter((_, idx) => !indices.includes(idx));
            atualizarTabelaRegistros();
        });
    }

    if (gerarRelatorioBtn) {
        gerarRelatorioBtn.addEventListener("click", () => {
            const selecionados = document.querySelectorAll(".registro-selecionado:checked");
            if (selecionados.length === 0) {
                alert("Selecione pelo menos um registro para gerar o relatório.");
                return;
            }

            const indices = Array.from(selecionados).map(chk => parseInt(chk.dataset.index));
            const registrosSelecionados = registros.filter((_, idx) => indices.includes(idx));

            const matriculas = [...new Set(registrosSelecionados.map(r => r.matricula))];
            if (matriculas.length > 1) {
                alert("Todos os registros devem ser da mesma matrícula para gerar o relatório.");
                return;
            }

            const dadosRelatorio = {
                matricula: registrosSelecionados[0].matricula,
                nome: registrosSelecionados[0].nome,
                tipo: registrosSelecionados[0].tipo,
                colaborador: registrosSelecionados[0].colaborador,
                mensalidades: registrosSelecionados.flatMap(r => r.mesesSelecionados)
            };

            // Aqui fazemos a alteração: gerar as tabelas SEM <tfoot> e com total fora da tabela
            localStorage.setItem("dadosRelatorio", JSON.stringify(dadosRelatorio));
            window.open("relatorio.html", "_blank");
        });
    }

    if (gerarRelatorioAssociadoBtn) {
        gerarRelatorioAssociadoBtn.addEventListener("click", () => {
            const selecionados = document.querySelectorAll(".registro-selecionado:checked");
            if (selecionados.length === 0) {
                alert("Selecione pelo menos um registro para gerar o relatório do associado.");
                return;
            }

            const indices = Array.from(selecionados).map(chk => parseInt(chk.dataset.index));
            const registrosSelecionados = registros.filter((_, idx) => indices.includes(idx));

            const matriculas = [...new Set(registrosSelecionados.map(r => r.matricula))];
            if (matriculas.length > 1) {
                alert("Todos os registros devem ser da mesma matrícula para gerar o relatório do associado.");
                return;
            }

            const mensalidadesPlanas = registrosSelecionados.flatMap(r =>
                r.mesesSelecionados.map(m => {
                    const parts = m.descricao.split(" - ");
                    const nomeMes = parts[0].trim();
                    const ano = parseInt(parts[1], 10);
                    return {
                        nomeMes,
                        ano,
                        mensalidade: m.mensalidade,
                        mesesAtraso: m.mesesAtraso,
                        multa: m.multa,
                        juros: m.juros,
                        valorTotal: m.valorTotal
                    };
                })
            );

            const gruposPorAno = {};
            mensalidadesPlanas.forEach(item => {
                if (!gruposPorAno[item.ano]) gruposPorAno[item.ano] = [];
                gruposPorAno[item.ano].push(item);
            });

            const linhas = [];
            let valorFinal = 0;

            Object.keys(gruposPorAno).sort((a,b)=>a-b).forEach(anoKey => {
                const grupo = gruposPorAno[anoKey];

                grupo.sort((a,b) => meses.indexOf(a.nomeMes) - meses.indexOf(b.nomeMes));

                const mesesConcatenados = grupo.map(g => abrevMes[g.nomeMes] || g.nomeMes).join(", ");
                const descricao = `${mesesConcatenados} - ${anoKey}`;

                const mensalidadeBase = grupo[0].mensalidade;
                const mesesCount = grupo.length;
                const temAtraso = grupo.some(g => g.mesesAtraso > 0);
                const multaExibir = temAtraso ? multa : 0;
                const jurosExibir = temAtraso ? juros : 0;

                let somaAno = 0;
                grupo.forEach(g => {
                    let totalMes = g.mensalidade;
                    if (g.mesesAtraso > 0) {
                        totalMes += (g.mensalidade * multa / 100) + (g.mensalidade * (juros / 100) * g.mesesAtraso);
                    }
                    somaAno += totalMes;
                });

                somaAno = Math.round((somaAno + Number.EPSILON) * 100) / 100;
                valorFinal += somaAno;

                linhas.push({
                    descricao,
                    mensalidade: mensalidadeBase,
                    mesesAtraso: mesesCount,
                    multa: multaExibir,
                    juros: jurosExibir,
                    valorTotal: somaAno
                });
            });

            const dadosRelatorioAssociado = {
                matricula: registrosSelecionados[0].matricula,
                nome: registrosSelecionados[0].nome,
                tipo: registrosSelecionados[0].tipo,
                colaborador: registrosSelecionados[0].colaborador,
                linhas,
                quantidade: linhas.length,
                valorFinal: Math.round((valorFinal + Number.EPSILON) * 100) / 100
            };

            localStorage.setItem("dadosRelatorioAssociado", JSON.stringify(dadosRelatorioAssociado));
            window.open("relatorio_associado.html", "_blank");
        });
    }
});


