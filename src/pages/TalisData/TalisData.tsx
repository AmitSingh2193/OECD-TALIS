import { fetchOecdData } from "@/state/slices/talisDataSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { parseOECDClassSizeData } from "@/lib/SimplifyOECDData";
import GroupedBarChart from "@/components/charts/D3BarChart";
import type { Question } from "@/state/slices/limeSurveySlice";
import {
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControl,
  OutlinedInput,
  Chip,
  Button,
  Box,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface DataItem {
  country: string;
  institutionType: string;
  educationLevel: string;
  value: number;
}

const TalisData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, errorStatus, errorResponse } = useSelector(
    (state: RootState) => state.talisData,
  );
  const { surveyQuestions, isLoadingQuestions } = useSelector(
    (state: RootState) => state.limeSurvey,
  );

  const [educationLevels, setEducationLevels] = useState<string[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  // Dropdown options
  const educationLevelOptions = [
    { label: "Primary education", value: "ISCED11_1" },
    { label: "Lower secondary education", value: "ISCED11_2" },
  ];
  const institutionTypeOptions = [
    { label: "All Educational Institution", value: "INST_EDU" },
    { label: "Public Educational Institution", value: "INST_EDU_PUB" },
    { label: "Private Educational Institution", value: "INST_EDU_PRIV" },
  ];

  // Build API URL dynamically inside effect to satisfy exhaustive-deps

  const getChartData = (): DataItem[] => {
    if (!data) return [];
    const parsedData = parseOECDClassSizeData(data);
    return parsedData.map((item) => ({
      country: String(item.country),
      institutionType: String(item.institutionType),
      educationLevel: String(item.educationLevel),
      value: item.value || 0,
    }));
  };

  useEffect(() => {
    const url = (() => {
      if (educationLevels.length === 0 && institutionTypes.length === 0) {
        return "https://sdmx.oecd.org/public/rest/data/OECD.EDU.IMEP,DSD_EAG_UOE_NON_FIN_PERS@DF_UOE_NF_PERS_CLS,1.0/.......A......_T.?startPeriod=2023&endPeriod=2023&dimensionAtObservation=AllDimensions&format=jsondata";
      }
      const eduFilter = educationLevels.join("+");
      const instFilter = institutionTypes.join("+");
      return `https://sdmx.oecd.org/public/rest/data/OECD.EDU.IMEP,DSD_EAG_UOE_NON_FIN_PERS@DF_UOE_NF_PERS_CLS,1.0/.${eduFilter}......A...${instFilter}..._T.?startPeriod=2023&endPeriod=2023&dimensionAtObservation=AllDimensions&format=jsondata`;
    })();
    const loadData = async () => {
      try {
        await dispatch(fetchOecdData(url));
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    loadData(); // keep disabled for testing
  }, [educationLevels, institutionTypes, dispatch]);

  const chartData = getChartData();

  const handleClearAll = () => {
    setEducationLevels([]);
    setInstitutionTypes([]);
  };

  const handleRemove = (type: "edu" | "inst", value: string) => {
    if (type === "edu") {
      setEducationLevels((prev) => prev.filter((v) => v !== value));
    } else {
      setInstitutionTypes((prev) => prev.filter((v) => v !== value));
    }
  };

  const handleRemoveGroup = (type: "edu" | "inst") => {
    if (type === "edu") setEducationLevels([]);
    if (type === "inst") setInstitutionTypes([]);
  };

  // ✅ Custom render with count badge
  const renderSelectLabel = (label: string, count: number) => (
    <Box display="flex" alignItems="center" gap={1}>
      <span>{label}</span>
      {count > 0 && (
        <Box
          component="span"
          sx={{
            bgcolor: "#fff",
            color: "#2563eb",
            fontSize: "12px",
            px: 1,
            borderRadius: "6px",
            border: "1px solid #2563eb",
            fontWeight: 600,
          }}
        >
          {count}
        </Box>
      )}
    </Box>
  );

  return (
    <div className="p-4 ps-10 text-left pt-7">
      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-4 mb-7">
        <FormControl sx={{ minWidth: 193 }}>
          <Select
            multiple
            displayEmpty
            value={educationLevels}
            sx={{
              backgroundColor: "#E8EDF2",
              borderRadius: "6px",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              fontSize: "14px",
              fontWeight: 500,
              "& .MuiSelect-select": {
                fontSize: "14px",
                fontWeight: 500,
                paddingTop: "12px",
                paddingBottom: "12px",
              },
              "& .MuiOutlinedInput-input": {
                paddingTop: "12px",
                paddingBottom: "12px",
              },
            }}
            onChange={(e) => setEducationLevels(e.target.value as string[])}
            input={<OutlinedInput />}
            renderValue={() =>
              renderSelectLabel("Education Level", educationLevels.length)
            }
            MenuProps={MenuProps}
          >
            {educationLevelOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <Checkbox
                  checked={educationLevels.indexOf(option.value) > -1}
                />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 250 }}>
          <Select
            multiple
            displayEmpty
            value={institutionTypes}
            sx={{
              backgroundColor: "#E8EDF2",
              borderRadius: "6px",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              fontSize: "14px",
              fontWeight: 500,
              "& .MuiSelect-select": {
                fontSize: "14px",
                fontWeight: 500,
                paddingTop: "12px",
                paddingBottom: "12px",
              },
              "& .MuiOutlinedInput-input": {
                paddingTop: "12px",
                paddingBottom: "12px",
              },
            }}
            onChange={(e) => setInstitutionTypes(e.target.value as string[])}
            input={<OutlinedInput />}
            renderValue={() =>
              renderSelectLabel("Institution Type", institutionTypes.length)
            }
            MenuProps={MenuProps}
          >
            {institutionTypeOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <Checkbox
                  checked={institutionTypes.indexOf(option.value) > -1}
                />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Grouped Chips Section */}
      <div className="flex flex-wrap gap-3 mb-0 ">
        {/* Grouped Chips Section */}
        {(educationLevels.length > 0 || institutionTypes.length > 0) && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            sx={{
              width: "100%", // ✅ take full available width
              bgcolor: "#fff",
              borderRadius: "12px",
              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
              p: 1.5,
              px: 2,
              mb: 6,
              gap: 2,
            }}
          >
            {/* Left side chips */}
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1}
              alignItems="center"
              flex={1} // ✅ allow it to take max available space
            >
              {educationLevels.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                  <Chip
                    label="Education Level"
                    onDelete={() => handleRemoveGroup("edu")}
                    deleteIcon={
                      <span style={{ fontSize: "18px", color: "#000" }}>×</span>
                    }
                    sx={{
                      bgcolor: "#fff",
                      border: "1px solid #E1E1E2",
                      borderRadius: "4px",
                      "& .MuiChip-deleteIcon": { m: 0 },
                      px: "6px",
                      "& .MuiChip-label": { fontSize: "14px", fontWeight: 400 },
                    }}
                  />
                  {educationLevels.map((val) => {
                    const option = educationLevelOptions.find(
                      (o) => o.value === val,
                    );
                    return (
                      <Chip
                        key={val}
                        label={option ? option.label : val}
                        onDelete={() => handleRemove("edu", val)}
                        deleteIcon={
                          <span style={{ fontSize: "18px", color: "#000" }}>
                            ×
                          </span>
                        }
                        sx={{
                          bgcolor: "#E0F2FF",
                          borderRadius: "4px",
                          "& .MuiChip-deleteIcon": { m: 0 },
                          px: "6px",
                          "& .MuiChip-label": {
                            fontSize: "14px",
                            fontWeight: 400,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              )}

              {institutionTypes.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                  <Chip
                    label="Institution Type"
                    onDelete={() => handleRemoveGroup("inst")}
                    deleteIcon={
                      <span style={{ fontSize: "18px", color: "#000" }}>×</span>
                    }
                    sx={{
                      bgcolor: "#fff",
                      border: "1px solid #E1E1E2",
                      borderRadius: "4px",
                      "& .MuiChip-deleteIcon": { m: 0 },
                      px: "6px",
                      "& .MuiChip-label": { fontSize: "14px", fontWeight: 400 },
                    }}
                  />
                  {institutionTypes.map((val) => {
                    const option = institutionTypeOptions.find(
                      (o) => o.value === val,
                    );
                    return (
                      <Chip
                        key={val}
                        label={option ? option.label : val}
                        onDelete={() => handleRemove("inst", val)}
                        deleteIcon={
                          <span style={{ fontSize: "18px", color: "#000" }}>
                            ×
                          </span>
                        }
                        sx={{
                          bgcolor: "#E0F2FF",
                          borderRadius: "4px",
                          "& .MuiChip-deleteIcon": { m: 0 },
                          px: "6px",
                          "& .MuiChip-label": {
                            fontSize: "14px",
                            fontWeight: 400,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Right side Clear All */}
            <Box flexShrink={0}>
              <Button
                onClick={handleClearAll}
                color="primary"
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        )}
      </div>

      {/* Chart Section */}
      <div className="text-center mx-auto px-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={60} />
          </div>
        ) : errorStatus === 404 &&
          errorResponse &&
          typeof errorResponse === "string" &&
          errorResponse.includes("NoResultsFound") ? (
          <div className="p-4 text-center text-gray-600 text-lg">
            No Data Found
          </div>
        ) : error ? (
          <div className="p-4 text-red-600">Error: {error}</div>
        ) : chartData.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-lg">
            No Data Found
          </div>
        ) : (
          <div
            style={{
              boxShadow: "0px 4.62px 18.47px 0px #0000000D",
              borderRadius: 18,
              backgroundColor: "#FFF",
            }}
          >
            <div>
              <div className="flex ps-14 items-center gap-4">
                <h3 className="text-xl font-bold py-8">
                  Compare Your Responses with TALIS Data
                </h3>
                <FormControl sx={{ minWidth: 260 }}>
                  <Select
                    displayEmpty
                    value={selectedQuestion}
                    onChange={(e) =>
                      setSelectedQuestion(e.target.value as string)
                    }
                    input={<OutlinedInput />}
                    sx={{
                      backgroundColor: "#E0F2FF",
                      borderRadius: "6px",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      fontSize: "14px",
                      fontWeight: 500,
                      "& .MuiSelect-select": {
                        fontSize: "14px",
                        fontWeight: 500,
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        paddingLeft: "12px",
                        paddingRight: "36px",
                      },
                    }}
                    renderValue={(value) => {
                      if (!value) {
                        return (
                          <span style={{ color: "#667085" }}>
                            Select Question
                          </span>
                        );
                      }
                      const q = surveyQuestions.find(
                        (q: Question) => String(q.id) === String(value),
                      );
                      return q
                        ? q.question || q.title || String(value)
                        : String(value);
                    }}
                    MenuProps={MenuProps}
                  >
                    {isLoadingQuestions && (
                      <MenuItem value="" disabled>
                        Loading questions...
                      </MenuItem>
                    )}
                    {!isLoadingQuestions &&
                      surveyQuestions &&
                      surveyQuestions.length === 0 && (
                        <MenuItem value="" disabled>
                          No questions available
                        </MenuItem>
                      )}
                    {(surveyQuestions || []).map((q: Question) => (
                      <MenuItem
                        key={q.id}
                        value={String(q.id)}
                        sx={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        {q.question || q.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>

            <GroupedBarChart
              data={chartData}
              referenceLineValue={23}
              referenceLineLabel="class per student: 23"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TalisData;
