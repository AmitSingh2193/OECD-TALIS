import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the structure based on the actual API response
export interface OECDRawData {
  meta: {
    schema: string;
    id: string;
    prepared: string;
    test: boolean;
    contentLanguages: string[];
    sender: {
      id: string;
      name: string;
      names: {
        [key: string]: string;
      };
    };
  };
  data: {
    dataSets: Array<{
      structure: string;
      action: string;
      links: Array<{
        urn: string;
        rel: string;
      }>;
      annotations: number[];
      dimensionGroupAttributes: {
        [key: string]: number[];
      };
      observations: {
        [key: string]: (number | null)[];
      };
    }>;
    // Add other properties from the actual response as needed
  };
}

interface TalisDataState {
  data: OECDRawData | null;
  loading: boolean;
  error: string | null;
  errorStatus: number | null;
  errorResponse: string | null;
  lastFetched: number | null;
}

const initialState: TalisDataState = {
  data: null,
  loading: false,
  error: null,
  errorStatus: null,
  errorResponse: null,
  lastFetched: null,
};

// Create an async thunk for fetching OECD data
export const fetchOecdData = createAsyncThunk<
  OECDRawData,
  string,
  { rejectValue: { message: string; status?: number; response?: string } }
>("talisData/fetchOecdData", async (url, { rejectWithValue }) => {
  try {
    const response = await axios.get<OECDRawData>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching OECD data:", error);

    if (axios.isAxiosError(error)) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
    }

    return rejectWithValue({
      message:
        error instanceof Error ? error.message : "Failed to fetch OECD data",
    });
  }
});

const talisDataSlice = createSlice({
  name: "talisData",
  initialState,
  reducers: {
    clearTalisData: (state) => {
      state.data = null;
      state.error = null;
      state.errorStatus = null;
      state.errorResponse = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOecdData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOecdData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchOecdData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch OECD data";
        state.errorStatus = action.payload?.status || null;
        state.errorResponse = action.payload?.response || null;
      });
  },
});

export const { clearTalisData } = talisDataSlice.actions;

export const selectTalisData = (state: { talisData: TalisDataState }) =>
  state.talisData.data;
export const selectTalisLoading = (state: { talisData: TalisDataState }) =>
  state.talisData.loading;
export const selectTalisError = (state: { talisData: TalisDataState }) =>
  state.talisData.error;
export const selectLastFetched = (state: { talisData: TalisDataState }) =>
  state.talisData.lastFetched;

export default talisDataSlice.reducer;
