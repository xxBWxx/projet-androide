import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PickingSequence = ({ nbAgents, nbBalls, distribute, speed }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const width = 600;
    const height = 300;
    const delayBetweenBalls = 300; // delay in ms between each ball's animation

    // Create agent positions with labels
    const agentPositions = Array.from({ length: nbAgents }, (_, i) => ({
      x: (i + 1) * (width / (nbAgents + 1)),
      y: height - 50,
      label: `Agent ${i + 1}`
    }));

    // Create ball data with a unique id and random start positions.
    // Also assign a random target from the agent positions.
    const balls = Array.from({ length: nbBalls }, (_, i) => ({
      id: i + 1, // ball id for labeling
      x: Math.random() * width,
      y: 50,
      target: agentPositions[Math.floor(Math.random() * nbAgents)]
    }));

    // Draw agents as circles
    svg.selectAll(".agent")
      .data(agentPositions)
      .enter()
      .append("circle")
      .attr("class", "agent")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 15)
      .attr("fill", "blue");

    // Add labels for agents (below the agent circles)
    svg.selectAll(".agent-label")
      .data(agentPositions)
      .enter()
      .append("text")
      .attr("class", "agent-label")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#333")
      .text(d => d.label);

    // Draw balls as circles and animate them one by one
    const ballSelection = svg.selectAll(".ball")
      .data(balls)
      .enter()
      .append("circle")
      .attr("class", "ball")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 10)
      .attr("fill", "red");

    if (distribute) {
      ballSelection
        .transition()
        .delay((d, i) => i * delayBetweenBalls) // Animate sequentially
        .duration(speed)
        .attr("cx", d => d.target.x)
        .attr("cy", d => d.target.y)
        .ease(d3.easeBounce)
        .on("end", function (d, i) {
          // Append a label near the ball after it reaches the target.
          svg.append("text")
            .attr("class", "ball-label")
            .attr("x", d.target.x)
            .attr("y", d.target.y - 15) // position above the ball
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .text(`Ball ${d.id} → ${d.target.label}`);
        });
    }
  }, [nbAgents, nbBalls, distribute, speed]);

  return <svg ref={svgRef} width={600} height={300} style={{ background: "#ddd" }} />;
};

export default PickingSequence;
