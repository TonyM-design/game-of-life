

import { configureStore } from '@reduxjs/toolkit'
import gridParametersReducer from './reducers/gridParametersReducer'
import controllerParameterReducer from './reducers/controllerParameterReducer'
import infoParametersReducer from './reducers/infoParametersReducer'
import globalGameReducer from './reducers/globalGameReducer'
export const store = configureStore({
    reducer: {
        grid : gridParametersReducer,
        game : controllerParameterReducer,
        info : infoParametersReducer,
        global : globalGameReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
  })
  
  export type RootState = ReturnType<typeof store.getState>
  export type AppDispatch = typeof store.dispatch