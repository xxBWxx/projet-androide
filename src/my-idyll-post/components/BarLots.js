const React = require("react");
const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = require("recharts");

const BarLots = ({ agent, values, attribution }) => {

    // Calcul de la valeur totale de chaque lot
    const data = Object.keys(attribution).map((recipient) => {
        const totalValue = Object.keys(attribution[recipient]).reduce((sum, color) => {
            return sum + (attribution[recipient][color] * values[agent][color]);
        }, 0);

        return { agent: recipient, value: totalValue };
    });

    // Récupérer la valeur du lot de l'agent évaluateur
    const evaluatorValue = data.find(entry => entry.agent === agent)?.value || 0;

    // Trouver les agents ayant un lot strictement supérieur
    const betterLots = data.filter(entry => entry.value > evaluatorValue).map(entry => entry.agent);
    
    // Vérifier s'il existe un agent avec un lot strictement supérieur à celui de l'agent évaluateur
    const hasBetterLot = betterLots.length > 0;

    return (
        <div style={{ textAlign: "center" }}>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <XAxis dataKey="agent" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                        {data.map((entry) => {
                            let color = "#8884d8"; // Bleu par défaut
                            if (entry.value >= evaluatorValue) {
                                color = "#4CAF50"; // Vert si le lot est supérieur ou égal à celui de l'agent évaluateur
                            }
                            if (hasBetterLot && entry.agent === agent) {
                                color = "#FF5733"; // Rouge si l'agent évaluateur n'a pas le meilleur lot
                            }

                            return <Cell key={entry.agent} fill={color} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Texte sous l'histogramme */}
            <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
                {hasBetterLot
                    ? `${agent} envy ${betterLots.join(", ")}`
                    : `The division is fair for ${agent}`}
            </p>
        </div>
    );
};

export default BarLots;