import { useEffect, useRef, useState, useMemo } from "react";
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
  referenceLineValue?: number; // optional horizontal reference line
  referenceLineLabel?: string; // optional label for the reference line
}

const GroupedBarChart = ({
  data,
  height = 500,
  minWidth = 900,
  referenceLineValue,
  referenceLineLabel,
}: GroupedBarChartProps): JSX.Element => {
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

  // ✅ Memoize levels, institutionTypes, countries, groupedData
  const levels = useMemo(
    () => ["Primary education", "Lower secondary education"],
    [],
  );

  const institutionTypes = useMemo(
    () => Array.from(new Set(data.map((d) => d.institutionType))),
    [data],
  );

  const countries = useMemo(
    () => Array.from(new Set(data.map((d) => d.country))),
    [data],
  );

  const groupedData = useMemo(() => {
    const result: {
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
              d.educationLevel === level,
          );
          result.push({
            country,
            institutionType,
            level,
            value: found ? found.value : undefined,
          });
        });
      });
    });
    return result;
  }, [countries, institutionTypes, levels, data]);

  // Tooltip positioning helper
  const positionTooltip = (event: MouseEvent, tooltip: HTMLDivElement) => {
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 10;

    let left = event.pageX + padding;
    let top = event.pageY - tooltipRect.height / 2;

    if (left + tooltipRect.width > window.innerWidth) {
      left = event.pageX - tooltipRect.width - padding;
    }
    if (top < 0) top = padding;
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

    const margin = { top: 40, right: 150, bottom: 40, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", translate(margin.left, margin.top));

    const flatData = groupedData
      .filter((d) => d.value !== undefined)
      .map((d) => ({
        ...d,
        displayLabel: `${d.country} — ${d.institutionType} — ${d.level}`,
      }))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const x = d3
      .scaleBand<string>()
      .domain(flatData.map((d) => d.displayLabel))
      .rangeRound([0, chartWidth])
      .padding(0.15);

    const maxDataValue = d3.max(groupedData, (d) => d.value || 0) || 0;
    const yMax =
      referenceLineValue !== undefined
        ? Math.max(maxDataValue, referenceLineValue)
        : maxDataValue;

    const y = d3.scaleLinear().domain([0, yMax]).nice().range([chartHeight, 0]);

    g.append("g")
      .attr("transform", translate(0, chartHeight))
      .call(
        d3
          .axisBottom(x)
          .tickFormat(() => "")
          .tickSize(0),
      );

    g.append("g").call(d3.axisLeft(y));

    if (referenceLineValue !== undefined) {
      const yRef = y(referenceLineValue);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", yRef)
        .attr("y2", yRef)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4");

      g.append("text")
        .attr("x", chartWidth)
        .attr("y", yRef - 6)
        .attr("text-anchor", "end")
        .attr("fill", "#ef4444")
        .attr("font-size", 12)
        .text(referenceLineLabel ?? `Class per student: ${referenceLineValue}`);
    }

    g.selectAll<SVGRectElement, any>("rect.bar")
      .data(flatData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.displayLabel) || 0)
      .attr("y", (d) => y(d.value || 0))
      .attr("width", x.bandwidth())
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

        const formattedValue =
          d.value !== undefined ? d.value.toFixed(2) : "N/A";
        tooltip.innerHTML = `
          <div><strong>${d.country}</strong></div>
          <div>${d.institutionType} - ${d.level}</div>
          <div>Value: ${formattedValue}</div>
        `;
        tooltip.style.opacity = "1";
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
  }, [groupedData, width, height, referenceLineValue, referenceLineLabel]);

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    padding: "8px 12px",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
    borderRadius: "4px",
    pointerEvents: "none",
    fontSize: "14px",
    opacity: 0,
    transition: "opacity 0.2s",
    zIndex: 1000,
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  };

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        overflowX: "auto",
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
