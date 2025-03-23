const React = require("react");
const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = require("recharts");

const BarLot2 = ({ agent, values, attribution, useEnvyOneFree = false }) => {

    // Valeur du lot de l'agent évaluateur (complète)
    const evaluatorValue = Object.keys(attribution[agent]).reduce(
        (sum, color) => sum + (attribution[agent][color] * values[agent][color]),
        0
    );

    // Calcul des valeurs des lots des autres agents
    const data = Object.keys(attribution).map((evalue) => {
        // Valeur complète du lot
        const totalValue = Object.keys(attribution[evalue]).reduce(
            (sum, color) => sum + (attribution[evalue][color] * values[agent][color]),
            0
        );

        // Valeur maximale d'un élément du lot (pour Envy-One-Free)
        const maxItemValue = Math.max(
            ...Object.keys(attribution[evalue]).map(
                (color) => attribution[evalue][color] * values[agent][color]
            )
        );

        // Valeur ajustée (sans l'élément préféré) si Envy-One-Free activé
        const adjustedValue = useEnvyOneFree && evalue !== agent
            ? totalValue - maxItemValue
            : totalValue;

        return {
            agent: evalue,
            value: adjustedValue // Toujours afficher la valeur ajustée si Envy-One-Free est activé
        };
    });

    // Identifier les agents enviés par l'agent évaluateur
    const envyAgents = data.filter(entry => entry.agent !== agent && entry.value > data.find(d => d.agent === agent).value).map(entry => entry.agent);

    return (
        <div style={{ textAlign: "center" }}>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <XAxis dataKey="agent" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                        {data.map((entry) => {
                            let color = "#8884d8"; // Couleur par défaut (bleu)

                            // Si l'agent évaluateur envie un autre agent
                            // if (envyAgents.includes(entry.agent)) {
                            //     color = "#4CAF50"; // Vert pour les agents enviés
                            // }

                            // // Si l'agent évaluateur est envieux de quelqu'un
                            // if (envyAgents.length > 0 && entry.agent === agent) {
                            //     color = "#FF5733"; // Rouge pour l'agent évaluateur envieux
                            // }

                            // L'agent évaluateur est soit en vert soit en rouge selon son lot
                            if (entry.agent === agent) {
                                color = envyAgents.length > 0 ? "#FF5733" : "#4CAF50"; // Vert ou Rouge
                            }

                            return <Cell key={entry.agent} fill={color} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Texte d'évaluation sous le graphique */}
            <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
                {envyAgents.length === 0
                    ? `The division is fair for ${agent}`
                    : `${agent} envy ${envyAgents.join(", ")}`}
            </p>
        </div>
    );
};

export default BarLot2;
