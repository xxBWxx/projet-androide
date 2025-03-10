import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Lipton = ({ nbAgents, nbBalls, distribute, speed }) => {
  const svgRef = useRef();
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 600, height = 300;
    const agentSpacing = width / (nbAgents + 1);
    
    // Compute agent positions (could be different logic)
    const agentPositions = Array.from({ length: nbAgents }, (_, i) => ({
      x: (i + 1) * (width / (nbAgents + 1)),
      y: height - 50,
      label: `Agent ${i + 1}`
    }));
    
    // For Lipton, assume a different assignment algorithm
    // For simplicity, assign balls evenly based on index
    const balls = Array.from({ length: nbBalls }, (_, i) => ({
      id: i + 1,
      x: Math.random() * width,
      y: 50,
      target: agentPositions[i % nbAgents]
    }));
    
    svg.selectAll(".agent")
      .data(agentPositions)
      .enter()
      .append("circle")
      .attr("class", "agent")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 15)
      .attr("fill", "green");
    
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
    
    const ballSelection = svg.selectAll(".ball")
      .data(balls)
      .enter()
      .append("circle")
      .attr("class", "ball")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 10)
      .attr("fill", "orange");
    
    if (distribute) {
      ballSelection
        .transition()
        .delay((d, i) => i * 300)
        .duration(speed)
        .attr("cx", d => d.target.x)
        .attr("cy", d => d.target.y)
        .ease(d3.easeCubic)
        .on("end", function(d, i) {
          svg.append("text")
            .attr("class", "ball-label")
            .attr("x", d.target.x)
            .attr("y", d.target.y - 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .text(`Ball ${d.id} → ${d.target.label}`);
        });
    }
  }, [nbAgents, nbBalls, distribute, speed]);
  
  return <svg ref={svgRef} width={600} height={300} style={{ background: "#ddd" }} />;
};

export default Lipton;
