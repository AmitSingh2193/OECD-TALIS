import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post_req } from '@/network/network';
import { decodeBase64 } from '@/lib/encoding';

interface SessionKeyResponse {
  result: string;
  id: number;
}

export interface Question {
  id: string | number;
  question: string;
  title: string;
  type?: string;
  mandatory?: string;
  question_order?: number;
  [key: string]: any;
}

interface SurveyAnswerResponse {
  id: string;
  [key: string]: string | number | null | undefined;
}

interface LimeSurveyState {
  sessionKey: string | null;
  loading: boolean;
  error: string | null;
  surveyResponse: SurveyAnswerResponse | null;
  surveyQuestions: Question[];
  isLoadingResponses: boolean;
  isLoadingQuestions: boolean;
  responsesError: string | null;
  questionsError: string | null;
}

const initialState: LimeSurveyState = {
  sessionKey: null,
  loading: false,
  error: null,
  surveyResponse: null,
  surveyQuestions: [],
  isLoadingResponses: false,
  isLoadingQuestions: false,
  responsesError: null,
  questionsError: null,
};

export const fetchSurveyResponses = createAsyncThunk<
  SurveyAnswerResponse | null,
  { sessionKey: string; surveyId: string; proxyUrl: string; targetUrl: string; responseId: string },
  { rejectValue: string }
>(
  'limeSurvey/fetchSurveyResponses',
  async ({ sessionKey, surveyId, proxyUrl, targetUrl, responseId }, { rejectWithValue }) => {
    try {
      const response = await post_req<{ result: string }>(
        proxyUrl + targetUrl,
        {
          method: 'export_responses',
          params: [sessionKey, surveyId, 'json'],
          id: 1,
        },
        {
          'Content-Type': 'application/json',
        }
      );

      if (response.data?.result) {
        const decodedData = decodeBase64(response.data.result);
        const parsedData = JSON.parse(decodedData);
        const answers = parsedData.responses.filter((item: any) => item.id === responseId);
        return answers[0] || null;
      }
      return rejectWithValue('Failed to get survey response');
    } catch (error) {
      console.error('Error fetching survey response:', error);
      return rejectWithValue('An error occurred while fetching the survey response');
    }
  }
);

export const fetchSurveyQuestions = createAsyncThunk<
  Question[],
  { sessionKey: string; surveyId: string; proxyUrl: string; targetUrl: string },
  { rejectValue: string }
>(
  'limeSurvey/fetchSurveyQuestions',
  async ({ sessionKey, surveyId, proxyUrl, targetUrl }, { rejectWithValue }) => {
    try {
      const response = await post_req<{ result: any }>(
        proxyUrl + targetUrl,
        {
          method: 'list_questions',
          params: [sessionKey, surveyId],
          id: 1,
        },
        {
          'Content-Type': 'application/json',
        }
      );

      if (response.data?.result) {
        // Transform the response into the Question type
        const questions = (Array.isArray(response.data.result) 
          ? response.data.result 
          : [response.data.result]
        ).map(item => ({
          id: item.qid || item.id || '',
          question: item.question || '',
          title: item.title || item.name || '',
          type: item.type,
          mandatory: item.mandatory,
          question_order: item.question_order,
          ...item
        }));
        
        return questions;
      }
      return rejectWithValue('Failed to get survey questions');
    } catch (error) {
      console.error('Error fetching survey questions:', error);
      return rejectWithValue('An error occurred while fetching survey questions');
    }
  }
);

export const fetchSessionKey = createAsyncThunk<
  string,
  { username: string; remoteToken: string; targetUrl: string },
  { rejectValue: string }
>(
  'limeSurvey/fetchSessionKey',
  async ({ username, remoteToken, targetUrl }, { rejectWithValue }) => {
    try {
      const proxyUrl = "https://cors-anywhere.herokuapp.com/"
      const response = await post_req<SessionKeyResponse>(
        proxyUrl + targetUrl,
        {
          method: 'get_session_key',
          params: [username, remoteToken],
          id: 1,
        },
        {
          'Content-Type': 'application/json',
        }
      );

      if (response.data?.result) {
        return response.data.result;
      }
      return rejectWithValue('Failed to get session key');
    } catch (error) {
      console.error('Error fetching session key:', error);
      return rejectWithValue('An error occurred while fetching the session key');
    }
  }
);

const limeSurveySlice = createSlice({
  name: 'limeSurvey',
  initialState,
  reducers: {
    clearSessionKey: (state) => {
      state.sessionKey = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionKey.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionKey = action.payload;
      })
      .addCase(fetchSessionKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch session key';
      })
      .addCase(fetchSurveyResponses.pending, (state) => {
        state.isLoadingResponses = true;
        state.responsesError = null;
      })
      .addCase(fetchSurveyResponses.fulfilled, (state, action) => {
        state.isLoadingResponses = false;
        state.surveyResponse = action.payload;
      })
      .addCase(fetchSurveyResponses.rejected, (state, action) => {
        state.isLoadingResponses = false;
        state.responsesError = action.payload || 'Failed to fetch survey responses';
      })
      .addCase(fetchSurveyQuestions.pending, (state) => {
        state.isLoadingQuestions = true;
        state.questionsError = null;
      })
      .addCase(fetchSurveyQuestions.fulfilled, (state, action) => {
        state.isLoadingQuestions = false;
        state.surveyQuestions = action.payload;
      })
      .addCase(fetchSurveyQuestions.rejected, (state, action) => {
        state.isLoadingQuestions = false;
        state.questionsError = action.payload || 'Failed to fetch survey questions';
      });
  },
});

export const { clearSessionKey } = limeSurveySlice.actions;
export default limeSurveySlice.reducer;
