import React from 'react';
import * as d3 from 'd3';

const PickingSequence = ({ nbAgents, Red, Blue, Green, Yellow, Purple }) => {
  const ballTypes = [
    { type: 'Type 1', count: Red, color: 'red' },
    { type: 'Type 2', count: Blue, color: 'blue' },
    { type: 'Type 3', count: Green, color: 'green' },
    { type: 'Type 4', count: Yellow, color: 'yellow' },
    { type: 'Type 5', count: Purple, color: 'purple' },
  ];

  const svgRef = React.useRef();

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const width = 600;
    const height = 400;
    const agentHeight = height - 50; // Position Y for agents at the bottom
    const ballSpacing = width / (ballTypes.length + 1);
    const agentSpacing = width / (nbAgents + 1);

    // Create visual representation for each ball type
    svg.attr("width", width).attr("height", height);

    const ballGroup = svg.append("g");

    ballGroup.selectAll(".ball")
      .data(ballTypes)
      .enter()
      .append("g")
      .attr("class", "ball")
      .attr("transform", (d, i) => `translate(${ballSpacing * (i + 1)},50)`)
      .each(function(d) {
        const group = d3.select(this);
        group.append("circle")
          .attr("r", 20)
          .attr("fill", d.color);

        group.append("text")
          .attr("x", 0)
          .attr("y", 40) // Position the text below the ball
          .attr("text-anchor", "middle")
          .text(d.count);
      });

    // Create agent positions
    const agentGroup = svg.append("g");
    const agentPositions = Array.from({ length: nbAgents }, (_, i) => ({
      x: agentSpacing * (i + 1),
      y: agentHeight
    }));

    agentGroup.selectAll(".agent")
      .data(agentPositions)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .each(function(d, i) {
        const group = d3.select(this);
        group.append("circle")
          .attr("r", 15)
          .attr("fill", "gray");

        group.append("text")
          .attr("x", 0)
          .attr("y", -20)
          .attr("text-anchor", "middle")
          .text(`Agent ${i + 1}`);
      });

  }, [ballTypes, nbAgents, Red, Blue, Green, Yellow, Purple]);

  return <svg ref={svgRef}></svg>;
};

export default PickingSequence;
