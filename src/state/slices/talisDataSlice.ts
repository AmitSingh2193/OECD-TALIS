import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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
  lastFetched: number | null;
}

const initialState: TalisDataState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Create an async thunk for fetching OECD data
export const fetchOecdData = createAsyncThunk<OECDRawData, void, { rejectValue: string }>(
  'talisData/fetchOecdData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<OECDRawData>(
        `https://sdmx.oecd.org/public/rest/data/OECD.EDU.IMEP,DSD_EAG_UOE_NON_FIN_PERS@DF_UOE_NF_PERS_CLS,1.0/.......A......_T.?startPeriod=2022&endPeriod=2023&dimensionAtObservation=AllDimensions&format=jsondata`,
        
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching OECD data:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch OECD data'
      );
    }
  }
);

const talisDataSlice = createSlice({
  name: 'talisData',
  initialState,
  reducers: {
    clearTalisData: (state) => {
      state.data = null;
      state.error = null;
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
        state.error = action.payload || 'Failed to fetch OECD data';
      });
  },
});

export const { clearTalisData } = talisDataSlice.actions;

export const selectTalisData = (state: { talisData: TalisDataState }) => state.talisData.data;
export const selectTalisLoading = (state: { talisData: TalisDataState }) => state.talisData.loading;
export const selectTalisError = (state: { talisData: TalisDataState }) => state.talisData.error;
export const selectLastFetched = (state: { talisData: TalisDataState }) => state.talisData.lastFetched;

export default talisDataSlice.reducer;