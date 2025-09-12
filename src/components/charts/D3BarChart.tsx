import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  age: number;
  salary: number;
}

interface D3BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  referenceAge?: number; // Age at which to draw the reference line
}

export const D3BarChart = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  referenceAge,
}: D3BarChartProps) => {
  // Adjust left margin to provide more space for Y-axis labels
  const adjustedMargin = {
    ...margin,
    left: 90, // Increased from default 60 to provide more space for Y-axis labels
  };

  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; show: boolean; data: DataPoint | null }>({ 
    x: 0, 
    y: 0, 
    show: false, 
    data: null 
  });

  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up the SVG dimensions with adjusted margins
    const innerWidth = width - adjustedMargin.left - adjustedMargin.right;
    const innerHeight = height - adjustedMargin.top - adjustedMargin.bottom;

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${adjustedMargin.left},${adjustedMargin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.age.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.salary) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 30)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Age');

    // Add Y axis
    const yAxis = svg
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => `$${d}`));

    // Add Y axis label with better positioning
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - adjustedMargin.left + 20) // Position to the left of the axis
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'currentColor')
      .style('font-size', '12px')
      .text('Salary ($)');

    // Add tooltip container
    const tooltipDiv = d3.select(svgRef.current?.parentNode as HTMLElement)
      .append('div')
      .attr('class', 'absolute bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-xs pointer-events-none opacity-0 transition-opacity duration-200 border border-gray-200 dark:border-gray-700')
      .style('z-index', '10');

    // Add bars with hover effects
    const bars = svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.age.toString()) || 0)
      .attr('y', (d) => yScale(d.salary))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.salary))
      .attr('fill', 'hsl(221.2 83.2% 53.3%)')
      .attr('rx', 2)
      .attr('ry', 2)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.2s')
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 0.8);
        
        // Get position for tooltip
        const [x, y] = d3.pointer(event, svgRef.current);
        const tooltipX = x + adjustedMargin.left;
        const tooltipY = y + adjustedMargin.top - 50; // Position above the cursor
        
        // Update tooltip content and position
        tooltipDiv
          .html(`
            <div class="font-semibold">Age: ${d.age}</div>
            <div>Salary: $${d.salary.toLocaleString()}</div>
          `)
          .style('left', `${tooltipX}px`)
          .style('top', `${tooltipY}px`)
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('mousemove', function(event) {
        const [x, y] = d3.pointer(event, svgRef.current);
        const tooltipX = x + margin.left;
        const tooltipY = y + margin.top - 50;
        
        tooltipDiv
          .style('left', `${tooltipX}px`)
          .style('top', `${tooltipY}px`);
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 1);
        tooltipDiv.transition()
          .duration(200)
          .style('opacity', 0);
      });

    // Add reference line if referenceAge is provided
    if (referenceAge !== undefined) {
      // Sort the data by age for interpolation
      const sortedData = [...data].sort((a, b) => a.age - b.age);
      
      // Find the two closest data points for interpolation
      let lower = sortedData[0];
      let upper = sortedData[sortedData.length - 1];
      
      for (let i = 0; i < sortedData.length - 1; i++) {
        if (sortedData[i].age <= referenceAge && sortedData[i + 1].age >= referenceAge) {
          lower = sortedData[i];
          upper = sortedData[i + 1];
          break;
        }
      }
      
      // Calculate the exact x position based on age value, not just data points
      const ageRange = upper.age - lower.age;
      const progress = ageRange > 0 ? (referenceAge - lower.age) / ageRange : 0.5;
      
      // Get the x positions of the bounding ages
      const xLower = (xScale(lower.age.toString()) || 0) + xScale.bandwidth() / 2;
      const xUpper = (xScale(upper.age.toString()) || 0) + xScale.bandwidth() / 2;
      
      // Calculate the exact x position for the reference age
      const xPos = xLower + (xUpper - xLower) * progress;
      
      // Add the reference line
      svg.append('line')
        .attr('class', 'reference-line')
        .attr('x1', xPos)
        .attr('y1', 0)
        .attr('x2', xPos)
        .attr('y2', innerHeight)
        .attr('stroke', '#e53e3e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .style('pointer-events', 'none');

      // Add reference line label
      svg.append('text')
        .attr('class', 'reference-label')
        .attr('x', xPos + 5)
        .attr('y', 15)
        .attr('fill', '#e53e3e')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text(`Age ${referenceAge}`);
    }

    // Add value labels on top of bars
    svg
      .selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => (xScale(d.age.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.salary) - 5)
      .attr('text-anchor', 'middle')
      .text((d) => `$${d.salary.toLocaleString()}`)
      .attr('fill', 'currentColor')
      .style('font-size', '10px');

    // Cleanup function to remove tooltip on unmount
    return () => {
      tooltipDiv.remove();
    };
  }, [data, height, margin.bottom, margin.left, margin.right, margin.top, width]);

  return (
    <div className="mb-8 relative">
      <h3 className="text-lg font-medium mb-4 text-center">D3.js Bar Chart</h3>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm relative">
        <svg ref={svgRef} className="w-full" viewBox={`0 0 ${width} ${height}`} />
      </div>
    </div>
  );
};

export default D3BarChart;
