import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const translate = (x: number, y: number): string => `translate(${x},${y})`;

interface DataItem {
  country: string;
  institutionType: string;
  educationLevel: string;
  value: number;
}

interface GroupedBarChartProps {
  data: DataItem[];
  height?: number;
  minWidth?: number; // min width before scroll
}

const GroupedBarChart = ({
  data,
  height = 500,
  minWidth = 900,
}: GroupedBarChartProps): JSX.Element => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = useState<number>(minWidth);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const width = Math.max(containerWidth, minWidth);

  const levels = ["Primary education", "Lower secondary education"];
  const institutionTypes = Array.from(new Set(data.map((d) => d.institutionType)));
  const countries = Array.from(new Set(data.map((d) => d.country)));

  const groupedData: {
    country: string;
    institutionType: string;
    level: string;
    value: number | undefined;
  }[] = [];

  countries.forEach((country) => {
    institutionTypes.forEach((institutionType) => {
      levels.forEach((level) => {
        const found = data.find(
          (d) =>
            d.country === country &&
            d.institutionType === institutionType &&
            d.educationLevel === level
        );
        groupedData.push({
          country,
          institutionType,
          level,
          value: found ? found.value : undefined,
        });
      });
    });
  });

  // Tooltip positioning helper
  const positionTooltip = (event: MouseEvent, tooltip: HTMLDivElement) => {
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 10;

    let left = event.pageX + padding;
    let top = event.pageY - tooltipRect.height / 2;

    // If tooltip goes beyond right edge → flip to left
    if (left + tooltipRect.width > window.innerWidth) {
      left = event.pageX - tooltipRect.width - padding;
    }

    // Prevent overflow at top
    if (top < 0) {
      top = padding;
    }

    // Prevent overflow at bottom
    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 100, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", translate(margin.left, margin.top));

    const x0 = d3
      .scaleBand<string>()
      .domain(countries)
      .rangeRound([0, chartWidth])
      .paddingInner(0.1);

    const x1 = d3
      .scaleBand<string>()
      .domain(institutionTypes)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.08);

    const x2 = d3
      .scaleBand<string>()
      .domain(levels)
      .rangeRound([0, x1.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(groupedData, (d) => d.value || 0) || 0])
      .nice()
      .range([chartHeight, 0]);

    g.append("g")
      .attr("transform", translate(0, chartHeight))
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .attr("text-anchor", "end");

    g.append("g").call(d3.axisLeft(y));

    const countryGroups = g
      .selectAll<SVGGElement, string>("g.country-group")
      .data(countries)
      .enter()
      .append("g")
      .attr("class", "country-group")
      .attr("transform", (d) => translate(x0(d) || 0, 0));

    countryGroups
      .selectAll<SVGGElement, { country: string; institutionType: string }>(
        "g.institution-group"
      )
      .data((country) =>
        institutionTypes.map((inst) => ({ country, institutionType: inst }))
      )
      .enter()
      .append("g")
      .attr("class", "institution-group")
      .attr("transform", (d) => translate(x1(d.institutionType) || 0, 0))
      .selectAll<SVGRectElement, any>("rect")
      .data((d) =>
        levels.map((level) => {
          const found = groupedData.find(
            (gd) =>
              gd.country === d.country &&
              gd.institutionType === d.institutionType &&
              gd.level === level
          );
          return { ...d, level, value: found ? found.value : undefined };
        })
      )
      .enter()
      .append("rect")
      .attr("x", (d) => x2(d.level) || 0)
      .attr("y", (d) => y(d.value || 0))
      .attr("width", x2.bandwidth())
      .attr("height", (d) => chartHeight - y(d.value || 0))
      .attr("fill", "#1976d2")
      .attr("opacity", 0.9)
      .on("mouseover", function (event: MouseEvent, d: any) {
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("stroke", "#222")
          .attr("stroke-width", 1.5);

        if (!tooltipRef.current) return;
        const tooltip = tooltipRef.current;

        const formattedValue = d.value !== undefined ? d.value.toFixed(2) : "N/A";
        tooltip.innerHTML = `
          <div><strong>${d.country}</strong></div>
          <div>${d.institutionType} - ${d.level}</div>
          <div>Value: ${formattedValue}</div>
        `;
        tooltip.style.opacity = "1";

        // Position safely
        positionTooltip(event, tooltip);
      })
      .on("mousemove", function (event: MouseEvent) {
        if (!tooltipRef.current) return;
        const tooltip = tooltipRef.current;
        positionTooltip(event, tooltip);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.9).attr("stroke", "none");
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
        }
      });
  }, [groupedData, width, height, countries, institutionTypes, levels]);

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    padding: "8px 12px",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    pointerEvents: "none",
    fontSize: "14px",
    opacity: 0,
    transition: "opacity 0.2s",
    zIndex: 1000,
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        overflowX: "auto", // horizontal scroll if chart > container
        position: "relative",
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "block",
        }}
      />
      <div ref={tooltipRef} style={tooltipStyle}></div>
    </div>
  );
};

export default GroupedBarChart;
