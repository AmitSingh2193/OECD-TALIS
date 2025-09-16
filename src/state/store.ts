import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import limeSurveyReducer from './slices/limeSurveySlice';
import talisDataReducer from './slices/talisDataSlice';
// import productReducer from './slices/productSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    limeSurvey: limeSurveyReducer,
    talisData: talisDataReducer,
    // products: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;