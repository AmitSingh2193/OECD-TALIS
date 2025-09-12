import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import limeSurveyReducer from './slices/limeSurveySlice'
// import productReducer from './slices/productSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    limeSurvey: limeSurveyReducer,
    // products: productReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch