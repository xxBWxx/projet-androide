import React from 'react';

class AgentList extends React.PureComponent {
  render() {
    const { values, attributions } = this.props;

    return (
      <div>
        <h2>Liste des Biens des Agents</h2>
        {Object.keys(values).map((agent) => (
          <div key={agent} style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold' }}>{agent}</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {Object.keys(attributions[agent]).map((color) => (
                <div key={color} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                  <span style={{ marginRight: '5px', fontSize: '14px', minWidth: '20px', textAlign: 'right' }}>
                    {attributions[agent][color]}
                  </span>
                  {this.getColoredBall(color)}
                </div>
              ))}
              <div style={{ margin: '0 15px', borderLeft: '2px solid black', height: '20px' }}></div>
              {Object.keys(values[agent]).map((color) => (
                <div key={color} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                  {this.getColoredBall(color)}
                  <span style={{ margin: '0 5px', fontSize: '14px' }}>=</span> {/* Augmenter la marge ici */}
                  <span style={{ fontSize: '14px' }}>{values[agent][color]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  getColoredBall(color) {
    const colorMap = {
      red: "red",
      blue: "blue",
      green: "green",
      yellow: "yellow",
      purple: "purple"
    };

    return (
      <svg width="20" height="20" style={{ marginRight: '5px' }}>
        <circle cx="10" cy="10" r="8" fill={colorMap[color]} stroke="black" strokeWidth="1" />
      </svg>
    );
  }
}

export default AgentList;
