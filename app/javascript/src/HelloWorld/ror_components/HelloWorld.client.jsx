import React, { useState, useEffect } from "react";
const SchoolDashboardMock = () => {
    const [selectedGate, setSelectedGate] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [selectedTime, setSelectedTime] = useState("all");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [gates, setGates] = useState([]);

    console.log('Teste Junim')
    useEffect(() => {
        console.log('Teste Junin')
        fetch('http://localhost:3000/api/gates',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                console.log("🔍 Portarias retornadas do backend:", response);
                setGates(response);
            })
            .catch((err) => console.error("Erro ao carregar portarias:", err));
    });

    const classes = ["Turma A", "Turma B", "Turma C"];
    const times = ["07:00-11:00", "13:00-17:00"];

    return (
        <div style={{ minHeight: "100vh", padding: "20px", backgroundColor: "#f7f7f7" }}>
            <header style={{ marginBottom: "20px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Portaria: Entrada e Saída</h1>
            </header>

            {/* Filtros */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <select value={selectedGate} onChange={(e) => setSelectedGate(e.target.value)}>
                    <option value="all">Todas as Portarias</option>
                    {gates.map((gate) => (
                        <option key={gate.id} value={gate.name}>
                            {gate.name}
                        </option>
                    ))}
                </select>

                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                    <option value="all">Todas as Turmas</option>
                    {classes.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>

                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                    <option value="all">Todos os Horários</option>
                    {times.map((time) => (
                        <option key={time} value={time}>{time}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {/* Cards */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ flex: 1, padding: "20px", background: "#fff", borderRadius: "8px" }}>
                    <p>Chegou</p>
                    <h2>0</h2>
                </div>
                <div style={{ flex: 1, padding: "20px", background: "#fff", borderRadius: "8px" }}>
                    <p>Liberados</p>
                    <h2>0</h2>
                </div>
            </div>

            {/* Lista */}
            <div style={{ padding: "20px", background: "#fff", borderRadius: "8px", textAlign: "center", color: "#666" }}>
                <p>Nenhum aluno aguardando retirada</p>
                <p>Todas as solicitações foram processadas</p>
            </div>
        </div>
    );
};

export default SchoolDashboardMock;