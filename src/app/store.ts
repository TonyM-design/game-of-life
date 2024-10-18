

import { configureStore } from '@reduxjs/toolkit'
import gridParametersReducer from './components/lateralPanels/reducers/gridParametersReducer'
import controllerParameterReducer from './components/lateralPanels/reducers/controllerParameterReducer'
import infoParametersReducer from './components/lateralPanels/reducers/infoParametersReducer'
import globalGameReducer from './components/lateralPanels/reducers/globalGameReducer'
export const store = configureStore({
    reducer: {
        grid : gridParametersReducer,
        game : controllerParameterReducer,
        info : infoParametersReducer,
        global : globalGameReducer
    },
  })
  
  export type RootState = ReturnType<typeof store.getState>
  export type AppDispatch = typeof store.dispatch