// utils/SdmxParser.tsx

export interface DimensionValue {
  id: string | number;
  name: string | number;
}

export interface ParsedDataPoint {
  countryCode: string | number;
  country: string | number;
  educationLevelCode: string | number;
  educationLevel: string | number;
  institutionTypeCode: string | number;
  institutionType: string | number;
  timePeriod: string | number;
  year: string | number;
  value: number | null;
  classSize: number | null;
}

export interface DataSummary {
  totalRecords: number;
  countries: (string | number)[];
  educationLevels: (string | number)[];
  institutionTypes: (string | number)[];
  timePeriods: (string | number)[];
  valueRange: {
    min: number;
    max: number;
  };
}

export interface ChartDataset {
  label: string | number;
  data: (number | null)[];
  backgroundColor: string;
}

export interface ChartData {
  labels: (string | number)[];
  datasets: ChartDataset[];
}

export const parseOECDClassSizeData = (
  sdmxResponse: any,
): ParsedDataPoint[] => {
  if (
    !sdmxResponse.data ||
    !sdmxResponse.data.dataSets ||
    !sdmxResponse.data.dataSets[0]
  ) {
    return [];
  }

  const { dataSets, structures } = sdmxResponse.data;
  const dataset = dataSets[0];
  const structure = structures[0];

  // Get dimension information
  const dimensions = structure.dimensions.observation;

  // Find all dimension indices first
  const dimensionIndices = {
    refArea: dimensions.findIndex((d: any) => d.id === "REF_AREA"),
    educationLevel: dimensions.findIndex((d: any) => d.id === "EDUCATION_LEV"),
    institutionType: dimensions.findIndex((d: any) => d.id === "INST_TYPE_EDU"),
    timePeriod: dimensions.findIndex((d: any) => d.id === "TIME_PERIOD"),
  };

  // Helper function to get dimension value by index
  function getDimensionValue(
    dimensionIndex: number,
    valueIndex: number,
  ): DimensionValue {
    if (
      dimensionIndex === -1 ||
      !dimensions[dimensionIndex] ||
      !dimensions[dimensionIndex].values
    ) {
      return { id: valueIndex, name: valueIndex };
    }

    const dimensionValues = dimensions[dimensionIndex].values;
    const value = dimensionValues[valueIndex];

    if (!value) {
      return { id: valueIndex, name: valueIndex };
    }

    return {
      id: value.id,
      name: value.name || value.id,
    };
  }

  const parsedData: ParsedDataPoint[] = [];

  // Parse each observation
  for (const [key, observation] of Object.entries<number[]>(
    dataset.observations,
  )) {
    const dimensionKeys = key.split(":").map((k) => parseInt(k, 10));

    // Get dimension values using the indices
    const country = getDimensionValue(
      dimensionIndices.refArea,
      dimensionKeys[dimensionIndices.refArea],
    );
    const educationLevel = getDimensionValue(
      dimensionIndices.educationLevel,
      dimensionKeys[dimensionIndices.educationLevel],
    );
    const institutionType = getDimensionValue(
      dimensionIndices.institutionType,
      dimensionKeys[dimensionIndices.institutionType],
    );
    const timePeriod = getDimensionValue(
      dimensionIndices.timePeriod,
      dimensionKeys[dimensionIndices.timePeriod],
    );

    // Create data point
    const dataPoint: ParsedDataPoint = {
      countryCode: country.id,
      country: country.name,
      educationLevelCode: educationLevel.id,
      educationLevel: educationLevel.name,
      institutionTypeCode: institutionType.id,
      institutionType: institutionType.name,
      timePeriod: timePeriod.name,
      year: timePeriod.id,
      value: observation[0],
      classSize: observation[0],
    };

    // Only include data points with actual values
    if (dataPoint.value !== null && dataPoint.value !== undefined) {
      parsedData.push(dataPoint);
    }
  }

  // Sort by value descending (high to low)
  parsedData.sort((a, b) => {
    const va = a.value ?? -Infinity;
    const vb = b.value ?? -Infinity;
    return vb - va;
  });

  return parsedData;
};

export const prepareBarChartData = (
  parsedData: ParsedDataPoint[],
  educationLevel: string = "Primary education",
): ChartData => {
  // Filter by education level if specified
  const filteredData = educationLevel
    ? parsedData.filter((item) => item.educationLevel === educationLevel)
    : parsedData;

  // Group by country and institution type
  const countryData: Record<
    string | number,
    Record<string | number, number>
  > = {};

  filteredData.forEach((item) => {
    if (!countryData[item.country]) {
      countryData[item.country] = {};
    }
    countryData[item.country][item.institutionType] = item.value ?? 0;
  });

  // Get unique institution types
  const institutionTypes = [
    ...new Set(filteredData.map((item) => item.institutionType)),
  ];

  // Prepare datasets for Chart.js
  const datasets: ChartDataset[] = institutionTypes.map((type, index) => {
    const getColor = (idx: number): string => {
      const colors = [
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 99, 132, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(255, 159, 64, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(201, 203, 207, 0.8)",
        "rgba(255, 205, 86, 0.8)",
      ];
      return colors[idx % colors.length];
    };

    return {
      label: type,
      data: Object.keys(countryData).map(
        (country) => countryData[country][type] || 0,
      ),
      backgroundColor: getColor(index),
    };
  });

  return {
    labels: Object.keys(countryData),
    datasets: datasets,
  };
};

export const groupDataForChart = (
  parsedData: ParsedDataPoint[],
  groupBy: keyof ParsedDataPoint = "country",
): Record<string, ParsedDataPoint[]> => {
  const groupedData: Record<string, ParsedDataPoint[]> = {};

  parsedData.forEach((item) => {
    const key = item[groupBy];
    if (key !== null && key !== undefined) {
      const groupKey = String(key);
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      groupedData[groupKey].push(item);
    }
  });

  return groupedData;
};

// Helper function to get unique values for filtering
export const getUniqueValues = (
  parsedData: ParsedDataPoint[],
  field: keyof ParsedDataPoint,
): (string | number)[] => {
  return [...new Set(parsedData.map((item) => item[field]))]
    .filter((item): item is string | number => item != null)
    .sort();
};

// Helper function to get summary statistics
export const getDataSummary = (parsedData: ParsedDataPoint[]): DataSummary => {
  const values = parsedData
    .map((item) => item.value)
    .filter((v) => v !== null) as number[];

  const summary: DataSummary = {
    totalRecords: parsedData.length,
    countries: getUniqueValues(parsedData, "country"),
    educationLevels: getUniqueValues(parsedData, "educationLevel"),
    institutionTypes: getUniqueValues(parsedData, "institutionType"),
    timePeriods: getUniqueValues(parsedData, "timePeriod"),
    valueRange: {
      min: Math.min(...values),
      max: Math.max(...values),
    },
  };

  return summary;
};
