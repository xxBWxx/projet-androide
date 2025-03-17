import React from 'react';

class AgentList extends React.PureComponent {
  render() {
    const { values, attributions } = this.props;

    return (
      <div>
        <h2>Liste des Biens des Agents</h2>
        {Object.keys(values).map((agent) => (
          <div key={agent} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '100px' }}>
              <strong>{agent}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {Object.keys(attributions[agent]).map((color) => (
                <span key={color} style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                  {attributions[agent][color]}
                  {this.getColoredBall(color)}
                </span>
              ))}
            </div>
            <div style={{ margin: '0 15px', borderLeft: '2px solid black', height: '20px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {Object.keys(values[agent]).map((color) => (
                <span key={color} style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                  {this.getColoredBall(color)}={values[agent][color]}
                </span>
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
      <svg width="20" height="20" style={{ marginRight: '1px' }}>
        <circle cx="10" cy="10" r="8" fill={colorMap[color]} stroke="black" strokeWidth="1" />
      </svg>
    );
  }
}

export default AgentList;
